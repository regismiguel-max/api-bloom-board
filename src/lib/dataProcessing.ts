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

// Helper para extrair total do pedido
const getTotalPedido = (venda: Venda): number => {
  const candidates = [
    venda.TOTAL_PEDIDO,
    venda.total,
    venda.valor,
  ];
  const value = candidates.find((v) => typeof v === 'number' && !isNaN(Number(v)));
  return Number(value || 0);
};

export const calculateTotalRevenue = (vendas: Venda[]) => {
  if (!vendas || vendas.length === 0) return 0;
  
  // Agrupar por pedido e somar apenas uma vez o TOTAL_PEDIDO de cada pedido único
  const pedidosUnicos = new Map<string, number>();
  
  vendas.forEach((venda) => {
    const pedidoId = venda.PEDIDO || venda.id?.toString();
    if (!pedidoId) return;
    
    // Guardar apenas uma vez o total do pedido
    if (!pedidosUnicos.has(pedidoId)) {
      pedidosUnicos.set(pedidoId, getTotalPedido(venda));
    }
  });
  
  // Somar todos os totais únicos
  return Array.from(pedidosUnicos.values()).reduce((sum, total) => sum + total, 0);
};

export const calculateMonthlyRevenue = (vendas: Venda[]) => {
  const monthlyData: { [key: string]: Map<string, number> } = {};
  
  vendas.forEach((venda) => {
    const dateStr = venda.DATA_VENDA || venda.data || venda.date || venda.created_at;
    const date = parseDate(dateStr);
    if (!date) return;

    const monthKey = format(date, 'MMM', { locale: ptBR });
    const pedidoId = venda.PEDIDO || venda.id?.toString();
    if (!pedidoId) return;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = new Map();
    }
    
    // Adicionar apenas uma vez por pedido
    if (!monthlyData[monthKey].has(pedidoId)) {
      monthlyData[monthKey].set(pedidoId, getTotalPedido(venda));
    }
  });

  const monthOrder = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  
  return Object.entries(monthlyData)
    .sort(([a], [b]) => monthOrder.indexOf(a.toLowerCase()) - monthOrder.indexOf(b.toLowerCase()))
    .map(([month, pedidosMap]) => ({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      revenue: Math.round(Array.from(pedidosMap.values()).reduce((sum, val) => sum + val, 0)),
    }));
};

export const calculateSalesByCategory = (vendas: Venda[]) => {
  const categoryData: { [key: string]: Map<string, number> } = {};
  
  vendas.forEach((venda) => {
    const category = venda.PRODUTO_MARCA || venda.categoria || venda.category || venda.produto || "Outros";
    const pedidoId = venda.PEDIDO || venda.id?.toString();
    if (!pedidoId) return;
    
    if (!categoryData[category]) {
      categoryData[category] = new Map();
    }
    
    // Adicionar apenas uma vez por pedido
    if (!categoryData[category].has(pedidoId)) {
      categoryData[category].set(pedidoId, getTotalPedido(venda));
    }
  });

  return Object.entries(categoryData)
    .map(([category, pedidosMap]) => ({
      category,
      sales: Math.round(Array.from(pedidosMap.values()).reduce((sum, val) => sum + val, 0)),
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 6);
};

export const getRecentOrders = (vendas: Venda[]) => {
  if (!vendas || vendas.length === 0) return [];
  
  // Agrupar por pedido
  const pedidosMap = new Map<string, Venda>();
  
  vendas.forEach((venda) => {
    const pedidoId = venda.PEDIDO || venda.id?.toString() || '';
    if (!pedidoId) return;

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
    .map((venda) => {
      const pedidoId = (venda.PEDIDO || venda.id)?.toString() || "N/A";
      const totalPedido = getTotalPedido(venda);
      return {
        id: pedidoId,
        customer: venda.CLIENTE_NOME || "Cliente Desconhecido",
        amount: totalPedido,
        status: venda.STATUS_PEDIDO || venda.status || "Sem Status",
      };
    });
};

export const calculatePreviousMonthRevenue = (vendas: Venda[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const pedidosUnicos = new Map<string, number>();
  
  vendas.forEach((venda) => {
    const dateStr = venda.DATA_VENDA || venda.data || venda.date || venda.created_at;
    const date = parseDate(dateStr);
    if (!date) return;

    if (date.getMonth() === previousMonth && date.getFullYear() === previousMonthYear) {
      const pedidoId = venda.PEDIDO || venda.id?.toString();
      if (!pedidoId) return;
      
      if (!pedidosUnicos.has(pedidoId)) {
        pedidosUnicos.set(pedidoId, getTotalPedido(venda));
      }
    }
  });
  
  return Array.from(pedidosUnicos.values()).reduce((sum, total) => sum + total, 0);
};

export const calculateCurrentMonthRevenue = (vendas: Venda[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const pedidosUnicos = new Map<string, number>();
  
  vendas.forEach((venda) => {
    const dateStr = venda.DATA_VENDA || venda.data || venda.date || venda.created_at;
    const date = parseDate(dateStr);
    if (!date) return;
      
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      const pedidoId = venda.PEDIDO || venda.id?.toString();
      if (!pedidoId) return;
      
      if (!pedidosUnicos.has(pedidoId)) {
        pedidosUnicos.set(pedidoId, getTotalPedido(venda));
      }
    }
  });
  
  return Array.from(pedidosUnicos.values()).reduce((sum, total) => sum + total, 0);
};

export const calculateRevenueChange = (vendas: Venda[]) => {
  const current = calculateCurrentMonthRevenue(vendas);
  const previous = calculatePreviousMonthRevenue(vendas);
  
  if (previous === 0) return 0;
  
  return Number((((current - previous) / previous) * 100).toFixed(1));
};
