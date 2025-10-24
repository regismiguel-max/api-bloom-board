import { Venda } from "@/hooks/useVendas";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

// Helper para fazer parse seguro de datas
const parseDate = (dateStr: string | undefined | null): Date | null => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  // Parse DD/MM/YYYY format
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    
    const date = new Date(year, month - 1, day);
    return isValid(date) ? date : null;
  }
  
  // Try ISO format
  const date = new Date(dateStr);
  return isValid(date) ? date : null;
};

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
    const date = parseDate(dateStr);
    
    if (!date) return; // Skip invalid dates
    
    // Usar format do date-fns com locale pt-BR
    const monthKey = format(date, 'MMM', { locale: ptBR });
    const valor = venda.TOTAL_PEDIDO || venda.valor || venda.total || venda.price || 0;
    
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(valor);
  });

  // Ordenar meses cronologicamente
  const monthOrder = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  
  return Object.entries(monthlyData)
    .sort(([a], [b]) => monthOrder.indexOf(a.toLowerCase()) - monthOrder.indexOf(b.toLowerCase()))
    .map(([month, revenue]) => ({
      month: month.charAt(0).toUpperCase() + month.slice(1), // Capitalizar
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

export const getRecentOrders = (vendas: Venda[]) => {
  if (!vendas || vendas.length === 0) return [];
  
  return vendas
    .slice()
    .sort((a, b) => {
      const dateStrA = a.DATA_VENDA || a.data || a.date || a.created_at || '';
      const dateStrB = b.DATA_VENDA || b.data || b.date || b.created_at || '';
      
      const dateA = parseDate(dateStrA);
      const dateB = parseDate(dateStrB);
      
      if (!dateA) return 1;  // Move invalid dates to end
      if (!dateB) return -1;
      
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5)
    .map((venda) => ({
      id: (venda.PEDIDO || venda.id)?.toString() || "N/A",
      customer: venda.CLIENTE_NOME || "Cliente Desconhecido",
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
    const date = parseDate(dateStr);
    
    if (!date) return sum;
      
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
    const date = parseDate(dateStr);
    
    if (!date) return sum;
      
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
