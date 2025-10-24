import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Cliente {
  id?: string | number;
  nome?: string;
  email?: string;
  telefone?: string;
  [key: string]: any;
}

export const useClientes = () => {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('api-clientes');
      
      if (error) {
        console.error('Error fetching clientes:', error);
        throw new Error(`Failed to fetch clientes: ${error.message}`);
      }
      
      return data as Cliente[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
