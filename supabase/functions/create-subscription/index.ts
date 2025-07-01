
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSubscriptionRequest {
  planId: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { planId, email }: CreateSubscriptionRequest = await req.json();
    console.log('Creating subscription for plan:', planId, 'User email:', email);

    // Get the subscription plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('Plan error:', planError);
      return new Response(JSON.stringify({ error: 'Plan not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found plan:', plan);

    // Create Paystack customer
    console.log('Creating Paystack customer...');
    const customerResponse = await fetch('https://api.paystack.co/customer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
        last_name: user.user_metadata?.full_name?.split(' ')[1] || '',
      }),
    });

    const customerData = await customerResponse.json();
    
    if (!customerResponse.ok) {
      console.error('Paystack customer creation failed:', customerData);
      return new Response(JSON.stringify({ error: 'Failed to create customer' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Customer created:', customerData.data.customer_code);

    // Create Paystack plan (without plan_code parameter)
    console.log('Creating Paystack plan...');
    const createPlanResponse = await fetch('https://api.paystack.co/plan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: plan.name,
        interval: plan.interval,
        amount: plan.price_cents,
        currency: 'NGN', // Always use NGN for Paystack
      }),
    });

    const planCreateData = await createPlanResponse.json();
    console.log('Plan creation response:', planCreateData);

    if (!createPlanResponse.ok && planCreateData.message !== 'Plan name already exists') {
      console.error('Failed to create Paystack plan:', planCreateData);
      return new Response(JSON.stringify({ error: 'Failed to create plan' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize transaction for subscription with trial period
    console.log('Initializing transaction...');
    const transactionResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        amount: plan.price_cents,
        currency: 'NGN',
        plan: planCreateData.data?.plan_code || planId,
        callback_url: `${req.headers.get('origin')}/profile`,
        metadata: {
          user_id: user.id,
          plan_id: planId,
          customer_code: customerData.data.customer_code,
          trial_days: 7, // 7-day free trial
        },
      }),
    });

    const transactionData = await transactionResponse.json();
    console.log('Transaction response:', transactionData);

    if (!transactionResponse.ok) {
      console.error('Transaction initialization failed:', transactionData);
      return new Response(JSON.stringify({ error: transactionData.message || 'Failed to initialize transaction' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store customer info in our database
    const { error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: planId,
        paystack_customer_id: customerData.data.customer_code,
        status: 'pending',
      });

    if (subscriptionError) {
      console.error('Failed to store subscription:', subscriptionError);
    }

    console.log('Subscription creation successful, returning checkout URL');
    return new Response(JSON.stringify({
      checkout_url: transactionData.data.authorization_url,
      reference: transactionData.data.reference,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-subscription function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
