import { useMemo } from "react";
import { Venda } from "./useVendas";

// Hook para extrair status únicos dos dados de vendas
export const useVendasStatus = (vendas: Venda[]) => {
  const statusList = useMemo(() => {
    if (!vendas || vendas.length === 0) return [];
    
    // Extrair STATUS_PEDIDO únicos
    const statusSet = new Set<string>();
    vendas.forEach((venda) => {
      const status = venda.STATUS_PEDIDO || venda.status;
      if (status && typeof status === 'string') {
        statusSet.add(status);
      }
    });
    
    const uniqueStatus = Array.from(statusSet).sort();
    console.log(`✅ Extracted ${uniqueStatus.length} unique status:`, uniqueStatus);
    
    return uniqueStatus;
  }, [vendas]);

  return statusList;
};
