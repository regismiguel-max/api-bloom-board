import { DashboardNav } from "@/components/DashboardNav";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { RefreshButton } from "@/components/RefreshButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateFilter } from "@/components/DateFilter";
import { RankingClientesTable } from "@/components/RankingClientesTable";
import { TabelaAnaliseClientes } from "@/components/TabelaAnaliseClientes";
import { useVendas } from "@/hooks/useVendas";
import { useClientes } from "@/hooks/useClientes";
import { useMemo, useState } from "react";
import { MapPin, Users, TrendingUp } from "lucide-react";
import { format, startOfMonth, endOfMonth, differenceInDays, parse } from "date-fns";
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

  const handleFilterChange = (dataInicio: string, dataFim: string, statusPedido?: string[], tipoCliente?: string, nomeGrupo?: string, vendedor?: string) => {
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

  // Análise de tempo desde última compra
  const analiseUltimaCompra = useMemo(() => {
    if (!clientes.length) return { media: 0, distribuicao: [], clientesInativos: 0 };

    const hoje = new Date();
    const diasDesdeUltimaCompra: number[] = [];
    let clientesComData = 0;
    let clientesInativos = 0;

    clientes.forEach((cliente) => {
      if (cliente.ULTIMA_COMPRA) {
        try {
          // Tenta parsear a data no formato DD/MM/YYYY
          const dataUltimaCompra = parse(cliente.ULTIMA_COMPRA, 'dd/MM/yyyy', new Date());
          const dias = differenceInDays(hoje, dataUltimaCompra);
          
          if (!isNaN(dias) && dias >= 0) {
            diasDesdeUltimaCompra.push(dias);
            clientesComData++;
            
            // Considera inativo se não compra há mais de 90 dias
            if (dias > 90) {
              clientesInativos++;
            }
          }
        } catch (error) {
          console.warn('Erro ao parsear data:', cliente.ULTIMA_COMPRA);
        }
      }
    });

    const media = clientesComData > 0 
      ? Math.round(diasDesdeUltimaCompra.reduce((acc, val) => acc + val, 0) / clientesComData)
      : 0;

    // Criar distribuição por faixas
    const faixas = {
      '0-30 dias': 0,
      '31-60 dias': 0,
      '61-90 dias': 0,
      '91-180 dias': 0,
      '181-365 dias': 0,
      'Mais de 1 ano': 0,
    };

    diasDesdeUltimaCompra.forEach((dias) => {
      if (dias <= 30) faixas['0-30 dias']++;
      else if (dias <= 60) faixas['31-60 dias']++;
      else if (dias <= 90) faixas['61-90 dias']++;
      else if (dias <= 180) faixas['91-180 dias']++;
      else if (dias <= 365) faixas['181-365 dias']++;
      else faixas['Mais de 1 ano']++;
    });

    const distribuicao = Object.entries(faixas).map(([faixa, count]) => ({
      faixa,
      count,
    }));

    return { media, distribuicao, clientesInativos };
  }, [clientes]);

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(210, 100%, 60%)',
    'hsl(340, 100%, 60%)',
    'hsl(45, 100%, 60%)',
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      <DashboardNav pageTitle="Análise de Clientes" />
      
      <main className="flex-1 lg:ml-64 pt-[120px] md:pt-0 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 w-full overflow-x-hidden">
        <PageHeader 
          title="Análise de Clientes"
          description="Ranking completo e distribuição geográfica dos clientes"
          icon={<TrendingUp className="h-6 w-6 text-primary" />}
          action={<RefreshButton queryKeys={["vendas", "clientes"]} />}
        />

        {/* Filtro de Data */}
        <DateFilter onFilterChange={handleFilterChange} statusList={[]} gruposClientes={gruposClientes} hideStatusFilter={true} />

        {/* Loading indicator */}
        {isLoading && <LoadingIndicator />}

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

        {/* Ranking de Clientes */}
        <RankingClientesTable clientes={rankingClientes} />

        {/* Análise Detalhada por Cliente */}
        <TabelaAnaliseClientes clientes={clientes} />

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
      </main>
    </div>
  );
};

export default AnaliseClientes;
