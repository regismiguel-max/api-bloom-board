import { DashboardNav } from "@/components/DashboardNav";
import { KPICard } from "@/components/KPICard";
import { RevenueChart } from "@/components/RevenueChart";
import { SalesChart } from "@/components/SalesChart";
import { DataTable } from "@/components/DataTable";
import { DateFilter } from "@/components/DateFilter";
import { DollarSign, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { useVendas } from "@/hooks/useVendas";
import { useVendasStatus } from "@/hooks/useVendasStatus";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  calculateTotalRevenue,
  calculateMonthlyRevenue,
  calculateSalesByCategory,
  getRecentOrders,
  calculateRevenueChange,
} from "@/lib/dataProcessing";

const Index = () => {
  const { toast } = useToast();
  
  // Estado para os filtros de data e status
  const [dateFilters, setDateFilters] = useState<{ dataInicio: string; dataFim: string; statusPedido?: string; tipoCliente?: string }>(() => {
    const now = new Date();
    const dataInicio = format(startOfMonth(now), 'yyyy-MM-dd');
    const dataFim = format(endOfMonth(now), 'yyyy-MM-dd');
    return { dataInicio, dataFim };
  });

  const { data: vendas = [], isLoading: isLoadingVendas, error: errorVendas } = useVendas(dateFilters);
  const statusList = useVendasStatus(vendas);

  // Aplicar filtros localmente nos dados
  const vendasFiltradas = useMemo(() => {
    if (!vendas?.length) return [];
    
    let filtered = vendas;
    
    // Filtrar por status
    if (dateFilters.statusPedido) {
      filtered = filtered.filter((venda) => {
        const status = venda.STATUS_PEDIDO || venda.status;
        return status === dateFilters.statusPedido;
      });
    }
    
    // Filtrar por tipo de cliente (CPF vs CNPJ)
    if (dateFilters.tipoCliente) {
      filtered = filtered.filter((venda) => {
        const doc = venda.CLIENTE_DOC;
        if (!doc) return false;
        
        // Remover caracteres não numéricos
        const docLimpo = doc.replace(/\D/g, '');
        
        if (dateFilters.tipoCliente === 'pf') {
          // CPF tem 11 dígitos
          return docLimpo.length === 11;
        } else if (dateFilters.tipoCliente === 'pj') {
          // CNPJ tem 14 dígitos
          return docLimpo.length === 14;
        }
        
        return true;
      });
    }
    
    console.log(`📊 Dados filtrados: ${filtered.length} de ${vendas.length} registros`);
    return filtered;
  }, [vendas, dateFilters.statusPedido, dateFilters.tipoCliente]);

  useEffect(() => {
    if (errorVendas) {
      toast({
        title: "Erro ao carregar vendas",
        description: "Não foi possível conectar à API de vendas. Verifique a conexão.",
        variant: "destructive",
      });
    }
  }, [errorVendas, toast]);

  const isLoading = isLoadingVendas;

  const totalRevenue = useMemo(() => {
    if (!vendasFiltradas?.length) return 0;
    return calculateTotalRevenue(vendasFiltradas);
  }, [vendasFiltradas]);

  const revenueChange = useMemo(() => {
    if (!vendasFiltradas?.length) return 0;
    return calculateRevenueChange(vendasFiltradas);
  }, [vendasFiltradas]);

  const monthlyRevenueData = useMemo(() => {
    if (!vendasFiltradas?.length) return [];
    return calculateMonthlyRevenue(vendasFiltradas);
  }, [vendasFiltradas]);

  const salesByCategoryData = useMemo(() => {
    if (!vendasFiltradas?.length) return [];
    return calculateSalesByCategory(vendasFiltradas);
  }, [vendasFiltradas]);

  const recentOrders = useMemo(() => {
    if (!vendasFiltradas?.length) return [];
    return getRecentOrders(vendasFiltradas);
  }, [vendasFiltradas]);

  const totalOrders = useMemo(() => {
    if (!vendasFiltradas?.length) return 0;
    // Contar pedidos únicos, não linhas da API
    const pedidosUnicos = new Set(
      vendasFiltradas
        .map(v => v.PEDIDO || v.id?.toString())
        .filter(Boolean)
    );
    return pedidosUnicos.size;
  }, [vendasFiltradas]);
  
  // Calcular clientes únicos das vendas (usando CLIENTE_DOC como identificador)
  const totalClientes = useMemo(() => {
    if (!vendasFiltradas?.length) return 0;
    const clientesUnicos = new Set(
      vendasFiltradas
        .map(v => v.CLIENTE_DOC || v.CLIENTE_NOME || v.CODIGO_EXP)
        .filter(Boolean)
    );
    return clientesUnicos.size;
  }, [vendasFiltradas]);
  
  const conversionRate = useMemo(() => {
    if (totalClientes === 0) return "0.00";
    return ((totalOrders / totalClientes) * 100).toFixed(2);
  }, [totalOrders, totalClientes]);

  const handleFilterChange = (dataInicio: string, dataFim: string, statusPedido?: string, tipoCliente?: string) => {
    console.log('Filter changed:', { dataInicio, dataFim, statusPedido, tipoCliente });
    setDateFilters({ dataInicio, dataFim, statusPedido, tipoCliente });
  };

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Dados em tempo real da sua operação.</p>
        </div>

        {/* Filtro de Data */}
        <DateFilter onFilterChange={handleFilterChange} statusList={statusList} />

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Receita do Período"
            value={`R$ ${(totalRevenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={revenueChange}
            trend={revenueChange >= 0 ? "up" : "down"}
            icon={DollarSign}
          />
          <KPICard
            title="Clientes Únicos"
            value={(totalClientes || 0).toLocaleString("pt-BR")}
            icon={Users}
          />
          <KPICard
            title="Vendas do Período"
            value={(totalOrders || 0).toLocaleString("pt-BR")}
            icon={ShoppingCart}
          />
          <KPICard
            title="Ticket Médio"
            value={`R$ ${totalOrders > 0 ? (totalRevenue / totalOrders).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00"}`}
            icon={TrendingUp}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          <RevenueChart data={monthlyRevenueData} isLoading={isLoading} />
          <SalesChart data={salesByCategoryData} isLoading={isLoading} />
        </div>

        {/* Data Table */}
        <div className="grid gap-6 lg:grid-cols-3">
          <DataTable orders={recentOrders} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default Index;
