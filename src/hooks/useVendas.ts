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
  STATUS_PEDIDO?: string;
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
  statusPedido?: string;
  tipoCliente?: string;
}

// Função para buscar todas as vendas com filtro de data
const fetchAllVendas = async (filters?: VendasFilters): Promise<Venda[]> => {
  const queryParams = new URLSearchParams({
    limite: "0",
  });

  if (filters?.dataInicio) queryParams.append("data_inicio", filters.dataInicio);
  if (filters?.dataFim) queryParams.append("data_fim", filters.dataFim);
  if (filters?.statusPedido) queryParams.append("status_pedido", filters.statusPedido);
  if (filters?.tipoCliente) queryParams.append("tipo_cliente", filters.tipoCliente);

  const { data, error } = await supabase.functions.invoke(
    `api-vendas?${queryParams.toString()}`,
    { method: "GET" }
  );

  if (error) {
    console.error("Error fetching vendas:", error);
    throw new Error(`Failed to fetch vendas: ${error.message}`);
  }

  const vendas = data.vendas || [];
  console.log(`✅ Fetched total: ${vendas.length} registros`);
  
  return vendas;
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
