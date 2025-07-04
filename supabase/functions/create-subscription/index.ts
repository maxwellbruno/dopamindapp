
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
    // Check if required environment variables are set
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY is not configured');
      return new Response(JSON.stringify({ error: 'Payment service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // Create or get Paystack plan
    console.log('Creating Paystack plan...', { 
      planName: plan.name, 
      planId, 
      amount: plan.price_cents, 
      currency: plan.currency 
    });
    let planCode = planId;
    
    // Convert to kobo (smallest unit for NGN)
    const amountInKobo = plan.price_cents;
    console.log('Amount in kobo:', amountInKobo);
    
    const createPlanResponse = await fetch('https://api.paystack.co/plan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${plan.name} - ${planId}`,
        interval: plan.interval,
        amount: amountInKobo,
        currency: 'NGN',
      }),
    });

    const planCreateData = await createPlanResponse.json();
    console.log('Plan creation response:', planCreateData);

    if (createPlanResponse.ok && planCreateData.data?.plan_code) {
      planCode = planCreateData.data.plan_code;
      console.log('Plan created successfully:', planCode);
    } else if (planCreateData.message?.includes('Plan name already exists')) {
      console.log('Plan already exists, using existing plan');
      // Get all plans and find the one with matching name
      const existingPlanResponse = await fetch('https://api.paystack.co/plan', {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        },
      });
      const existingPlanData = await existingPlanResponse.json();
      if (existingPlanData.data && existingPlanData.data.length > 0) {
        const matchingPlan = existingPlanData.data.find((p: any) => p.name === `${plan.name} - ${planId}`);
        if (matchingPlan) {
          planCode = matchingPlan.plan_code;
        }
      }
    } else {
      console.error('Failed to create Paystack plan:', planCreateData);
      return new Response(JSON.stringify({ error: `Failed to create plan: ${planCreateData.message || 'Unknown error'}` }), {
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
        amount: amountInKobo,
        currency: 'NGN',
        plan: planCode,
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
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Check edge function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
