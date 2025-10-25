import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ItemEstoque {
  id?: string | number;
  CODIGO_PRODUTO?: string;
  NOME_PRODUTO?: string;
  QUANTIDADE?: number;
  ESTOQUE_MINIMO?: number;
  ESTOQUE_MAXIMO?: number;
  VALOR_UNITARIO?: number;
  CATEGORIA?: string;
  MARCA?: string;
  FORNECEDOR?: string;
  LOCALIZACAO?: string;
  [key: string]: any;
}

interface EstoqueFilters {
  codigoProduto?: string;
  nomeProduto?: string;
  page?: number;
  limit?: number;
}

const fetchEstoque = async (filters?: EstoqueFilters) => {
  const queryParams = new URLSearchParams();
  
  if (filters?.page) queryParams.append("page", filters.page.toString());
  if (filters?.limit) queryParams.append("limit", filters.limit.toString());
  if (filters?.codigoProduto) queryParams.append("codigo_produto", filters.codigoProduto);
  if (filters?.nomeProduto) queryParams.append("nome_produto", filters.nomeProduto);

  const { data, error } = await supabase.functions.invoke(
    `api-estoque?${queryParams.toString()}`,
    { method: "GET" }
  );

  if (error) {
    console.error("Error fetching estoque:", error);
    throw new Error(`Failed to fetch estoque: ${error.message}`);
  }

  console.log(`✅ Fetched: ${data.estoque?.length || 0} itens de estoque (page ${filters?.page || 1})`);
  
  return {
    estoque: data.estoque || [],
    total: data.total || 0,
    page: data.page || 1,
    limit: data.limit || 10,
    hasMore: data.hasMore || false,
  };
};

export const useEstoque = (filters?: EstoqueFilters) => {
  return useQuery({
    queryKey: ["estoque", filters],
    queryFn: () => fetchEstoque(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
