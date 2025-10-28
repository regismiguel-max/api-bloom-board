import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNav } from "@/components/DashboardNav";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { RefreshButton } from "@/components/RefreshButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Eye, Trash2, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Cotacao {
  id: string;
  numero_cotacao: string;
  cliente_nome: string;
  cliente_doc: string;
  data_cotacao: string;
  valor_total: number;
  quantidade_total: number;
  status: string;
  observacoes?: string;
}

interface ItemCotacao {
  id: string;
  codigo_produto: string;
  nome_produto: string;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
}

const CotacoesSalvas = () => {
  const [cotacaoSelecionada, setCotacaoSelecionada] = useState<Cotacao | null>(null);
  const [dialogDetalhesOpen, setDialogDetalhesOpen] = useState(false);
  const { toast } = useToast();

  // Buscar cotações
  const { data: cotacoes, isLoading, refetch } = useQuery({
    queryKey: ["cotacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cotacoes")
        .select("*")
        .order("data_cotacao", { ascending: false });

      if (error) throw error;
      return data as Cotacao[];
    },
  });

  // Buscar itens da cotação selecionada
  const { data: itensCotacao, isLoading: loadingItens } = useQuery({
    queryKey: ["cotacao-itens", cotacaoSelecionada?.id],
    queryFn: async () => {
      if (!cotacaoSelecionada?.id) return [];
      
      const { data, error } = await supabase
        .from("cotacao_itens")
        .select("*")
        .eq("cotacao_id", cotacaoSelecionada.id);

      if (error) throw error;
      return data as ItemCotacao[];
    },
    enabled: !!cotacaoSelecionada?.id,
  });

  const visualizarCotacao = (cotacao: Cotacao) => {
    setCotacaoSelecionada(cotacao);
    setDialogDetalhesOpen(true);
  };

  const deletarCotacao = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta cotação?")) return;

    try {
      const { error } = await supabase
        .from("cotacoes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Cotação excluída",
        description: "A cotação foi excluída com sucesso.",
      });

      refetch();
    } catch (error) {
      console.error("Erro ao excluir cotação:", error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a cotação.",
        variant: "destructive",
      });
    }
  };

  const compartilharWhatsApp = (cotacao: Cotacao, itens: ItemCotacao[]) => {
    const texto = `*COTAÇÃO ${cotacao.numero_cotacao}*
*Data:* ${format(new Date(cotacao.data_cotacao), "dd/MM/yyyy")}
*Cliente:* ${cotacao.cliente_nome}
*Documento:* ${cotacao.cliente_doc}

*Itens:*
${itens.map((item, i) => 
  `${i + 1}. *${item.nome_produto}*
   Código: ${item.codigo_produto}
   Quantidade: ${item.quantidade}
   Valor Unit.: R$ ${item.valor_unitario.toFixed(2)}
   Subtotal: R$ ${item.subtotal.toFixed(2)}`
).join('\n\n')}

*Total de Itens:* ${cotacao.quantidade_total}
*Valor Total:* R$ ${cotacao.valor_total.toFixed(2)}

${cotacao.observacoes ? `*Observações:*\n${cotacao.observacoes}` : ''}`;

    const mensagemEncoded = encodeURIComponent(texto);
    window.open(`https://wa.me/?text=${mensagemEncoded}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardNav pageTitle="Cotações Salvas" />
        <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 lg:ml-64 pt-[120px] md:pt-0 w-full overflow-x-hidden">
          <PageHeader
            title="Cotações Salvas"
            description="Visualize e gerencie suas cotações"
            icon={<FileText className="h-6 w-6 text-primary" />}
            action={<RefreshButton queryKeys={["cotacoes"]} />}
          />
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingIndicator message="Carregando cotações..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNav pageTitle="Cotações Salvas" />
      <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 lg:ml-64 pt-[120px] md:pt-0 w-full overflow-x-hidden">
        <PageHeader
          title="Cotações Salvas"
          description="Visualize e gerencie suas cotações"
          icon={<FileText className="h-6 w-6 text-primary" />}
          action={<RefreshButton queryKeys={["cotacoes"]} />}
        />

        <Card>
          <CardHeader>
            <CardTitle>Lista de Cotações</CardTitle>
          </CardHeader>
          <CardContent>
            {!cotacoes || cotacoes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma cotação encontrada</p>
                <p className="text-sm">Crie uma nova cotação na página de cotação</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Itens</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cotacoes.map((cotacao) => (
                        <TableRow key={cotacao.id}>
                          <TableCell className="font-mono text-sm">
                            {cotacao.numero_cotacao}
                          </TableCell>
                          <TableCell>
                            {format(new Date(cotacao.data_cotacao), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>{cotacao.cliente_nome}</TableCell>
                          <TableCell className="text-right">
                            {cotacao.quantidade_total}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            R$ {cotacao.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={cotacao.status === "aberta" ? "default" : "secondary"}
                            >
                              {cotacao.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => visualizarCotacao(cotacao)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deletarCotacao(cotacao.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {cotacoes.map((cotacao) => (
                    <Card key={cotacao.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-sm font-medium truncate">
                              {cotacao.numero_cotacao}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(cotacao.data_cotacao), "dd/MM/yyyy")}
                            </p>
                          </div>
                          <Badge
                            variant={cotacao.status === "aberta" ? "default" : "secondary"}
                            className="shrink-0"
                          >
                            {cotacao.status}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium truncate">{cotacao.cliente_nome}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {cotacao.quantidade_total} {cotacao.quantidade_total === 1 ? 'item' : 'itens'}
                            </span>
                            <span className="font-medium text-success">
                              R$ {cotacao.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => visualizarCotacao(cotacao)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletarCotacao(cotacao.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dialog de detalhes da cotação */}
        <Dialog open={dialogDetalhesOpen} onOpenChange={setDialogDetalhesOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                Detalhes da Cotação - {cotacaoSelecionada?.numero_cotacao}
              </DialogTitle>
            </DialogHeader>

            {cotacaoSelecionada && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium text-sm sm:text-base break-words">{cotacaoSelecionada.cliente_nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Documento</p>
                    <p className="font-medium text-sm sm:text-base">{cotacaoSelecionada.cliente_doc}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium text-sm sm:text-base">
                      {format(new Date(cotacaoSelecionada.data_cotacao), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={cotacaoSelecionada.status === "aberta" ? "default" : "secondary"}>
                      {cotacaoSelecionada.status}
                    </Badge>
                  </div>
                </div>

                {cotacaoSelecionada.observacoes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm bg-muted p-3 rounded-md break-words">
                      {cotacaoSelecionada.observacoes}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3 text-sm sm:text-base">Itens da Cotação</h3>
                  {loadingItens ? (
                    <LoadingIndicator message="Carregando itens..." />
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden sm:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Código</TableHead>
                              <TableHead>Produto</TableHead>
                              <TableHead className="text-right">Qtd</TableHead>
                              <TableHead className="text-right">Valor Unit.</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {itensCotacao?.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-mono text-sm">
                                  {item.codigo_produto}
                                </TableCell>
                                <TableCell>{item.nome_produto}</TableCell>
                                <TableCell className="text-right">{item.quantidade}</TableCell>
                                <TableCell className="text-right">
                                  R$ {item.valor_unitario.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  R$ {item.subtotal.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="sm:hidden space-y-3">
                        {itensCotacao?.map((item) => (
                          <Card key={item.id} className="p-3">
                            <div className="space-y-2">
                              <div>
                                <p className="font-medium text-sm truncate">{item.nome_produto}</p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {item.codigo_produto}
                                </p>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Qtd</p>
                                  <p className="font-medium">{item.quantidade}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Unit.</p>
                                  <p className="font-medium">R$ {item.valor_unitario.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Total</p>
                                  <p className="font-medium text-success">R$ {item.subtotal.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl sm:text-2xl font-bold text-success">
                      R$ {cotacaoSelecionada.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <Button
                    onClick={() => compartilharWhatsApp(cotacaoSelecionada, itensCotacao || [])}
                    disabled={!itensCotacao || itensCotacao.length === 0}
                    className="w-full sm:w-auto"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Compartilhar no WhatsApp</span>
                    <span className="sm:hidden">WhatsApp</span>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CotacoesSalvas;
