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

const ITEMS_PER_PAGE = 10;

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

  const calcularDias = (dataStr: string | undefined): number | null => {
    const data = parseData(dataStr);
    if (!data || isNaN(data.getTime())) return null;
    const hoje = new Date();
    const dias = differenceInDays(hoje, data);
    return dias >= 0 ? dias : null;
  };

  // Filtrar apenas clientes com ULTIMA_COMPRA
  const clientesComDatas = useMemo(() => {
    return clientes.filter(c => c.ULTIMA_COMPRA);
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
                <TableHead>Cliente</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead className="text-center">Dias desde Cadastro</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead className="text-center">Dias</TableHead>
                <TableHead>Penúltima Compra</TableHead>
                <TableHead className="text-center">Dias</TableHead>
                <TableHead>Terceira Compra</TableHead>
                <TableHead className="text-center">Dias</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClientes.map((cliente, index) => {
                const nomeCliente = cliente.NOME_CLIENTE || cliente.NOME || cliente.nome || 'Cliente Desconhecido';
                const diasCadastro = calcularDias(cliente.DATA_CADASTRO);
                const diasUltima = calcularDias(cliente.ULTIMA_COMPRA);
                const diasPenultima = calcularDias(cliente.PENULTIMA_COMPRA);
                const diasTerceira = calcularDias(cliente.TERCEIRA_COMPRA);

                return (
                  <TableRow key={cliente.CODIGO_CLIENTE || index}>
                    <TableCell className="font-medium">{nomeCliente}</TableCell>
                    <TableCell className="text-sm">{cliente.DATA_CADASTRO || '-'}</TableCell>
                    <TableCell className="text-center text-sm">
                      {diasCadastro !== null ? (
                        <span className="font-semibold">{diasCadastro}</span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-sm">{cliente.ULTIMA_COMPRA || '-'}</TableCell>
                    <TableCell className="text-center text-sm">
                      {diasUltima !== null ? (
                        <span className={`font-semibold ${
                          diasUltima > 90 ? 'text-destructive' : 
                          diasUltima > 60 ? 'text-orange-500' : 
                          'text-green-600'
                        }`}>
                          {diasUltima}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-sm">{cliente.PENULTIMA_COMPRA || '-'}</TableCell>
                    <TableCell className="text-center text-sm">
                      {diasPenultima !== null ? (
                        <span className="font-semibold">{diasPenultima}</span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-sm">{cliente.TERCEIRA_COMPRA || '-'}</TableCell>
                    <TableCell className="text-center text-sm">
                      {diasTerceira !== null ? (
                        <span className="font-semibold">{diasTerceira}</span>
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
