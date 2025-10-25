const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const estoqueMin = url.searchParams.get('estoque_min');
    const estoqueMax = url.searchParams.get('estoque_max');

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
    if (estoqueMin) apiParams.append('estoque_min', estoqueMin);
    if (estoqueMax) apiParams.append('estoque_max', estoqueMax);

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

    // Always compute total count with a dedicated request to avoid capped totals
    const items = Array.isArray(data) ? data : (data.estoque || []);

    let totalCount = 0;
    try {
      let countUrl = `http://24.152.15.254:8000/estoque`;
      const countParams = new URLSearchParams();
      countParams.append('limite', '0');
      if (codigoProduto) countParams.append('codigo_produto', codigoProduto);
      if (nomeProduto) countParams.append('nome_produto', nomeProduto);
      if (estoqueMin) countParams.append('estoque_min', estoqueMin);
      if (estoqueMax) countParams.append('estoque_max', estoqueMax);
      countUrl += `?${countParams.toString()}`;
      console.log('Fetching estoque total count from:', countUrl);
      const countRes = await fetch(countUrl, { method: 'GET', headers });
      if (countRes.ok) {
        const countData = await countRes.json();
        totalCount = Array.isArray(countData) ? countData.length : (countData.estoque?.length || 0);
      } else {
        console.warn('Count request failed with status', countRes.status);
        // Fallback to available hints
        totalCount = (typeof (data as any).total === 'number') ? Number((data as any).total) : items.length;
      }
    } catch (e) {
      console.warn('Count request error:', e instanceof Error ? e.message : e);
      totalCount = (typeof (data as any).total === 'number') ? Number((data as any).total) : items.length;
    }

    const formattedResponse = {
      estoque: items,
      total: totalCount,
      page: parseInt(page),
      limit: limite ? 0 : parseInt(limit),
      hasMore: (parseInt(page) * parseInt(limit)) < totalCount,
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
