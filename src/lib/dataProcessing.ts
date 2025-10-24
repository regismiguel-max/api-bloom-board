import { Venda } from "@/hooks/useVendas";
import { Cliente } from "@/hooks/useClientes";

export const calculateTotalRevenue = (vendas: Venda[]) => {
  if (!vendas || vendas.length === 0) return 0;
  const total = vendas.reduce((sum, venda) => {
    const valor = venda.TOTAL_PEDIDO || venda.valor || venda.total || venda.price || 0;
    return sum + Number(valor);
  }, 0);
  return total;
};

export const calculateMonthlyRevenue = (vendas: Venda[]) => {
  const monthlyData: { [key: string]: number } = {};
  
  vendas.forEach((venda) => {
    const dateStr = venda.DATA_VENDA || venda.data || venda.date || venda.created_at;
    if (!dateStr) return;
    
    // Parse DD/MM/YYYY format
    const dateParts = dateStr.includes('/') ? dateStr.split('/') : null;
    const date = dateParts 
      ? new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]))
      : new Date(dateStr);
    
    const monthKey = date.toLocaleDateString("pt-BR", { month: "short" });
    const valor = venda.TOTAL_PEDIDO || venda.valor || venda.total || venda.price || 0;
    
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(valor);
  });

  return Object.entries(monthlyData).map(([month, revenue]) => ({
    month,
    revenue: Math.round(revenue),
  }));
};

export const calculateSalesByCategory = (vendas: Venda[]) => {
  const categoryData: { [key: string]: number } = {};
  
  vendas.forEach((venda) => {
    const category = venda.PRODUTO_MARCA || venda.categoria || venda.category || venda.produto || "Outros";
    const valor = venda.TOTAL_PEDIDO || venda.valor || venda.total || venda.price || 1;
    
    categoryData[category] = (categoryData[category] || 0) + Number(valor);
  });

  return Object.entries(categoryData)
    .map(([category, sales]) => ({
      category,
      sales: Math.round(sales),
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 6);
};

export const getRecentOrders = (vendas: Venda[], clientes: Cliente[]) => {
  if (!vendas || !clientes || vendas.length === 0) return [];
  
  const clienteMap = new Map(
    clientes.map((c) => [
      c.CODIGO_CLIENTE || c.id, 
      c.NOME_CLIENTE || c.nome || c.name || "Cliente"
    ])
  );
  
  return vendas
    .slice()
    .sort((a, b) => {
      const dateStrA = a.DATA_VENDA || a.data || a.date || a.created_at || '';
      const dateStrB = b.DATA_VENDA || b.data || b.date || b.created_at || '';
      
      // Parse DD/MM/YYYY format
      const parseDate = (str: string) => {
        if (!str) return new Date(0);
        const parts = str.includes('/') ? str.split('/') : null;
        return parts 
          ? new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
          : new Date(str);
      };
      
      return parseDate(dateStrB).getTime() - parseDate(dateStrA).getTime();
    })
    .slice(0, 5)
    .map((venda) => ({
      id: (venda.PEDIDO || venda.id)?.toString() || "N/A",
      customer: venda.CLIENTE_NOME || clienteMap.get(venda.CODIGO_EXP || venda.cliente_id || venda.customer_id) || "Cliente Desconhecido",
      amount: `R$ ${Number(venda.TOTAL_PEDIDO || venda.valor || venda.total || venda.price || 0).toFixed(2)}`,
      status: venda.status || "completed",
    }));
};

export const calculatePreviousMonthRevenue = (vendas: Venda[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const previousMonthRevenue = vendas.reduce((sum, venda) => {
    const dateStr = venda.DATA_VENDA || venda.data || venda.date || venda.created_at;
    if (!dateStr) return sum;
    
    const dateParts = dateStr.includes('/') ? dateStr.split('/') : null;
    const date = dateParts 
      ? new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]))
      : new Date(dateStr);
      
    if (date.getMonth() === previousMonth && date.getFullYear() === previousMonthYear) {
      const valor = venda.TOTAL_PEDIDO || venda.valor || venda.total || venda.price || 0;
      return sum + Number(valor);
    }
    return sum;
  }, 0);
  
  return previousMonthRevenue;
};

export const calculateCurrentMonthRevenue = (vendas: Venda[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const currentMonthRevenue = vendas.reduce((sum, venda) => {
    const dateStr = venda.DATA_VENDA || venda.data || venda.date || venda.created_at;
    if (!dateStr) return sum;
    
    const dateParts = dateStr.includes('/') ? dateStr.split('/') : null;
    const date = dateParts 
      ? new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]))
      : new Date(dateStr);
      
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      const valor = venda.TOTAL_PEDIDO || venda.valor || venda.total || venda.price || 0;
      return sum + Number(valor);
    }
    return sum;
  }, 0);
  
  return currentMonthRevenue;
};

export const calculateRevenueChange = (vendas: Venda[]) => {
  const current = calculateCurrentMonthRevenue(vendas);
  const previous = calculatePreviousMonthRevenue(vendas);
  
  if (previous === 0) return 0;
  
  return Number((((current - previous) / previous) * 100).toFixed(1));
};
