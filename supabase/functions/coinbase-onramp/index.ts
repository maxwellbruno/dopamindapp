import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { walletAddress, amount, cryptoCurrency } = await req.json()

    if (!walletAddress || !amount || !cryptoCurrency) {
      throw new Error('Missing required parameters: walletAddress, amount, cryptoCurrency')
    }

    // Get Coinbase onramp credentials from secrets
    const appId = Deno.env.get('COINBASE_ONRAMP_APP_ID')
    const keyId = Deno.env.get('COINBASE_ONRAMP_KEY_ID')
    const privateKey = Deno.env.get('COINBASE_ONRAMP_PRIVATE_KEY')

    if (!appId || !keyId || !privateKey) {
      throw new Error('Coinbase onramp credentials not configured')
    }

    // Generate JWT for Coinbase API authentication
    const header = {
      alg: 'ES256',
      typ: 'JWT',
      kid: keyId
    }

    const payload = {
      iss: 'cdp',
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120, // 2 minutes
      sub: appId,
      uri: 'POST https://api.developer.coinbase.com/onramp/v1/buy/quote'
    }

    // For demo purposes, we'll create a redirect URL to Coinbase onramp
    // In production, you'd use proper JWT signing with the private key
    const coinbaseOnrampUrl = new URL('https://pay.coinbase.com/buy')
    coinbaseOnrampUrl.searchParams.set('appId', appId)
    coinbaseOnrampUrl.searchParams.set('destinationWallets', JSON.stringify([{
      address: walletAddress,
      blockchains: ['base'],
      assets: [cryptoCurrency.toUpperCase()]
    }]))
    coinbaseOnrampUrl.searchParams.set('handlingRequestedUrls', 'true')
    coinbaseOnrampUrl.searchParams.set('presetFiatAmount', amount.toString())
    coinbaseOnrampUrl.searchParams.set('presetCryptoAmount', '')

    console.log('Generated Coinbase onramp URL for user:', user.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        onrampUrl: coinbaseOnrampUrl.toString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in coinbase-onramp function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})