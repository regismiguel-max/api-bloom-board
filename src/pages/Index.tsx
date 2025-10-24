import { DashboardNav } from "@/components/DashboardNav";
import { KPICard } from "@/components/KPICard";
import { RevenueChart } from "@/components/RevenueChart";
import { SalesChart } from "@/components/SalesChart";
import { DataTable } from "@/components/DataTable";
import { DateFilter } from "@/components/DateFilter";
import { DollarSign, Users, ShoppingCart, TrendingUp, Loader2 } from "lucide-react";
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
  const [dateFilters, setDateFilters] = useState<{ dataInicio: string; dataFim: string; statusPedido?: string[]; tipoCliente?: string }>(() => {
    const now = new Date();
    const dataInicio = format(startOfMonth(now), 'yyyy-MM-dd');
    const dataFim = format(endOfMonth(now), 'yyyy-MM-dd');
    return { dataInicio, dataFim };
  });
  
  const [isFiltering, setIsFiltering] = useState(false);

  const { data: vendas = [], isLoading: isLoadingVendas, error: errorVendas } = useVendas(dateFilters);
  const statusList = useVendasStatus(vendas);

  // Filtrar dados localmente por tipo de cliente (validar CPF/CNPJ)
  const vendasFiltradas = useMemo(() => {
    if (!vendas?.length) return [];
    
    // Se não houver filtro de tipo de cliente, retornar todos os dados
    if (!dateFilters.tipoCliente) return vendas;
    
    return vendas.filter((venda) => {
      const doc = venda.CLIENTE_DOC;
      if (!doc) return false;
      
      // Remover caracteres não numéricos para contar dígitos
      const docLimpo = doc.replace(/\D/g, '');
      
      if (dateFilters.tipoCliente === 'pf') {
        // Pessoa Física = CPF com 11 dígitos
        const isCPF = docLimpo.length === 11;
        if (!isCPF) {
          console.log(`⚠️ Filtrado: ${doc} não é CPF (${docLimpo.length} dígitos)`);
        }
        return isCPF;
      } else if (dateFilters.tipoCliente === 'pj') {
        // Pessoa Jurídica = CNPJ com 14 dígitos
        const isCNPJ = docLimpo.length === 14;
        if (!isCNPJ) {
          console.log(`⚠️ Filtrado: ${doc} não é CNPJ (${docLimpo.length} dígitos)`);
        }
        return isCNPJ;
      }
      
      return true;
    });
  }, [vendas, dateFilters.tipoCliente]);

  useEffect(() => {
    console.log(`📊 Total vendas API: ${vendas.length}, Filtradas: ${vendasFiltradas.length}`);
    // Remover loading após dados filtrados
    if (isFiltering) {
      const timer = setTimeout(() => setIsFiltering(false), 300);
      return () => clearTimeout(timer);
    }
  }, [vendas.length, vendasFiltradas.length, isFiltering]);

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

  const handleFilterChange = (dataInicio: string, dataFim: string, statusPedido?: string[], tipoCliente?: string) => {
    console.log('Filter changed:', { dataInicio, dataFim, statusPedido, tipoCliente });
    setIsFiltering(true);
    setDateFilters({ dataInicio, dataFim, statusPedido, tipoCliente });
  };

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Pedido X Venda</h1>
          <p className="text-muted-foreground">Dados em tempo real da sua operação.</p>
        </div>

        {/* Filtro de Data */}
        <DateFilter onFilterChange={handleFilterChange} statusList={statusList} />

        {/* Loading overlay */}
        {(isLoading || isFiltering) && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando dados...</p>
            </div>
          </div>
        )}

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
