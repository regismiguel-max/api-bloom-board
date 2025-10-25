import { useState } from "react";
import { useEstoque } from "@/hooks/useEstoque";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, AlertTriangle, TrendingUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AnaliseEstoque = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [estoqueMin, setEstoqueMin] = useState<string>("");
  const [estoqueMax, setEstoqueMax] = useState<string>("");
  const [appliedFilters, setAppliedFilters] = useState<{ estoqueMin?: number; estoqueMax?: number }>({});
  const itemsPerPage = 20;
  
  const { data, isLoading } = useEstoque({ 
    page: currentPage, 
    limit: itemsPerPage,
    ...appliedFilters
  });
  const { data: allData } = useEstoque({ page: 1, limit: 0 }); // Busca todos para KPIs

  // Ordena produtos por estoque decrescente (maior para menor)
  const estoque = (data?.estoque || []).sort((a, b) => (b.ESTOQUE_ATUAL || 0) - (a.ESTOQUE_ATUAL || 0));
  const totalItens = data?.total || 0;
  const totalPages = Math.ceil(totalItens / itemsPerPage);
  
  // KPIs calculados com TODOS os dados da base
  const allEstoque = allData?.estoque || [];
  const produtosSemEstoque = allEstoque.filter(item => (item.ESTOQUE_ATUAL || 0) === 0).length;
  const produtosEstoque10ouMenos = allEstoque.filter(item => {
    const qtd = item.ESTOQUE_ATUAL || 0;
    return qtd > 0 && qtd <= 10;
  }).length;

  const handleApplyFilter = () => {
    const filters: { estoqueMin?: number; estoqueMax?: number } = {};
    if (estoqueMin !== "") filters.estoqueMin = Number(estoqueMin);
    if (estoqueMax !== "") filters.estoqueMax = Number(estoqueMax);
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setEstoqueMin("");
    setEstoqueMax("");
    setAppliedFilters({});
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardNav />
        <div className="flex-1 p-8 ml-0 lg:ml-64">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNav />
      <div className="flex-1 p-8 ml-0 lg:ml-64">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Análise de Estoque</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItens}</div>
              <p className="text-xs text-muted-foreground">produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos sem Estoque</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {produtosSemEstoque}
              </div>
              <p className="text-xs text-muted-foreground">em toda a base</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque ≤ 10</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {produtosEstoque10ouMenos}
              </div>
              <p className="text-xs text-muted-foreground">em toda a base</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Produtos com Paginação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Estoque Atual
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                Página {currentPage} de {totalPages} - Total: {totalItens} itens
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filtros de Pesquisa */}
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="estoque-min">Estoque Mínimo</Label>
                  <Input
                    id="estoque-min"
                    type="number"
                    min="0"
                    placeholder="Ex: 0"
                    value={estoqueMin}
                    onChange={(e) => setEstoqueMin(e.target.value)}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="estoque-max">Estoque Máximo</Label>
                  <Input
                    id="estoque-max"
                    type="number"
                    min="0"
                    placeholder="Ex: 100"
                    value={estoqueMax}
                    onChange={(e) => setEstoqueMax(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleApplyFilter}>
                    <Search className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" onClick={handleClearFilter}>
                    Limpar
                  </Button>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estoque.length > 0 ? (
                  estoque.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {item.CODIGO_PRO}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.NOME_PRODUTO}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.ESTOQUE_ATUAL?.toLocaleString('pt-BR') || 0}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhum item encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Paginação */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItens)} de {totalItens}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnaliseEstoque;
