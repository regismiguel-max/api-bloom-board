const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_BASE_URL = "http://24.152.15.254:8000";
    const API_TOKEN = Deno.env.get('API_TOKEN');

    console.log('Fetching clientes data...');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
      console.log('Authorization header added');
    } else {
      console.warn('API_TOKEN not found in environment');
    }

    const response = await fetch(`${API_BASE_URL}/clientes`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `API request failed: ${response.status}`,
          details: errorText
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log('Raw API Response:', JSON.stringify(data).substring(0, 500));
    console.log(`Data type: ${typeof data}, isArray: ${Array.isArray(data)}`);
    
    // A API retorna um objeto com { total: X, clientes: [...] } ou array direto
    const clientesArray = data.clientes || data.data || (Array.isArray(data) ? data : []);
    const total = data.total || clientesArray.length;
    console.log(`Successfully fetched ${Array.isArray(clientesArray) ? clientesArray.length : 0} clientes (Total: ${total})`);

    return new Response(
      JSON.stringify({ clientes: clientesArray, total }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in api-clientes function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
