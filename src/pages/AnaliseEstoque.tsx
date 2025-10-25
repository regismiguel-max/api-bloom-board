import { useMemo, useState } from "react";
import { useEstoque } from "@/hooks/useEstoque";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
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

const AnaliseEstoque = () => {
  const { data: estoque, isLoading } = useEstoque();

  const analiseEstoque = useMemo(() => {
    if (!estoque || estoque.length === 0) return null;

    const totalItens = estoque.length;
    const quantidadeTotal = estoque.reduce((acc, item) => acc + (item.QUANTIDADE || 0), 0);
    const valorTotal = estoque.reduce((acc, item) => 
      acc + ((item.QUANTIDADE || 0) * (item.VALOR_UNITARIO || 0)), 0
    );
    
    const itensAbaixoMinimo = estoque.filter(item => 
      item.ESTOQUE_MINIMO && item.QUANTIDADE < item.ESTOQUE_MINIMO
    ).length;

    // Produtos com baixo estoque
    const produtosBaixoEstoque = estoque
      .filter(item => item.ESTOQUE_MINIMO && item.QUANTIDADE < item.ESTOQUE_MINIMO)
      .sort((a, b) => (a.QUANTIDADE || 0) - (b.QUANTIDADE || 0))
      .slice(0, 10);

    // Produtos de maior valor
    const produtosMaiorValor = estoque
      .map(item => ({
        ...item,
        valorTotal: (item.QUANTIDADE || 0) * (item.VALOR_UNITARIO || 0)
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 10);

    return {
      totalItens,
      quantidadeTotal,
      valorTotal,
      itensAbaixoMinimo,
      produtosBaixoEstoque,
      produtosMaiorValor,
    };
  }, [estoque]);

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

        {analiseEstoque && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analiseEstoque.totalItens}</div>
                  <p className="text-xs text-muted-foreground">produtos cadastrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quantidade Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analiseEstoque.quantidadeTotal.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-muted-foreground">unidades em estoque</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analiseEstoque.valorTotal.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">valor do estoque</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Baixo Estoque</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {analiseEstoque.itensAbaixoMinimo}
                  </div>
                  <p className="text-xs text-muted-foreground">itens abaixo do mínimo</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabelas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Produtos com Baixo Estoque */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Produtos Abaixo do Mínimo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Mín</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analiseEstoque.produtosBaixoEstoque.length > 0 ? (
                        analiseEstoque.produtosBaixoEstoque.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {item.NOME_PRODUTO}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.QUANTIDADE}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.ESTOQUE_MINIMO}
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive">Crítico</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Nenhum item abaixo do estoque mínimo
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Produtos de Maior Valor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Top 10 Maior Valor em Estoque
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analiseEstoque.produtosMaiorValor.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.NOME_PRODUTO}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.QUANTIDADE}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {item.valorTotal.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnaliseEstoque;
