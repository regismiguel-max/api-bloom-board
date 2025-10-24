import { DashboardNav } from "@/components/DashboardNav";
import { KPICard } from "@/components/KPICard";
import { RevenueChart } from "@/components/RevenueChart";
import { SalesChart } from "@/components/SalesChart";
import { DataTable } from "@/components/DataTable";
import { DateFilter } from "@/components/DateFilter";
import { DollarSign, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { useVendas } from "@/hooks/useVendas";
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
  
  // Estado para os filtros de data
  const [dateFilters, setDateFilters] = useState<{ dataInicio: string; dataFim: string }>(() => {
    const now = new Date();
    const dataInicio = format(startOfMonth(now), 'dd/MM/yyyy', { locale: ptBR });
    const dataFim = format(endOfMonth(now), 'dd/MM/yyyy', { locale: ptBR });
    return { dataInicio, dataFim };
  });

  const { data: vendas = [], isLoading: isLoadingVendas, error: errorVendas } = useVendas(dateFilters);

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
    if (!vendas?.length) return 0;
    return calculateTotalRevenue(vendas);
  }, [vendas]);

  const revenueChange = useMemo(() => {
    if (!vendas?.length) return 0;
    return calculateRevenueChange(vendas);
  }, [vendas]);

  const monthlyRevenueData = useMemo(() => {
    if (!vendas?.length) return [];
    return calculateMonthlyRevenue(vendas);
  }, [vendas]);

  const salesByCategoryData = useMemo(() => {
    if (!vendas?.length) return [];
    return calculateSalesByCategory(vendas);
  }, [vendas]);

  const recentOrders = useMemo(() => {
    if (!vendas?.length) return [];
    return getRecentOrders(vendas);
  }, [vendas]);

  const totalOrders = vendas?.length || 0;
  
  // Calcular clientes únicos das vendas (usando CLIENTE_DOC como identificador)
  const totalClientes = useMemo(() => {
    if (!vendas?.length) return 0;
    const clientesUnicos = new Set(
      vendas
        .map(v => v.CLIENTE_DOC || v.CLIENTE_NOME || v.CODIGO_EXP)
        .filter(Boolean)
    );
    return clientesUnicos.size;
  }, [vendas]);
  
  const conversionRate = useMemo(() => {
    if (totalClientes === 0) return "0.00";
    return ((totalOrders / totalClientes) * 100).toFixed(2);
  }, [totalOrders, totalClientes]);

  const handleFilterChange = (dataInicio: string, dataFim: string) => {
    console.log('Filter changed:', { dataInicio, dataFim });
    setDateFilters({ dataInicio, dataFim });
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
        <DateFilter onFilterChange={handleFilterChange} />

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Receita Total"
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
            title="Total de Vendas"
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
