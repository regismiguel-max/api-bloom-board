import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateFilter } from "@/components/DateFilter";
import { useVendas } from "@/hooks/useVendas";
import { useMemo, useState } from "react";
import { Loader2, Users, TrendingUp, DollarSign } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AnaliseVendedores = () => {
  const [dateFilters, setDateFilters] = useState<{ dataInicio: string; dataFim: string; statusPedido?: string[]; tipoCliente?: string; nomeGrupo?: string }>(() => {
    const now = new Date();
    const dataInicio = format(startOfMonth(now), 'yyyy-MM-dd');
    const dataFim = format(endOfMonth(now), 'yyyy-MM-dd');
    return { dataInicio, dataFim };
  });

  const { data: vendas = [], isLoading } = useVendas(dateFilters);

  const statusList = [];
  const gruposClientes = [];

  const handleFilterChange = (dataInicio: string, dataFim: string, statusPedido?: string[], tipoCliente?: string, nomeGrupo?: string) => {
    setDateFilters({ dataInicio, dataFim, statusPedido, tipoCliente, nomeGrupo });
  };

  // Análise por vendedor
  const analiseVendedores = useMemo(() => {
    if (!vendas.length) return [];

    console.log(`🔍 Analisando ${vendas.length} vendas para vendedores`);

    // Filtrar apenas vendas com status OK
    const vendasOK = vendas.filter(v => v.STATUS_PEDIDO === 'OK');
    console.log(`✅ Vendas com status OK: ${vendasOK.length}`);

    // Agrupar por PEDIDO primeiro para pegar o total correto
    const pedidosUnicos = new Map<string, any>();
    vendasOK.forEach((venda) => {
      const pedidoId = venda.PEDIDO || venda.id?.toString();
      if (pedidoId && !pedidosUnicos.has(pedidoId)) {
        pedidosUnicos.set(pedidoId, venda);
      }
    });

    // Agrupar por vendedor
    const vendedorVendas = new Map<string, { nome: string; total: number; pedidos: number; clientes: Set<string> }>();

    pedidosUnicos.forEach((venda) => {
      const vendedor = venda.VENDEDOR_NOME || 'Vendedor Desconhecido';
      const clienteDoc = venda.CLIENTE_DOC?.replace(/\D/g, '');
      
      const existing = vendedorVendas.get(vendedor) || { 
        nome: vendedor, 
        total: 0,
        pedidos: 0,
        clientes: new Set<string>()
      };
      
      existing.total += venda.TOTAL_PEDIDO || 0;
      existing.pedidos += 1;
      if (clienteDoc) {
        existing.clientes.add(clienteDoc);
      }
      vendedorVendas.set(vendedor, existing);
    });

    console.log(`👥 Total de vendedores: ${vendedorVendas.size}`);

    // Converter para array e ordenar por total
    const resultado = Array.from(vendedorVendas.entries())
      .map(([nome, data]) => ({
        nome,
        total: data.total,
        pedidos: data.pedidos,
        clientes: data.clientes.size,
        ticketMedio: data.pedidos > 0 ? data.total / data.pedidos : 0
      }))
      .sort((a, b) => b.total - a.total);

    console.log(`🏆 Total vendedores no ranking: ${resultado.length}`);
    return resultado;
  }, [vendas]);

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalVendedores = analiseVendedores.length;
    const totalVendas = analiseVendedores.reduce((acc, v) => acc + v.total, 0);
    const totalPedidos = analiseVendedores.reduce((acc, v) => acc + v.pedidos, 0);
    
    return { totalVendedores, totalVendas, totalPedidos };
  }, [analiseVendedores]);

  // Dados para o gráfico (top 10)
  const dadosGrafico = useMemo(() => {
    return analiseVendedores.slice(0, 10);
  }, [analiseVendedores]);

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Análise de Vendedores</h1>
          <p className="text-muted-foreground">Performance e ranking dos vendedores.</p>
        </div>

        {/* Filtro de Data */}
        <DateFilter onFilterChange={handleFilterChange} statusList={statusList} gruposClientes={gruposClientes} hideStatusFilter={true} />

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
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendedores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalVendedores}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total em Vendas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL',
                  minimumFractionDigits: 0
                }).format(estatisticas.totalVendas)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalPedidos.toLocaleString('pt-BR')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico Top 10 Vendedores */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Vendedores por Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="nome" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('pt-BR', { 
                      notation: 'compact',
                      compactDisplay: 'short'
                    }).format(value)
                  }
                />
                <Tooltip 
                  formatter={(value: number) => [
                    new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(value), 
                    'Total'
                  ]}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar 
                  dataKey="total" 
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabela Completa de Vendedores */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking Completo de Vendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Posição</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-center">Pedidos</TableHead>
                    <TableHead className="text-center">Clientes</TableHead>
                    <TableHead className="text-right">Ticket Médio</TableHead>
                    <TableHead className="text-right">Total Faturado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analiseVendedores.map((vendedor, index) => (
                    <TableRow key={vendedor.nome}>
                      <TableCell className="font-bold">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-700' :
                          index === 1 ? 'bg-gray-400/20 text-gray-700' :
                          index === 2 ? 'bg-orange-500/20 text-orange-700' :
                          'bg-primary/10 text-primary'
                        } text-sm`}>
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{vendedor.nome}</TableCell>
                      <TableCell className="text-center">{vendedor.pedidos}</TableCell>
                      <TableCell className="text-center">{vendedor.clientes}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL',
                          minimumFractionDigits: 2
                        }).format(vendedor.ticketMedio)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL',
                          minimumFractionDigits: 2
                        }).format(vendedor.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AnaliseVendedores;
