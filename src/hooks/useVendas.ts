import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = "http://24.152.15.254:8000";

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
      const response = await fetch(`${API_BASE_URL}/vendas`);
      if (!response.ok) {
        throw new Error("Failed to fetch vendas");
      }
      const data = await response.json();
      return data as Venda[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
