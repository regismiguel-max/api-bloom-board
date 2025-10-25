import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const limite = url.searchParams.get('limite');
    const codigoProduto = url.searchParams.get('codigo_produto');
    const nomeProduto = url.searchParams.get('nome_produto');

    let apiUrl = `http://24.152.15.254:8000/estoque`;
    const apiParams = new URLSearchParams();

    if (limite !== null) {
      apiParams.append('limite', limite);
    } else {
      apiParams.append('page', page);
      apiParams.append('limit', limit);
    }

    if (codigoProduto) apiParams.append('codigo_produto', codigoProduto);
    if (nomeProduto) apiParams.append('nome_produto', nomeProduto);

    if (apiParams.toString()) {
      apiUrl += `?${apiParams.toString()}`;
    }

    console.log('Fetching estoque from:', apiUrl);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const apiToken = Deno.env.get('API_TOKEN');
    if (apiToken) {
      headers['Authorization'] = `Bearer ${apiToken}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    console.log('API Response - Total:', data.total, 'Items:', Array.isArray(data) ? data.length : (data.estoque?.length || 0));

    const formattedResponse = {
      estoque: Array.isArray(data) ? data : (data.estoque || []),
      total: data.total || (Array.isArray(data) ? data.length : 0),
      page: parseInt(page),
      limit: limite ? 0 : parseInt(limit),
      hasMore: data.hasMore || false,
    };

    return new Response(JSON.stringify(formattedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in api-estoque function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        estoque: [],
        total: 0,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
