import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mockVendas } from "@/lib/mockData";

export interface Venda {
  id?: string | number;
  PEDIDO?: string;
  cliente_id?: string | number;
  customer_id?: string | number;
  CODIGO_EXP?: number;
  CLIENTE_NOME?: string;
  CLIENTE_DOC?: string;
  valor?: number;
  total?: number;
  price?: number;
  TOTAL_PEDIDO?: number;
  data?: string;
  date?: string;
  created_at?: string;
  DATA_VENDA?: string;
  DATA_PEDIDO?: string;
  DATA_ENTREGA?: string;
  status?: string;
  produto?: string;
  product?: string;
  NOME_PRODUTO?: string;
  categoria?: string;
  category?: string;
  PRODUTO_MARCA?: string;
  VENDEDOR_NOME?: string;
  QTDE_ITENS_PEDIDO?: number;
  [key: string]: any;
}

interface VendasFilters {
  dataInicio?: string;
  dataFim?: string;
}

// Função para buscar todas as páginas recursivamente
const fetchAllVendas = async (filters?: VendasFilters): Promise<Venda[]> => {
  const allVendas: Venda[] = [];
  let page = 1;
  let hasMore = true;
  const limit = 100;

  while (hasMore) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.dataInicio) queryParams.append("data_inicio", filters.dataInicio);
    if (filters?.dataFim) queryParams.append("data_fim", filters.dataFim);

    const { data, error } = await supabase.functions.invoke(
      `api-vendas?${queryParams.toString()}`,
      { method: "GET" }
    );

    if (error) {
      console.error(`Error fetching vendas page ${page}:`, error);
      throw new Error(`Failed to fetch vendas: ${error.message}`);
    }

    const vendas = data.vendas || [];
    allVendas.push(...vendas);

    console.log(
      `Page ${page}: ${vendas.length} registros (acumulado: ${allVendas.length}). hasMore sinalizado: ${vendas.length === limit}`
    );

    // Continuar enquanto a página vier cheia (padrão more pages)
    hasMore = vendas.length === limit;
    page++;

    // Limite de segurança para evitar loops infinitos
    if (page > 1000) {
      console.warn("Reached maximum page limit (1000)");
      break;
    }
  }

  console.log(`✅ Fetched total: ${allVendas.length} registros`);
  return allVendas;
};

export const useVendas = (filters?: VendasFilters) => {
  return useQuery({
    queryKey: ["vendas", filters],
    queryFn: async () => {
      try {
        const vendas = await fetchAllVendas(filters);
        
        // Se a API retornar array vazio, usar dados mock para demonstração
        if (vendas.length === 0) {
          console.log('API returned empty array, using mock data');
          return mockVendas;
        }
        
        return vendas;
      } catch (error) {
        console.error('Error fetching vendas:', error);
        console.log('Using mock data as fallback');
        return mockVendas;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
