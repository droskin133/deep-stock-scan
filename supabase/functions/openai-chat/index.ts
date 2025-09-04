import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  input: string;
  context?: string;
  symbols?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const openaiModel = Deno.env.get('OPENAI_MODEL') || 'gpt-5-mini-2025-08-07';

    if (!openaiApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { input, context, symbols }: ChatRequest = await req.json();

    if (!input) {
      return new Response(
        JSON.stringify({ error: 'Input is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing AI request:', { input, context, symbols });

    // Create system prompt for financial assistant
    const systemPrompt = `You are a sophisticated financial AI assistant specialized in stock market analysis, trading insights, and investment guidance. 

Key capabilities:
- Analyze stocks, market trends, and financial data
- Provide technical and fundamental analysis insights
- Explain complex financial concepts in plain English
- Generate actionable investment recommendations
- Parse and interpret financial news and events
- Create alerts and monitoring suggestions

Guidelines:
- Always provide clear, concise, and actionable responses
- Include relevant disclaimers when giving investment advice
- Focus on data-driven insights and analysis
- Be helpful but never guarantee investment outcomes
- When discussing specific stocks, provide balanced perspectives

${context ? `Additional context: ${context}` : ''}
${symbols?.length ? `Focus on these symbols: ${symbols.join(', ')}` : ''}`;

    // Prepare API request based on model capabilities
    const apiBody: any = {
      model: openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
      ],
    };

    // Use appropriate token parameter based on model
    if (openaiModel.includes('gpt-5') || openaiModel.includes('gpt-4.1') || openaiModel.includes('o3') || openaiModel.includes('o4')) {
      apiBody.max_completion_tokens = 1000;
      // Note: temperature not supported for these models
    } else {
      // Legacy models like gpt-4o, gpt-4o-mini
      apiBody.max_tokens = 1000;
      apiBody.temperature = 0.7;
    }

    console.log('Calling OpenAI API with model:', openaiModel);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error: ${response.status}`,
          details: errorData 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || 'No response generated';

    console.log('OpenAI response generated successfully');

    return new Response(
      JSON.stringify({ result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in openai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});