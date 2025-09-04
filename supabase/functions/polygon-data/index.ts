import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PolygonRequest {
  endpoint: string;
  symbol?: string;
  timeframe?: string;
  from?: string;
  to?: string;
  limit?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const polygonApiKey = Deno.env.get('POLYGON_API_KEY');
    
    if (!polygonApiKey) {
      console.error('Polygon API key not found');
      return new Response(
        JSON.stringify({ error: 'Polygon API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { endpoint, symbol, timeframe, from, to, limit }: PolygonRequest = await req.json();

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Endpoint is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let url = `https://api.polygon.io${endpoint}`;
    const params = new URLSearchParams({ apikey: polygonApiKey });

    // Add parameters based on endpoint type
    if (symbol) params.append('symbol', symbol);
    if (timeframe) params.append('timespan', timeframe);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (limit) params.append('limit', limit.toString());

    url += `?${params.toString()}`;

    console.log('Calling Polygon API:', url.replace(polygonApiKey, '[API_KEY]'));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Polygon API error:', response.status, errorData);
      return new Response(
        JSON.stringify({ 
          error: `Polygon API error: ${response.status}`,
          details: errorData 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('Polygon API response received successfully');

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in polygon-data function:', error);
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