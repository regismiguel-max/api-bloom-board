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
  const pedidosVistos = new Set<string>();
  let page = 1;
  let hasMore = true;
  const limit = 100;
  let paginasSemNovosDados = 0;

  while (hasMore) {
    // Construir query string
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (filters?.dataInicio) queryParams.append('data_inicio', filters.dataInicio);
    if (filters?.dataFim) queryParams.append('data_fim', filters.dataFim);
    
    const { data, error } = await supabase.functions.invoke(
      `api-vendas?${queryParams.toString()}`,
      { method: 'GET' }
    );
    
    if (error) {
      console.error(`Error fetching vendas page ${page}:`, error);
      throw new Error(`Failed to fetch vendas: ${error.message}`);
    }
    
    const vendas = data.vendas || [];
    const vendasAntesDeAdicionar = allVendas.length;
    
    // Verificar se há novos pedidos nesta página
    let novosPedidosNestaPagina = 0;
    vendas.forEach((venda: Venda) => {
      const pedidoId = venda.PEDIDO || venda.id?.toString();
      if (pedidoId && !pedidosVistos.has(pedidoId)) {
        pedidosVistos.add(pedidoId);
        novosPedidosNestaPagina++;
      }
      allVendas.push(venda);
    });
    
    console.log(`Page ${page}: ${vendas.length} registros, ${novosPedidosNestaPagina} novos pedidos únicos (Total: ${allVendas.length} registros, ${pedidosVistos.size} pedidos únicos)`);
    
    // Se não encontrou nenhum pedido novo, incrementar contador
    if (novosPedidosNestaPagina === 0) {
      paginasSemNovosDados++;
    } else {
      paginasSemNovosDados = 0;
    }
    
    // Parar se:
    // 1. Retornou menos registros que o limite (última página)
    // 2. Ou se 3 páginas seguidas não trouxeram novos pedidos (dados repetidos)
    hasMore = vendas.length === limit && paginasSemNovosDados < 3;
    page++;
    
    // Limite de segurança para evitar loops infinitos
    if (page > 200) {
      console.warn('Reached maximum page limit (200)');
      break;
    }
  }
  
  console.log(`✅ Fetched total: ${allVendas.length} registros de ${pedidosVistos.size} pedidos únicos`);
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
