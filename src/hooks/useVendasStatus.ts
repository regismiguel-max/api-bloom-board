import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StatusResponse {
  status: string[];
}

const fetchVendasStatus = async (): Promise<string[]> => {
  const { data, error } = await supabase.functions.invoke(
    'api-vendas-status',
    { method: "GET" }
  );

  if (error) {
    console.error("Error fetching vendas status:", error);
    throw new Error(`Failed to fetch vendas status: ${error.message}`);
  }

  // Espera que a API retorne { status: ["PENDENTE", "CONFIRMADO", ...] }
  const statusList = (data as StatusResponse)?.status || [];
  console.log(`✅ Fetched ${statusList.length} status options`);
  
  return statusList;
};

export const useVendasStatus = () => {
  return useQuery({
    queryKey: ["vendas-status"],
    queryFn: fetchVendasStatus,
    staleTime: 1000 * 60 * 30, // 30 minutes - status não mudam com frequência
    retry: 2,
  });
};
