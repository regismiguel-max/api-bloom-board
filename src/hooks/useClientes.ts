import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mockClientes } from "@/lib/mockData";

export interface Cliente {
  id?: string | number;
  CODIGO_CLIENTE?: number;
  nome?: string;
  name?: string;
  NOME_CLIENTE?: string;
  email?: string;
  CPF_CNPJ?: string;
  telefone?: string;
  phone?: string;
  CELULAR?: string;
  ENDERECO?: string;
  BAIRRO?: string;
  CIDADE?: string;
  UF?: string;
  CEP?: string;
  DATA_CADASTRO?: string;
  ULTIMA_COMPRA?: string;
  TOTAL_COMPRAS?: number;
  TOTAL_VENDAS?: number;
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
