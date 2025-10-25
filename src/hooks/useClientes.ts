import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mockClientes } from "@/lib/mockData";

export interface Cliente {
  id?: string | number;
  CODIGO_CLIENTE?: number;
  nome?: string;
  name?: string;
  NOME_CLIENTE?: string;
  NOME?: string;
  email?: string;
  CPF_CNPJ?: string;
  NOME_GRUPO?: string;
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
  PENULTIMA_COMPRA?: string;
  TERCEIRA_COMPRA?: string;
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
      
      // Extrair array de clientes do objeto de resposta
      const clientesData = data?.clientes || (Array.isArray(data) ? data : []);
      if (clientesData.length === 0) {
        console.log('API returned empty array, using mock data');
        return mockClientes;
      }
      
      console.log(`✅ Loaded ${clientesData.length} clientes from API`);
      return clientesData as Cliente[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
    retry: 2,
  });
};
