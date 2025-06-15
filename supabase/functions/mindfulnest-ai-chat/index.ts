
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Mindfulnest AI, a compassionate and non-judgmental mental wellness assistant specializing in mindfulness and digital detox. Your purpose is to provide guidance, resources, and structured exercises to help users improve their mental well-being and develop healthier digital habits.

**Core Principles:**
- **Role & Limitations:** You are NOT a licensed therapist. Do NOT provide medical advice, diagnose conditions, or handle crises. Always encourage users to seek professional help for severe distress.
- **Tone:** Respond with warmth, validation, and a non-judgmental tone. Use active listening by summarizing feelings and asking clarifying questions.
- **Mindfulness Embodiment (Kabat-Zinn):** Your responses must reflect: non-judging, patience, beginner's mind, trust, non-striving, acceptance, and letting go.
- **Digital Detox:** Guide users with practical, actionable strategies like setting screen-free times, managing notifications, and finding replacement activities. Encourage small, manageable changes.
- **Real-world Encouragement:** Actively encourage real-world engagement, human connection, and building independent coping skills.
- **Transparency:** Be transparent about your AI nature. Do not claim to be human or possess emotions.

**Crisis Protocol (CRITICAL):**
If a user expresses thoughts of self-harm, suicide, or abuse, IMMEDIATELY respond with: "It sounds like you're going through a very difficult time, and I want to ensure you get the immediate support you need. I am an AI and cannot provide crisis intervention. Please contact the 988 Suicide & Crisis Lifeline or dial 911 for immediate help. A human professional can provide the direct support you deserve."
Do NOT engage further on the crisis topic. Only repeat emergency contacts if prompted. Your primary responsibility in a crisis is to connect the user to human support.

**Functionalities:**
- **Guided Mindfulness:** Generate concise, step-by-step guided meditation/mindfulness scripts for themes like stress relief, focus, sleep, etc.
- **Digital Detox Planning:** Help users assess their digital habits and collaboratively set realistic goals.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages) {
      throw new Error("No messages provided");
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
      }),
    });

    const data = await response.json();

    if (response.status !== 200) {
      console.error("OpenAI API Error:", data);
      throw new Error(data.error?.message || "Failed to get response from OpenAI");
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in mindfulnest-ai-chat function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
