import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

interface Cliente {
  doc: string;
  nome: string;
  total: number;
  uf: string;
  pedidos: number;
  vendedor?: string;
}

interface RankingClientesTableProps {
  clientes: Cliente[];
}

const ITEMS_PER_PAGE = 5;

export const RankingClientesTable = ({ clientes }: RankingClientesTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(clientes.length / ITEMS_PER_PAGE);
  
  const paginatedClientes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return clientes.slice(startIndex, endIndex);
  }, [clientes, currentPage]);

  // Reset página quando dados mudarem
  useMemo(() => {
    setCurrentPage(1);
  }, [clientes]);

  if (clientes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Posição</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>UF</TableHead>
              <TableHead className="text-center">Pedidos</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClientes.map((cliente, index) => {
              const posicaoGeral = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
              return (
                <TableRow key={cliente.doc}>
                  <TableCell className="font-bold">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      posicaoGeral === 1 ? 'bg-yellow-500/20 text-yellow-700' :
                      posicaoGeral === 2 ? 'bg-gray-400/20 text-gray-700' :
                      posicaoGeral === 3 ? 'bg-orange-500/20 text-orange-700' :
                      'bg-primary/10 text-primary'
                    } text-sm`}>
                      {posicaoGeral}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{cliente.vendedor || '-'}</TableCell>
                  <TableCell>{cliente.uf}</TableCell>
                  <TableCell className="text-center">{cliente.pedidos}</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency', 
                      currency: 'BRL',
                      minimumFractionDigits: 2
                    }).format(cliente.total)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {paginatedClientes.length} de {clientes.length} clientes • Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {totalPages <= 1 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Total: {clientes.length} clientes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
