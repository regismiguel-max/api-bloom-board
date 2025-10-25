import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateFilter } from "@/components/DateFilter";
import { RankingClientesTable } from "@/components/RankingClientesTable";
import { useVendas } from "@/hooks/useVendas";
import { useClientes } from "@/hooks/useClientes";
import { useMemo, useState } from "react";
import { Loader2, MapPin, Users } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AnaliseClientes = () => {
  const [dateFilters, setDateFilters] = useState<{ dataInicio: string; dataFim: string; statusPedido?: string[]; tipoCliente?: string; nomeGrupo?: string }>(() => {
    const now = new Date();
    const dataInicio = format(startOfMonth(now), 'yyyy-MM-dd');
    const dataFim = format(endOfMonth(now), 'yyyy-MM-dd');
    return { dataInicio, dataFim };
  });

  const { data: vendas = [], isLoading: isLoadingVendas } = useVendas(dateFilters);
  const { data: clientes = [], isLoading: isLoadingClientes } = useClientes();

  const isLoading = isLoadingVendas || isLoadingClientes;

  // Criar mapa de clientes
  const clientesMap = useMemo(() => {
    const map = new Map();
    clientes.forEach((cliente) => {
      if (cliente.CPF_CNPJ) {
        const docNormalizado = cliente.CPF_CNPJ.replace(/\D/g, '');
        map.set(docNormalizado, cliente);
      }
    });
    return map;
  }, [clientes]);

  // Enriquecer vendas com dados dos clientes
  const vendasEnriquecidas = useMemo(() => {
    return vendas.map((venda) => {
      const clienteDoc = venda.CLIENTE_DOC?.replace(/\D/g, '');
      const cliente = clienteDoc ? clientesMap.get(clienteDoc) : null;
      
      return {
        ...venda,
        CLIENTE_UF: cliente?.UF || 'N/A',
      };
    });
  }, [vendas, clientesMap]);

  const statusList = [];
  
  const gruposClientes = useMemo(() => {
    const grupos = new Set<string>();
    clientes.forEach((cliente) => {
      if (cliente.NOME_GRUPO) {
        grupos.add(cliente.NOME_GRUPO);
      }
    });
    return Array.from(grupos).sort();
  }, [clientes]);

  const handleFilterChange = (dataInicio: string, dataFim: string, statusPedido?: string[], tipoCliente?: string, nomeGrupo?: string) => {
    setDateFilters({ dataInicio, dataFim, statusPedido, tipoCliente, nomeGrupo });
  };

  // Ranking COMPLETO de clientes (não apenas top 10)
  const rankingClientes = useMemo(() => {
    if (!vendasEnriquecidas.length) return [];

    console.log(`🔍 Analisando ${vendasEnriquecidas.length} vendas para ranking`);

    // Filtrar apenas vendas com status OK
    const vendasOK = vendasEnriquecidas.filter(v => v.STATUS_PEDIDO === 'OK');
    console.log(`✅ Vendas com status OK: ${vendasOK.length}`);

    // Agrupar por PEDIDO primeiro para pegar o total correto
    const pedidosUnicos = new Map<string, any>();
    vendasOK.forEach((venda) => {
      const pedidoId = venda.PEDIDO || venda.id?.toString();
      if (pedidoId && !pedidosUnicos.has(pedidoId)) {
        pedidosUnicos.set(pedidoId, venda);
      }
    });

    // Agrupar por cliente
    const clienteVendas = new Map<string, { nome: string; total: number; uf: string; pedidos: number }>();

    pedidosUnicos.forEach((venda) => {
      const clienteDoc = venda.CLIENTE_DOC?.replace(/\D/g, '');
      
      if (clienteDoc) {
        const key = clienteDoc;
        const existing = clienteVendas.get(key) || { 
          nome: venda.CLIENTE_NOME || 'Cliente Desconhecido', 
          total: 0,
          uf: venda.CLIENTE_UF || 'N/A',
          pedidos: 0
        };
        
        existing.total += venda.TOTAL_PEDIDO || 0;
        existing.pedidos += 1;
        clienteVendas.set(key, existing);
      }
    });

    console.log(`👥 Total de clientes únicos: ${clienteVendas.size}`);

    // Converter para array e ordenar por total (TODOS os clientes, não apenas top 10)
    const resultado = Array.from(clienteVendas.entries())
      .map(([doc, data]) => ({
        doc,
        nome: data.nome,
        total: data.total,
        uf: data.uf,
        pedidos: data.pedidos
      }))
      .sort((a, b) => b.total - a.total);

    console.log(`🏆 Total clientes no ranking: ${resultado.length}`);
    return resultado;
  }, [vendasEnriquecidas]);

  // Distribuição por UF - TODOS os estados
  const distribuicaoPorUF = useMemo(() => {
    if (!clientes.length) return [];

    const ufCount = new Map<string, number>();
    
    clientes.forEach((cliente) => {
      const uf = cliente.UF || 'N/A';
      ufCount.set(uf, (ufCount.get(uf) || 0) + 1);
    });

    return Array.from(ufCount.entries())
      .map(([uf, count]) => ({ uf, count }))
      .sort((a, b) => b.count - a.count); // Todos os estados, ordenados
  }, [clientes]);

  const totalClientesAtivos = useMemo(() => {
    const clientesComVendas = new Set(
      vendasEnriquecidas
        .filter(v => v.STATUS_PEDIDO === 'OK')
        .map(v => v.CLIENTE_DOC?.replace(/\D/g, ''))
        .filter(Boolean)
    );
    return clientesComVendas.size;
  }, [vendasEnriquecidas]);

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(210, 100%, 60%)',
    'hsl(340, 100%, 60%)',
    'hsl(45, 100%, 60%)',
  ];

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Análise de Clientes</h1>
          <p className="text-muted-foreground">Ranking e distribuição geográfica dos clientes.</p>
        </div>

        {/* Filtro de Data */}
        <DateFilter onFilterChange={handleFilterChange} statusList={[]} gruposClientes={gruposClientes} hideStatusFilter={true} />

        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando dados...</p>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientes.length.toLocaleString('pt-BR')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estados Atendidos</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{distribuicaoPorUF.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Distribuição por Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={distribuicaoPorUF}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="uf" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Clientes']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ranking de Clientes com Paginação */}
          <RankingClientesTable clientes={rankingClientes} />
        </div>
      </main>
    </div>
  );
};

export default AnaliseClientes;
