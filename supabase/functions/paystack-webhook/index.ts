
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify webhook signature
    const hash = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(Deno.env.get('PAYSTACK_SECRET_KEY') + body)
    );
    const expectedSignature = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { status: 401, headers: corsHeaders });
    }

    const event = JSON.parse(body);
    console.log('Received webhook event:', event.event, event.data);

    switch (event.event) {
      case 'subscription.create':
      case 'subscription.enable':
        await handleSubscriptionActivated(supabaseClient, event.data);
        break;
      case 'subscription.disable':
        await handleSubscriptionCancelled(supabaseClient, event.data);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabaseClient, event.data);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Error in paystack-webhook function:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
};

async function handleSubscriptionActivated(supabaseClient: any, data: any) {
  const { customer, plan, subscription_code, next_payment_date } = data;
  
  // Find user by customer code
  const { data: existingSubscription, error: findError } = await supabaseClient
    .from('subscriptions')
    .select('user_id')
    .eq('paystack_customer_id', customer.customer_code)
    .single();

  if (findError || !existingSubscription) {
    console.error('Failed to find subscription:', findError);
    return;
  }

  const { error } = await supabaseClient
    .from('subscriptions')
    .update({
      paystack_subscription_id: subscription_code,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(next_payment_date).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', existingSubscription.user_id);

  if (error) {
    console.error('Failed to update subscription:', error);
  } else {
    console.log('Subscription activated for user:', existingSubscription.user_id);
  }
}

async function handleSubscriptionCancelled(supabaseClient: any, data: any) {
  const { subscription_code } = data;

  const { error } = await supabaseClient
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq('paystack_subscription_id', subscription_code);

  if (error) {
    console.error('Failed to cancel subscription:', error);
  } else {
    console.log('Subscription cancelled:', subscription_code);
  }
}

async function handlePaymentFailed(supabaseClient: any, data: any) {
  const { subscription } = data;

  if (subscription?.subscription_code) {
    const { error } = await supabaseClient
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('paystack_subscription_id', subscription.subscription_code);

    if (error) {
      console.error('Failed to update subscription status:', error);
    }
  }
}

serve(handler);
