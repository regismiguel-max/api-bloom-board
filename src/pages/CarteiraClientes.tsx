import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVendas } from "@/hooks/useVendas";
import { useClientes } from "@/hooks/useClientes";
import { useMemo } from "react";
import { Loader2, Users, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CarteiraClientes = () => {
  const { data: vendas = [], isLoading } = useVendas();
  const { data: clientes = [] } = useClientes();

  // Criar mapa de clientes para enriquecer com dados completos
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

  // Agrupar vendas por vendedor e seus clientes
  const carteiraVendedores = useMemo(() => {
    if (!vendas.length) return [];

    // Filtrar apenas vendas com status OK
    const vendasOK = vendas.filter(v => v.STATUS_PEDIDO === 'OK');
    
    // Agrupar por vendedor
    const vendedorMap = new Map<string, { 
      vendedor: string; 
      clientes: Map<string, { 
        nome: string; 
        doc: string; 
        email?: string; 
        telefone?: string;
        cidade?: string;
        uf?: string;
        grupo?: string;
      }> 
    }>();

    vendasOK.forEach((venda) => {
      const vendedor = venda.VENDEDOR_NOME || 'Vendedor Desconhecido';
      const clienteDoc = venda.CLIENTE_DOC?.replace(/\D/g, '');
      const clienteNome = venda.CLIENTE_NOME || 'Cliente Desconhecido';
      
      if (!clienteDoc) return;

      // Buscar dados completos do cliente
      const clienteCompleto = clientesMap.get(clienteDoc);
      
      if (!vendedorMap.has(vendedor)) {
        vendedorMap.set(vendedor, { 
          vendedor, 
          clientes: new Map() 
        });
      }
      
      const vendedorData = vendedorMap.get(vendedor)!;
      
      if (!vendedorData.clientes.has(clienteDoc)) {
        vendedorData.clientes.set(clienteDoc, {
          nome: clienteCompleto?.NOME_CLIENTE || clienteNome,
          doc: clienteDoc,
          email: clienteCompleto?.email,
          telefone: clienteCompleto?.CELULAR,
          cidade: clienteCompleto?.CIDADE,
          uf: clienteCompleto?.UF,
          grupo: clienteCompleto?.NOME_GRUPO,
        });
      }
    });

    // Converter para array e ordenar
    const resultado = Array.from(vendedorMap.values())
      .map(data => ({
        vendedor: data.vendedor,
        totalClientes: data.clientes.size,
        clientes: Array.from(data.clientes.values()).sort((a, b) => a.nome.localeCompare(b.nome))
      }))
      .sort((a, b) => b.totalClientes - a.totalClientes);

    return resultado;
  }, [vendas, clientesMap]);

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalVendedores = carteiraVendedores.length;
    const totalClientesUnicos = new Set(
      carteiraVendedores.flatMap(v => v.clientes.map(c => c.doc))
    ).size;
    
    return { totalVendedores, totalClientesUnicos };
  }, [carteiraVendedores]);

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Carteira de Clientes</h1>
          <p className="text-muted-foreground">Clientes atendidos por cada vendedor.</p>
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
        <div className="grid gap-6 md:grid-cols-2">
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
              <CardTitle className="text-sm font-medium">Total de Clientes Únicos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalClientesUnicos}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Vendedores e seus Clientes */}
        <div className="space-y-6">
          {carteiraVendedores.map((vendedorData) => (
            <Card key={vendedorData.vendedor}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{vendedorData.vendedor}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {vendedorData.totalClientes} {vendedorData.totalClientes === 1 ? 'cliente' : 'clientes'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Cliente</TableHead>
                        <TableHead>CPF/CNPJ</TableHead>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Cidade/UF</TableHead>
                        <TableHead>Telefone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendedorData.clientes.map((cliente) => (
                        <TableRow key={cliente.doc}>
                          <TableCell className="font-medium">{cliente.nome}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {cliente.doc.length === 11 
                              ? cliente.doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                              : cliente.doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                            }
                          </TableCell>
                          <TableCell>{cliente.grupo || '-'}</TableCell>
                          <TableCell>
                            {cliente.cidade && cliente.uf 
                              ? `${cliente.cidade}/${cliente.uf}` 
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {cliente.telefone || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CarteiraClientes;
