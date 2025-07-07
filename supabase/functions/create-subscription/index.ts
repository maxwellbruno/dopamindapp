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
  console.log('=== CREATE SUBSCRIPTION FUNCTION STARTED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if required environment variables are set
    console.log('Checking environment variables...');
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasPaystackKey: !!paystackSecretKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });
    
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY is not configured');
      return new Response(JSON.stringify({ error: 'Payment service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized: ' + (userError?.message || 'No user found') }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User authenticated successfully:', { userId: user.id, email: user.email });

    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', requestBody);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { planId, email }: CreateSubscriptionRequest = requestBody;
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

    // Create or use KES-specific Paystack plans
    console.log('Setting up KES subscription for:', planId);
    
    // Get plan pricing from our database
    const planPricing = {
      'pro': { amount: 69900, name: 'Dopamind Pro' }, // KES 699 in kobo
      'elite': { amount: 149900, name: 'Dopamind Elite' } // KES 1,499 in kobo
    };

    const currentPlan = planPricing[planId as keyof typeof planPricing];
    if (!currentPlan) {
      console.error('Unknown plan ID:', planId);
      return new Response(JSON.stringify({ error: 'Invalid plan selected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Using KES pricing:', currentPlan);

    // Initialize transaction for one-time payment (7-day trial handled differently)
    console.log('Initializing KES transaction...');
    const transactionResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        amount: currentPlan.amount, // Amount in kobo (KES cents)
        currency: 'KES',
        callback_url: `${req.headers.get('origin')}/profile`,
        metadata: {
          user_id: user.id,
          plan_id: planId,
          customer_code: customerData.data.customer_code,
          subscription_type: 'monthly',
          trial_period: 7, // For our internal tracking
        },
        channels: ['card', 'bank', 'ussd', 'mobile_money'], // Enable mobile money for Kenya
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
    console.error('=== ERROR IN CREATE-SUBSCRIPTION FUNCTION ===');
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      type: typeof error
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Check edge function logs for more information',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);