import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Venda {
  id?: string | number;
  cliente_id?: string | number;
  valor?: number;
  data?: string;
  status?: string;
  produto?: string;
  categoria?: string;
  [key: string]: any;
}

export const useVendas = () => {
  return useQuery({
    queryKey: ["vendas"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('api-vendas');
      
      if (error) {
        console.error('Error fetching vendas:', error);
        throw new Error(`Failed to fetch vendas: ${error.message}`);
      }
      
      return data as Venda[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
