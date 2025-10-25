import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVendas } from "@/hooks/useVendas";
import { useClientes } from "@/hooks/useClientes";
import { useMemo, useState } from "react";
import { Loader2, Users, TrendingUp, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, subMonths } from "date-fns";

const CarteiraClientes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Definir período padrão: últimos 12 meses
  const dateFilters = useMemo(() => {
    const dataFim = new Date();
    const dataInicio = subMonths(dataFim, 12);
    return {
      dataInicio: format(dataInicio, 'yyyy-MM-dd'),
      dataFim: format(dataFim, 'yyyy-MM-dd')
    };
  }, []);

  const { data: vendas = [], isLoading: isLoadingVendas } = useVendas(dateFilters);
  const { data: clientes = [], isLoading: isLoadingClientes } = useClientes();
  
  const isLoading = isLoadingVendas || isLoadingClientes;

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

  // Criar lista de todos os clientes com seus vendedores
  const todosClientesComVendedor = useMemo(() => {
    const clientesMap = new Map<string, {
      doc: string;
      nome: string;
      email?: string;
      telefone?: string;
      cidade?: string;
      uf?: string;
      grupo?: string;
      vendedores: Set<string>;
    }>();

    carteiraVendedores.forEach((vendedorData) => {
      vendedorData.clientes.forEach((cliente) => {
        if (!clientesMap.has(cliente.doc)) {
          clientesMap.set(cliente.doc, {
            ...cliente,
            vendedores: new Set()
          });
        }
        clientesMap.get(cliente.doc)!.vendedores.add(vendedorData.vendedor);
      });
    });

    return Array.from(clientesMap.values()).map(cliente => ({
      ...cliente,
      vendedores: Array.from(cliente.vendedores).join(', ')
    })).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [carteiraVendedores]);

  // Filtrar clientes pela pesquisa
  const clientesFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return todosClientesComVendedor;

    const searchLower = searchTerm.toLowerCase();
    return todosClientesComVendedor.filter(cliente => 
      cliente.nome.toLowerCase().includes(searchLower) ||
      cliente.doc.includes(searchTerm) ||
      cliente.vendedores.toLowerCase().includes(searchLower) ||
      cliente.grupo?.toLowerCase().includes(searchLower) ||
      cliente.cidade?.toLowerCase().includes(searchLower)
    );
  }, [todosClientesComVendedor, searchTerm]);

  // Paginação
  const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage);
  const clientesPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return clientesFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [clientesFiltrados, currentPage]);

  // Reset página quando filtro mudar
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalVendedores = carteiraVendedores.length;
    const totalClientesUnicos = todosClientesComVendedor.length;
    
    return { totalVendedores, totalClientesUnicos };
  }, [carteiraVendedores, todosClientesComVendedor]);

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

        {/* Barra de Pesquisa */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar por cliente, vendedor, documento, grupo ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lista de Clientes</span>
              <span className="text-sm font-normal text-muted-foreground">
                {clientesFiltrados.length} {clientesFiltrados.length === 1 ? 'cliente' : 'clientes'}
                {searchTerm && ` encontrado${clientesFiltrados.length !== 1 ? 's' : ''}`}
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
                    <TableHead>Vendedor(es)</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Cidade/UF</TableHead>
                    <TableHead>Telefone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesPaginados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente disponível'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientesPaginados.map((cliente) => (
                      <TableRow key={cliente.doc}>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {cliente.doc.length === 11 
                            ? cliente.doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                            : cliente.doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                          }
                        </TableCell>
                        <TableCell className="font-medium text-primary">{cliente.vendedores}</TableCell>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CarteiraClientes;
