
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
      case 'charge.success':
        await handleChargeSuccess(supabaseClient, event.data);
        break;
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

async function handleChargeSuccess(supabaseClient: any, data: any) {
  console.log('Processing charge success for KES subscription');
  
  const { metadata, customer, amount, currency, paid_at } = data;
  
  if (!metadata?.user_id || !metadata?.plan_id) {
    console.error('Missing required metadata in charge.success event');
    return;
  }

  if (currency !== 'KES') {
    console.error('Unexpected currency in charge.success:', currency);
    return;
  }

  console.log('Setting up trial subscription for user:', metadata.user_id, 'Plan:', metadata.plan_id);
  
  // Calculate trial period (7 days from now)
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 7);
  
  // Update subscription with trial status
  const { error } = await supabaseClient
    .from('subscriptions')
    .upsert({
      user_id: metadata.user_id,
      plan_id: metadata.plan_id,
      paystack_customer_id: customer.customer_code,
      status: 'trialing', // Start with trial status
      current_period_start: new Date().toISOString(),
      current_period_end: trialEndDate.toISOString(),
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Failed to create trial subscription:', error);
  } else {
    console.log('Trial subscription created successfully');
    console.log('User:', metadata.user_id);
    console.log('Plan:', metadata.plan_id);
    console.log('Trial ends:', trialEndDate.toISOString());
    console.log('Amount paid:', amount, currency);
  }
}

serve(handler);
