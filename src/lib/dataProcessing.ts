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
  
  // Agrupar por número de pedido para evitar duplicatas
  // (API retorna múltiplas linhas por pedido, uma por produto)
  const pedidosUnicos = new Map<string, number>();
  
  vendas.forEach((venda) => {
    const pedidoId = venda.PEDIDO || venda.id?.toString() || '';
    if (!pedidoId) return;
    
    // Armazena apenas uma vez o total de cada pedido
    if (!pedidosUnicos.has(pedidoId)) {
      const valor = venda.TOTAL_PEDIDO || venda.valor || venda.total || venda.price || 0;
      pedidosUnicos.set(pedidoId, Number(valor));
    }
  });
  
  // Somar todos os pedidos únicos
  const total = Array.from(pedidosUnicos.values()).reduce((sum, valor) => sum + valor, 0);
  return total;
};

export const calculateMonthlyRevenue = (vendas: Venda[]) => {
  // Agrupar por pedido primeiro para evitar duplicatas
  const pedidosUnicos = new Map<string, { valor: number; data: Date | null }>();
  
  vendas.forEach((venda) => {
    const pedidoId = venda.PEDIDO || venda.id?.toString() || '';
    if (!pedidoId) return;
    
    if (!pedidosUnicos.has(pedidoId)) {
      const dateStr = venda.DATA_VENDA || venda.data || venda.date || venda.created_at;
      const date = parseDate(dateStr);
      const valor = venda.TOTAL_PEDIDO || venda.valor || venda.total || venda.price || 0;
      
      pedidosUnicos.set(pedidoId, { valor: Number(valor), data: date });
    }
  });
  
  // Agrupar por mês
  const monthlyData: { [key: string]: number } = {};
  
  pedidosUnicos.forEach(({ valor, data }) => {
    if (!data) return;
    
    const monthKey = format(data, 'MMM', { locale: ptBR });
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + valor;
  });

  // Ordenar meses cronologicamente
  const monthOrder = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  
  return Object.entries(monthlyData)
    .sort(([a], [b]) => monthOrder.indexOf(a.toLowerCase()) - monthOrder.indexOf(b.toLowerCase()))
    .map(([month, revenue]) => ({
      month: month.charAt(0).toUpperCase() + month.slice(1),
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
  
  // Agrupar por pedido para evitar duplicatas
  const pedidosMap = new Map<string, Venda>();
  
  vendas.forEach((venda) => {
    const pedidoId = venda.PEDIDO || venda.id?.toString() || '';
    if (!pedidoId) return;
    
    // Armazena apenas a primeira ocorrência de cada pedido
    if (!pedidosMap.has(pedidoId)) {
      pedidosMap.set(pedidoId, venda);
    }
  });
  
  const pedidosUnicos = Array.from(pedidosMap.values());
  
  return pedidosUnicos
    .sort((a, b) => {
      const dateStrA = a.DATA_VENDA || a.data || a.date || a.created_at || '';
      const dateStrB = b.DATA_VENDA || b.data || b.date || b.created_at || '';
      
      const dateA = parseDate(dateStrA);
      const dateB = parseDate(dateStrB);
      
      if (!dateA) return 1;
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
  
  // Agrupar por pedido para evitar duplicatas
  const pedidosUnicos = new Map<string, number>();
  
  vendas.forEach((venda) => {
    const pedidoId = venda.PEDIDO || venda.id?.toString() || '';
    if (!pedidoId) return;
    
    const dateStr = venda.DATA_VENDA || venda.data || venda.date || venda.created_at;
    const date = parseDate(dateStr);
    
    if (!date) return;
      
    if (date.getMonth() === previousMonth && date.getFullYear() === previousMonthYear) {
      if (!pedidosUnicos.has(pedidoId)) {
        const valor = venda.TOTAL_PEDIDO || venda.valor || venda.total || venda.price || 0;
        pedidosUnicos.set(pedidoId, Number(valor));
      }
    }
  });
  
  return Array.from(pedidosUnicos.values()).reduce((sum, valor) => sum + valor, 0);
};

export const calculateCurrentMonthRevenue = (vendas: Venda[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Agrupar por pedido para evitar duplicatas
  const pedidosUnicos = new Map<string, number>();
  
  vendas.forEach((venda) => {
    const pedidoId = venda.PEDIDO || venda.id?.toString() || '';
    if (!pedidoId) return;
    
    const dateStr = venda.DATA_VENDA || venda.data || venda.date || venda.created_at;
    const date = parseDate(dateStr);
    
    if (!date) return;
      
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      if (!pedidosUnicos.has(pedidoId)) {
        const valor = venda.TOTAL_PEDIDO || venda.valor || venda.total || venda.price || 0;
        pedidosUnicos.set(pedidoId, Number(valor));
      }
    }
  });
  
  return Array.from(pedidosUnicos.values()).reduce((sum, valor) => sum + valor, 0);
};

export const calculateRevenueChange = (vendas: Venda[]) => {
  const current = calculateCurrentMonthRevenue(vendas);
  const previous = calculatePreviousMonthRevenue(vendas);
  
  if (previous === 0) return 0;
  
  return Number((((current - previous) / previous) * 100).toFixed(1));
};
