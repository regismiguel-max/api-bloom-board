import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ItemEstoque } from "./useEstoque";

interface EstoqueComValoresFilters {
  codigoProduto?: string;
  nomeProduto?: string;
  page?: number;
  limit?: number;
  estoqueMin?: number;
  estoqueMax?: number;
}

const fetchEstoqueComValores = async (filters?: EstoqueComValoresFilters) => {
  const queryParams = new URLSearchParams();
  
  // Buscar estoque
  if (filters?.limit === 0) {
    queryParams.append("limite", "0");
  } else {
    if (filters?.page) queryParams.append("page", filters.page.toString());
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());
  }
  
  if (filters?.codigoProduto) queryParams.append("codigo_produto", filters.codigoProduto);
  if (filters?.nomeProduto) queryParams.append("nome_produto", filters.nomeProduto);
  if (filters?.estoqueMin !== undefined) queryParams.append("estoque_min", filters.estoqueMin.toString());
  if (filters?.estoqueMax !== undefined) queryParams.append("estoque_max", filters.estoqueMax.toString());

  const { data: estoqueData, error: estoqueError } = await supabase.functions.invoke(
    `api-estoque?${queryParams.toString()}`,
    { method: "GET" }
  );

  if (estoqueError) {
    console.error("Error fetching estoque:", estoqueError);
    throw new Error(`Failed to fetch estoque: ${estoqueError.message}`);
  }

  // Buscar vendas recentes para pegar valores
  const hoje = new Date();
  const trintaDiasAtras = new Date(hoje);
  trintaDiasAtras.setDate(hoje.getDate() - 30);

  const vendasParams = new URLSearchParams({
    limite: "0",
    data_inicio: trintaDiasAtras.toISOString().split('T')[0],
    data_fim: hoje.toISOString().split('T')[0],
  });

  const { data: vendasData, error: vendasError } = await supabase.functions.invoke(
    `api-vendas?${vendasParams.toString()}`,
    { method: "GET" }
  );

  if (vendasError) {
    console.warn("Warning fetching vendas for valores:", vendasError);
  }

  // Criar mapa de valores por código de produto (pegar o valor mais recente)
  const valoresPorProduto = new Map<string, number>();
  
  if (vendasData?.vendas && Array.isArray(vendasData.vendas)) {
    // Ordenar vendas por data mais recente primeiro
    const vendasOrdenadas = [...vendasData.vendas].sort((a, b) => {
      const dataA = a.ORDEM_DATA_PEDIDO || a.DATA_PEDIDO || '';
      const dataB = b.ORDEM_DATA_PEDIDO || b.DATA_PEDIDO || '';
      return dataB.localeCompare(dataA);
    });

    vendasOrdenadas.forEach((venda: any) => {
      const codigo = venda.CODIGO_PRO;
      const valor = venda.VALOR_UNITARIO;
      
      // Só adicionar se ainda não tiver valor para esse produto (pega o mais recente)
      if (codigo && valor && !valoresPorProduto.has(codigo)) {
        valoresPorProduto.set(codigo, valor);
      }
    });
  }

  console.log(`💰 Valores encontrados para ${valoresPorProduto.size} produtos das vendas recentes`);

  // Combinar estoque com valores das vendas
  const estoqueComValores = (estoqueData.estoque || []).map((item: ItemEstoque) => {
    const valorVenda = valoresPorProduto.get(item.CODIGO_PRO || '');
    
    return {
      ...item,
      VALOR_UNITARIO: valorVenda || item.VALOR_UNITARIO || 0,
      VALOR_ORIGEM: valorVenda ? 'vendas' : (item.VALOR_UNITARIO ? 'estoque' : 'zero'),
    };
  });

  console.log(`✅ Fetched: ${estoqueComValores.length} itens de estoque com valores atualizados`);
  
  return {
    estoque: estoqueComValores,
    total: estoqueData.total || 0,
    page: estoqueData.page || 1,
    limit: estoqueData.limit || 10,
    hasMore: estoqueData.hasMore || false,
  };
};

export const useEstoqueComValores = (filters?: EstoqueComValoresFilters) => {
  return useQuery({
    queryKey: ["estoque-com-valores", filters],
    queryFn: () => fetchEstoqueComValores(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
