import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mockVendas } from "@/lib/mockData";

export interface Venda {
  id?: string | number;
  cliente_id?: string | number;
  customer_id?: string | number;
  valor?: number;
  total?: number;
  price?: number;
  data?: string;
  date?: string;
  created_at?: string;
  status?: string;
  produto?: string;
  product?: string;
  categoria?: string;
  category?: string;
  [key: string]: any;
}

export const useVendas = () => {
  return useQuery({
    queryKey: ["vendas"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('api-vendas');
      
      if (error) {
        console.error('Error fetching vendas:', error);
        console.log('Using mock data as fallback');
        return mockVendas;
      }
      
      // Se a API retornar array vazio, usar dados mock para demonstração
      const vendasData = Array.isArray(data) ? data : [];
      if (vendasData.length === 0) {
        console.log('API returned empty array, using mock data');
        return mockVendas;
      }
      
      return vendasData as Venda[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
