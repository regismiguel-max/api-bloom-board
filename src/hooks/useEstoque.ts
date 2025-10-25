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
}

const fetchAllEstoque = async (filters?: EstoqueFilters): Promise<ItemEstoque[]> => {
  const queryParams = new URLSearchParams({
    limite: "0",
  });

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

  const estoque = data.estoque || [];
  console.log(`✅ Fetched total: ${estoque.length} itens de estoque`);
  
  return estoque;
};

export const useEstoque = (filters?: EstoqueFilters) => {
  return useQuery({
    queryKey: ["estoque", filters],
    queryFn: async () => {
      try {
        const estoque = await fetchAllEstoque(filters);
        return estoque;
      } catch (error) {
        console.error('Error fetching estoque:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
