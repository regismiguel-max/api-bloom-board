import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { differenceInDays, parse } from "date-fns";
import { Cliente } from "@/hooks/useClientes";

interface TabelaAnaliseClientesProps {
  clientes: Cliente[];
}

const ITEMS_PER_PAGE = 20;

export const TabelaAnaliseClientes = ({ clientes }: TabelaAnaliseClientesProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const parseData = (dataStr: string | undefined): Date | null => {
    if (!dataStr) return null;
    try {
      return parse(dataStr, 'dd/MM/yyyy', new Date());
    } catch {
      return null;
    }
  };

  const calcularDiasSemComprar = (dataStr: string | undefined): number | null => {
    const data = parseData(dataStr);
    if (!data || isNaN(data.getTime())) return null;
    const hoje = new Date();
    const dias = differenceInDays(hoje, data);
    return dias >= 0 ? dias : null;
  };

  // Filtrar apenas clientes com ULTIMA_COMPRA e ordenar por dias sem comprar (maior primeiro)
  const clientesComDatas = useMemo(() => {
    return clientes
      .filter(c => c.ULTIMA_COMPRA)
      .map(c => ({
        ...c,
        diasSemComprar: calcularDiasSemComprar(c.ULTIMA_COMPRA)
      }))
      .sort((a, b) => (b.diasSemComprar || 0) - (a.diasSemComprar || 0));
  }, [clientes]);

  const totalPages = Math.ceil(clientesComDatas.length / ITEMS_PER_PAGE);
  
  const paginatedClientes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return clientesComDatas.slice(startIndex, endIndex);
  }, [clientesComDatas, currentPage]);

  // Reset página quando dados mudarem
  useMemo(() => {
    setCurrentPage(1);
  }, [clientesComDatas]);

  if (clientesComDatas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada por Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Nenhum cliente com data de compra disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise Detalhada por Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>UF</TableHead>
                <TableHead className="text-center">Última Compra</TableHead>
                <TableHead className="text-center">Dias sem Comprar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClientes.map((cliente, index) => {
                const posicaoGeral = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                const nomeCliente = cliente.NOME_CLIENTE || cliente.NOME || cliente.nome || 'Cliente Desconhecido';
                const uf = cliente.UF || '-';
                const diasSemComprar = cliente.diasSemComprar;

                return (
                  <TableRow key={cliente.CODIGO_CLIENTE || index}>
                    <TableCell className="text-muted-foreground text-sm">{posicaoGeral}</TableCell>
                    <TableCell className="font-medium">{nomeCliente}</TableCell>
                    <TableCell className="text-sm">{uf}</TableCell>
                    <TableCell className="text-center text-sm">{cliente.ULTIMA_COMPRA || '-'}</TableCell>
                    <TableCell className="text-center">
                      {diasSemComprar !== null ? (
                        <span className={`font-bold text-base ${
                          diasSemComprar > 180 ? 'text-destructive' : 
                          diasSemComprar > 90 ? 'text-orange-500' : 
                          diasSemComprar > 60 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {diasSemComprar}
                        </span>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {paginatedClientes.length} de {clientesComDatas.length} clientes • Página {currentPage} de {totalPages}
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
              Total: {clientesComDatas.length} clientes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

