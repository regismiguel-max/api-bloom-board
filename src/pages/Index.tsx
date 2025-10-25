import { DashboardNav } from "@/components/DashboardNav";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { DateFilter } from "@/components/DateFilter";
import { DollarSign, Users, ShoppingCart, TrendingUp, Loader2 } from "lucide-react";
import { useVendas } from "@/hooks/useVendas";
import { useClientes } from "@/hooks/useClientes";
import { useVendasStatus } from "@/hooks/useVendasStatus";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  calculateTotalRevenue,
  getRecentOrders,
  calculateRevenueChange,
} from "@/lib/dataProcessing";

const Index = () => {
  const { toast } = useToast();
  
  // Estado para os filtros de data e status
  const [dateFilters, setDateFilters] = useState<{ dataInicio: string; dataFim: string; statusPedido?: string[]; tipoCliente?: string; nomeGrupo?: string }>(() => {
    const now = new Date();
    const dataInicio = format(startOfMonth(now), 'yyyy-MM-dd');
    const dataFim = format(endOfMonth(now), 'yyyy-MM-dd');
    return { dataInicio, dataFim };
  });
  
  const [isFiltering, setIsFiltering] = useState(false);

  const { data: vendas = [], isLoading: isLoadingVendas, error: errorVendas } = useVendas(dateFilters);
  const { data: clientes = [], isLoading: isLoadingClientes } = useClientes();
  
  // Criar mapa de clientes por CPF/CNPJ para lookup rápido
  const clientesMap = useMemo(() => {
    const map = new Map<string, any>();
    clientes.forEach((cliente) => {
      if (cliente.CPF_CNPJ) {
        // Normalizar o documento removendo caracteres especiais
        const docNormalizado = cliente.CPF_CNPJ.replace(/\D/g, '');
        map.set(docNormalizado, cliente);
      }
    });
    console.log(`📋 Mapa de clientes criado: ${map.size} clientes`);
    return map;
  }, [clientes]);

  // Enriquecer vendas com NOME_GRUPO dos clientes
  const vendasEnriquecidas = useMemo(() => {
    return vendas.map((venda) => {
      const clienteDoc = venda.CLIENTE_DOC?.replace(/\D/g, '');
      const cliente = clienteDoc ? clientesMap.get(clienteDoc) : null;
      
      return {
        ...venda,
        CLIENTE_NOME_GRUPO: cliente?.NOME_GRUPO || null,
      };
    });
  }, [vendas, clientesMap]);

  const statusList = useVendasStatus(vendasEnriquecidas);
  
  // Extrair lista única de NOME_GRUPO para o filtro
  const gruposClientes = useMemo(() => {
    const grupos = new Set<string>();
    vendasEnriquecidas.forEach((venda) => {
      if (venda.CLIENTE_NOME_GRUPO) {
        grupos.add(venda.CLIENTE_NOME_GRUPO);
      }
    });
    return Array.from(grupos).sort();
  }, [vendasEnriquecidas]);

  // Filtrar dados localmente por status, tipo de cliente e grupo
  const vendasFiltradas = useMemo(() => {
    if (!vendasEnriquecidas?.length) return [];
    
    let filtered = vendasEnriquecidas;
    
    // Filtrar por status do pedido
    if (dateFilters.statusPedido && dateFilters.statusPedido.length > 0) {
      filtered = filtered.filter((venda) => {
        const status = venda.STATUS_PEDIDO || venda.status || '';
        return dateFilters.statusPedido!.includes(status);
      });
    }
    
    // Filtrar por tipo de cliente
    if (dateFilters.tipoCliente) {
      filtered = filtered.filter((venda) => {
        const doc = venda.CLIENTE_DOC;
        if (!doc) return false;
        
        const docLimpo = doc.replace(/\D/g, '');
        
        if (dateFilters.tipoCliente === 'pf') {
          return docLimpo.length === 11;
        } else if (dateFilters.tipoCliente === 'pj') {
          return docLimpo.length === 14;
        }
        
        return true;
      });
    }
    
    // Filtrar por grupo de cliente
    if (dateFilters.nomeGrupo) {
      filtered = filtered.filter((venda) => {
        return venda.CLIENTE_NOME_GRUPO === dateFilters.nomeGrupo;
      });
    }
    
    return filtered;
  }, [vendasEnriquecidas, dateFilters.tipoCliente, dateFilters.nomeGrupo, dateFilters.statusPedido]);

  useEffect(() => {
    console.log(`📊 Total vendas API: ${vendas.length}, Enriquecidas: ${vendasEnriquecidas.length}, Filtradas: ${vendasFiltradas.length}`);
    // Remover loading após dados filtrados
    if (isFiltering) {
      const timer = setTimeout(() => setIsFiltering(false), 300);
      return () => clearTimeout(timer);
    }
  }, [vendas.length, vendasEnriquecidas.length, vendasFiltradas.length, isFiltering]);

  useEffect(() => {
    if (errorVendas) {
      toast({
        title: "Erro ao carregar vendas",
        description: "Não foi possível conectar à API de vendas. Verifique a conexão.",
        variant: "destructive",
      });
    }
  }, [errorVendas, toast]);

  const isLoading = isLoadingVendas || isLoadingClientes;

  const totalRevenue = useMemo(() => {
    if (!vendasFiltradas?.length) return 0;
    return calculateTotalRevenue(vendasFiltradas);
  }, [vendasFiltradas]);

  const revenueChange = useMemo(() => {
    if (!vendasFiltradas?.length) return 0;
    return calculateRevenueChange(vendasFiltradas);
  }, [vendasFiltradas]);

  const recentOrders = useMemo(() => {
    if (!vendasFiltradas?.length) return [];
    return getRecentOrders(vendasFiltradas);
  }, [vendasFiltradas]);

  const totalOrdersUnfiltered = useMemo(() => {
    if (!vendas?.length) return 0;
    const pedidosUnicos = new Set(
      vendas
        .map(v => v.PEDIDO || v.id?.toString())
        .filter(Boolean)
    );
    return pedidosUnicos.size;
  }, [vendas]);

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

  const handleFilterChange = (dataInicio: string, dataFim: string, statusPedido?: string[], tipoCliente?: string, nomeGrupo?: string, vendedor?: string) => {
    console.log('Filter changed:', { dataInicio, dataFim, statusPedido, tipoCliente, nomeGrupo });
    setIsFiltering(true);
    setDateFilters({ dataInicio, dataFim, statusPedido, tipoCliente, nomeGrupo });
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
        <DateFilter onFilterChange={handleFilterChange} statusList={statusList} gruposClientes={gruposClientes} />

        {/* Loading indicator */}
        {(isLoading || isFiltering) && (
          <div className="fixed top-4 right-4 z-50">
            <div className="flex items-center gap-2 bg-background border rounded-lg px-4 py-2 shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando...</p>
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

        {/* Data Table */}
        <DataTable orders={recentOrders} isLoading={isLoading} totalUnfiltered={totalOrdersUnfiltered} />
      </main>
    </div>
  );
};

export default Index;
