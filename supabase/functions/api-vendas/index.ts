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
    
    // Parse query parameters from URL
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '100';
    const limite = url.searchParams.get('limite');
    const dataInicio = url.searchParams.get('data_inicio');
    const dataFim = url.searchParams.get('data_fim');
    const statusPedido = url.searchParams.get('status_pedido');

    console.log(`Fetching vendas - Page: ${page}, Limit: ${limit}, Limite: ${limite ?? 'n/a'}, Periodo: ${dataInicio} a ${dataFim}, Status: ${statusPedido ?? 'todos'}`);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
      console.log('Authorization header added');
    } else {
      console.warn('API_TOKEN not found in environment');
    }

    // Construir URL com query params (prioriza "limite" quando presente)
    let apiUrl: string;
    if (limite !== null) {
      apiUrl = `${API_BASE_URL}/vendas?limite=${encodeURIComponent(limite)}`;
      if (dataInicio) apiUrl += `&data_inicio=${encodeURIComponent(dataInicio)}`;
      if (dataFim) apiUrl += `&data_fim=${encodeURIComponent(dataFim)}`;
      if (statusPedido) apiUrl += `&status_pedido=${encodeURIComponent(statusPedido)}`;
    } else {
      apiUrl = `${API_BASE_URL}/vendas?page=${page}&limit=${limit}`;
      if (dataInicio) apiUrl += `&data_inicio=${encodeURIComponent(dataInicio)}`;
      if (dataFim) apiUrl += `&data_fim=${encodeURIComponent(dataFim)}`;
      if (statusPedido) apiUrl += `&status_pedido=${encodeURIComponent(statusPedido)}`;
    }

    console.log('API URL:', apiUrl);

    const response = await fetch(apiUrl, {
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
    
    // A API retorna um objeto com { total: X, vendas: [...] }
    const vendasArray = data.vendas || data.data || (Array.isArray(data) ? data : []);
    const total = data.total || vendasArray.length;
    
    console.log(`Successfully fetched ${vendasArray.length} vendas (Total: ${total})`);

    // Retornar com metadados
    const responsePayload = {
      vendas: vendasArray,
      total: total,
      page: limite !== null ? 1 : parseInt(page),
      limit: limite !== null ? parseInt(limite || '0') : parseInt(limit),
      hasMore: limite !== null ? false : vendasArray.length === parseInt(limit),
    };

    return new Response(
      JSON.stringify(responsePayload),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in api-vendas function:', error);
    
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
