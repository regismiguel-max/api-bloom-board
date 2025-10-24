import { DashboardNav } from "@/components/DashboardNav";
import { KPICard } from "@/components/KPICard";
import { RevenueChart } from "@/components/RevenueChart";
import { SalesChart } from "@/components/SalesChart";
import { DataTable } from "@/components/DataTable";
import { DollarSign, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { useVendas } from "@/hooks/useVendas";
import { useClientes } from "@/hooks/useClientes";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo } from "react";
import {
  calculateTotalRevenue,
  calculateMonthlyRevenue,
  calculateSalesByCategory,
  getRecentOrders,
  calculateRevenueChange,
} from "@/lib/dataProcessing";

const Index = () => {
  const { data: vendas = [], isLoading: isLoadingVendas, error: errorVendas } = useVendas();
  const { data: clientes = [], isLoading: isLoadingClientes, error: errorClientes } = useClientes();
  const { toast } = useToast();

  useEffect(() => {
    if (errorVendas) {
      toast({
        title: "Erro ao carregar vendas",
        description: "Não foi possível conectar à API de vendas. Verifique a conexão.",
        variant: "destructive",
      });
    }
    if (errorClientes) {
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível conectar à API de clientes. Verifique a conexão.",
        variant: "destructive",
      });
    }
  }, [errorVendas, errorClientes, toast]);

  const isLoading = isLoadingVendas || isLoadingClientes;

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
    if (!vendas?.length || !clientes?.length) return [];
    return getRecentOrders(vendas, clientes);
  }, [vendas, clientes]);

  const totalOrders = vendas?.length || 0;
  const totalClientes = clientes?.length || 0;
  
  const conversionRate = useMemo(() => {
    if (totalClientes === 0) return "0.00";
    return ((totalOrders / totalClientes) * 100).toFixed(2);
  }, [totalOrders, totalClientes]);

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Dados em tempo real da sua operação.</p>
        </div>

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
            title="Total de Clientes"
            value={(totalClientes || 0).toLocaleString("pt-BR")}
            icon={Users}
          />
          <KPICard
            title="Total de Vendas"
            value={(totalOrders || 0).toLocaleString("pt-BR")}
            icon={ShoppingCart}
          />
          <KPICard
            title="Taxa de Conversão"
            value={`${conversionRate}%`}
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
