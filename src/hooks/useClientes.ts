import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mockClientes } from "@/lib/mockData";

export interface Cliente {
  id?: string | number;
  nome?: string;
  name?: string;
  email?: string;
  telefone?: string;
  phone?: string;
  [key: string]: any;
}

export const useClientes = () => {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('api-clientes');
      
      if (error) {
        console.error('Error fetching clientes:', error);
        console.log('Using mock data as fallback');
        return mockClientes;
      }
      
      // Se a API retornar array vazio, usar dados mock para demonstração
      const clientesData = Array.isArray(data) ? data : [];
      if (clientesData.length === 0) {
        console.log('API returned empty array, using mock data');
        return mockClientes;
      }
      
      return clientesData as Cliente[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
