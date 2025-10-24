import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVendas } from "@/hooks/useVendas";
import { useClientes } from "@/hooks/useClientes";
import { useMemo } from "react";
import { Loader2, TrendingUp, MapPin, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const AnaliseClientes = () => {
  const { data: vendas = [], isLoading: isLoadingVendas } = useVendas();
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

  // Ranking de clientes por vendas com status OK
  const rankingClientes = useMemo(() => {
    if (!vendas.length) return [];

    // Filtrar apenas vendas com status OK
    const vendasOK = vendas.filter(v => v.STATUS_PEDIDO === 'OK');

    // Agrupar por cliente e calcular total
    const clienteVendas = new Map<string, { nome: string; total: number; uf: string }>();

    vendasOK.forEach((venda) => {
      const clienteDoc = venda.CLIENTE_DOC?.replace(/\D/g, '');
      const cliente = clienteDoc ? clientesMap.get(clienteDoc) : null;
      
      if (clienteDoc) {
        const key = clienteDoc;
        const existing = clienteVendas.get(key) || { 
          nome: venda.CLIENTE_NOME || 'Cliente Desconhecido', 
          total: 0,
          uf: cliente?.UF || 'N/A'
        };
        
        existing.total += venda.TOTAL_PEDIDO || 0;
        clienteVendas.set(key, existing);
      }
    });

    // Converter para array e ordenar por total
    return Array.from(clienteVendas.entries())
      .map(([doc, data]) => ({
        doc,
        nome: data.nome,
        total: data.total,
        uf: data.uf
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10
  }, [vendas, clientesMap]);

  // Distribuição por UF
  const distribuicaoPorUF = useMemo(() => {
    if (!clientes.length) return [];

    const ufCount = new Map<string, number>();
    
    clientes.forEach((cliente) => {
      const uf = cliente.UF || 'N/A';
      ufCount.set(uf, (ufCount.get(uf) || 0) + 1);
    });

    return Array.from(ufCount.entries())
      .map(([uf, count]) => ({ uf, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 estados
  }, [clientes]);

  const totalClientesAtivos = useMemo(() => {
    const clientesComVendas = new Set(
      vendas
        .filter(v => v.STATUS_PEDIDO === 'OK')
        .map(v => v.CLIENTE_DOC?.replace(/\D/g, ''))
        .filter(Boolean)
    );
    return clientesComVendas.size;
  }, [vendas]);

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
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientes.length.toLocaleString('pt-BR')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClientesAtivos.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground mt-1">Com pedidos finalizados</p>
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

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ranking de Clientes */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Clientes (Pedidos OK)</CardTitle>
            </CardHeader>
            <CardContent>
              {rankingClientes.length > 0 ? (
                <div className="space-y-4">
                  {rankingClientes.map((cliente, index) => (
                    <div key={cliente.doc} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{cliente.nome}</p>
                          <p className="text-xs text-muted-foreground">{cliente.uf}</p>
                        </div>
                      </div>
                      <p className="font-bold text-primary whitespace-nowrap ml-2">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(cliente.total)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribuição por UF */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Estado (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              {distribuicaoPorUF.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={distribuicaoPorUF}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="uf" 
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value} clientes`, 'Total']}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {distribuicaoPorUF.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AnaliseClientes;
