import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateFilter } from "@/components/DateFilter";
import { useVendas } from "@/hooks/useVendas";
import { useClientes } from "@/hooks/useClientes";
import { useMemo, useState } from "react";
import { Loader2, Users, TrendingUp, DollarSign, Eye } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AnaliseVendedores = () => {
  const [dateFilters, setDateFilters] = useState<{ dataInicio: string; dataFim: string; statusPedido?: string[]; tipoCliente?: string; nomeGrupo?: string; vendedor?: string }>(() => {
    const now = new Date();
    const dataInicio = format(startOfMonth(now), 'yyyy-MM-dd');
    const dataFim = format(endOfMonth(now), 'yyyy-MM-dd');
    return { dataInicio, dataFim };
  });

  const [selectedVendedor, setSelectedVendedor] = useState<{ nome: string; clientes: Array<{ doc: string; nome: string }> } | null>(null);

  const { data: vendas = [], isLoading } = useVendas(dateFilters);

  const statusList = [];

  // Criar mapa de clientes para enriquecer vendas
  const { data: clientes = [] } = useClientes();
  
  // Criar lista de grupos de clientes únicos
  const gruposClientes = useMemo(() => {
    const grupos = new Set<string>();
    clientes.forEach((cliente) => {
      if (cliente.NOME_GRUPO) {
        grupos.add(cliente.NOME_GRUPO);
      }
    });
    return Array.from(grupos).sort();
  }, [clientes]);

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
        CLIENTE_NOME_GRUPO: cliente?.NOME_GRUPO || null,
      };
    });
  }, [vendas, clientesMap]);

  // Aplicar filtros locais
  const vendasFiltradas = useMemo(() => {
    let filtered = vendasEnriquecidas;

    // Filtro por tipo de cliente
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

    // Filtro por grupo de cliente
    if (dateFilters.nomeGrupo) {
      filtered = filtered.filter((venda) => {
        return venda.CLIENTE_NOME_GRUPO === dateFilters.nomeGrupo;
      });
    }

    // Filtro por vendedor
    if (dateFilters.vendedor) {
      filtered = filtered.filter((venda) => {
        return venda.VENDEDOR_NOME === dateFilters.vendedor;
      });
    }

    return filtered;
  }, [vendasEnriquecidas, dateFilters.tipoCliente, dateFilters.nomeGrupo, dateFilters.vendedor]);

  // Lista de vendedores únicos
  const vendedoresList = useMemo(() => {
    const vendedoresSet = new Set<string>();
    vendas.forEach((venda) => {
      if (venda.VENDEDOR_NOME) {
        vendedoresSet.add(venda.VENDEDOR_NOME);
      }
    });
    return Array.from(vendedoresSet).sort();
  }, [vendas]);

  const handleFilterChange = (dataInicio: string, dataFim: string, statusPedido?: string[], tipoCliente?: string, nomeGrupo?: string, vendedor?: string) => {
    setDateFilters({ dataInicio, dataFim, statusPedido, tipoCliente, nomeGrupo, vendedor });
  };

  // Análise por vendedor
  const analiseVendedores = useMemo(() => {
    if (!vendasFiltradas.length) return [];

    console.log(`🔍 Analisando ${vendasFiltradas.length} vendas para vendedores (filtradas)`);

    // Filtrar apenas vendas com status OK
    const vendasOK = vendasFiltradas.filter(v => v.STATUS_PEDIDO === 'OK');
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
    const vendedorVendas = new Map<string, { nome: string; total: number; pedidos: number; clientes: Set<string>; clientesDetalhes: Map<string, string> }>();

    pedidosUnicos.forEach((venda) => {
      const vendedor = venda.VENDEDOR_NOME || 'Vendedor Desconhecido';
      const clienteDoc = venda.CLIENTE_DOC?.replace(/\D/g, '');
      const clienteNome = venda.CLIENTE_NOME || 'Cliente Desconhecido';
      
      const existing = vendedorVendas.get(vendedor) || { 
        nome: vendedor, 
        total: 0,
        pedidos: 0,
        clientes: new Set<string>(),
        clientesDetalhes: new Map<string, string>()
      };
      
      existing.total += venda.TOTAL_PEDIDO || 0;
      existing.pedidos += 1;
      if (clienteDoc) {
        existing.clientes.add(clienteDoc);
        existing.clientesDetalhes.set(clienteDoc, clienteNome);
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
        ticketMedio: data.pedidos > 0 ? data.total / data.pedidos : 0,
        clientesDetalhes: Array.from(data.clientesDetalhes.entries()).map(([doc, nomeCliente]) => ({ doc, nome: nomeCliente }))
      }))
      .sort((a, b) => b.total - a.total);

    console.log(`🏆 Total vendedores no ranking: ${resultado.length}`);
    return resultado;
  }, [vendasFiltradas]);

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
        <DateFilter onFilterChange={handleFilterChange} statusList={statusList} gruposClientes={gruposClientes} vendedores={vendedoresList} hideStatusFilter={true} />

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
                    <TableHead className="w-[80px]"></TableHead>
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
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedVendedor({ nome: vendedor.nome, clientes: vendedor.clientesDetalhes })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog para mostrar clientes do vendedor */}
        <Dialog open={!!selectedVendedor} onOpenChange={() => setSelectedVendedor(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Clientes de {selectedVendedor?.nome}</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Cliente</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedVendedor?.clientes.map((cliente) => (
                    <TableRow key={cliente.doc}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell className="font-mono text-sm">{cliente.doc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AnaliseVendedores;
