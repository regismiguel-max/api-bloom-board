import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = "http://24.152.15.254:8000";

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
      const token = import.meta.env.VITE_API_TOKEN;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/clientes`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch clientes: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data as Cliente[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
