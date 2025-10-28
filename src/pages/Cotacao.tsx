import { useState } from "react";
import { useEstoque, ItemEstoque } from "@/hooks/useEstoque";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Trash2, Search, ShoppingCart, Share2 } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { RefreshButton } from "@/components/RefreshButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ItemCotacao extends ItemEstoque {
  quantidade: number;
  subtotal: number;
}

const Cotacao = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [itensCotacao, setItensCotacao] = useState<ItemCotacao[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data, isLoading } = useEstoque({ page: 1, limit: 0 });
  const estoque = data?.estoque || [];

  // Filtrar produtos baseado na pesquisa
  const produtosFiltrados = estoque.filter(item => {
    const termo = searchTerm.toLowerCase();
    return (
      item.CODIGO_PRO?.toLowerCase().includes(termo) ||
      item.NOME_PRODUTO?.toLowerCase().includes(termo)
    );
  });

  // Adicionar item à cotação
  const adicionarItem = (item: ItemEstoque) => {
    const jaExiste = itensCotacao.find(i => i.CODIGO_PRO === item.CODIGO_PRO);
    
    if (jaExiste) {
      toast({
        title: "Item já adicionado",
        description: "Este produto já está na cotação. Altere a quantidade se necessário.",
        variant: "destructive",
      });
      return;
    }

    const novoItem: ItemCotacao = {
      ...item,
      quantidade: 1,
      subtotal: item.VALOR_UNITARIO || 0,
    };

    setItensCotacao([...itensCotacao, novoItem]);
    setDialogOpen(false);
    toast({
      title: "Produto adicionado",
      description: `${item.NOME_PRODUTO} foi adicionado à cotação.`,
    });
  };

  // Atualizar quantidade
  const atualizarQuantidade = (codigo: string, quantidade: number) => {
    if (quantidade < 1) return;

    setItensCotacao(
      itensCotacao.map(item => {
        if (item.CODIGO_PRO === codigo) {
          return {
            ...item,
            quantidade,
            subtotal: (item.VALOR_UNITARIO || 0) * quantidade,
          };
        }
        return item;
      })
    );
  };

  // Remover item
  const removerItem = (codigo: string) => {
    setItensCotacao(itensCotacao.filter(item => item.CODIGO_PRO !== codigo));
    toast({
      title: "Item removido",
      description: "O produto foi removido da cotação.",
    });
  };

  // Calcular totais
  const valorTotal = itensCotacao.reduce((acc, item) => acc + item.subtotal, 0);
  const quantidadeTotal = itensCotacao.reduce((acc, item) => acc + item.quantidade, 0);

  // Limpar cotação
  const limparCotacao = () => {
    setItensCotacao([]);
    toast({
      title: "Cotação limpa",
      description: "Todos os itens foram removidos.",
    });
  };

  // Exportar cotação
  const exportarCotacao = () => {
    const texto = `COTAÇÃO - ${new Date().toLocaleDateString('pt-BR')}

Itens:
${itensCotacao.map((item, i) => 
  `${i + 1}. ${item.NOME_PRODUTO}
   Código: ${item.CODIGO_PRO}
   Quantidade: ${item.quantidade}
   Valor Unit.: R$ ${(item.VALOR_UNITARIO || 0).toFixed(2)}
   Subtotal: R$ ${item.subtotal.toFixed(2)}
`).join('\n')}

Total de Itens: ${quantidadeTotal}
Valor Total: R$ ${valorTotal.toFixed(2)}
`;

    const blob = new Blob([texto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cotacao_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Cotação exportada",
      description: "Arquivo de cotação baixado com sucesso.",
    });
  };

  // Compartilhar via WhatsApp
  const compartilharWhatsApp = () => {
    const texto = `*COTAÇÃO - ${new Date().toLocaleDateString('pt-BR')}*

*Itens:*
${itensCotacao.map((item, i) => 
  `${i + 1}. *${item.NOME_PRODUTO}*
   Código: ${item.CODIGO_PRO}
   Quantidade: ${item.quantidade}
   Valor Unit.: R$ ${(item.VALOR_UNITARIO || 0).toFixed(2)}
   Subtotal: R$ ${item.subtotal.toFixed(2)}`
).join('\n\n')}

*Total de Itens:* ${quantidadeTotal}
*Valor Total:* R$ ${valorTotal.toFixed(2)}`;

    const mensagemEncoded = encodeURIComponent(texto);
    window.open(`https://wa.me/?text=${mensagemEncoded}`, '_blank');
    
    toast({
      title: "Abrindo WhatsApp",
      description: "Compartilhe a cotação com seus contatos.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardNav pageTitle="Cotação" />
        <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 lg:ml-64 pt-[120px] md:pt-0 w-full overflow-x-hidden">
          <PageHeader 
            title="Cotação"
            description="Crie cotações baseadas no estoque disponível"
            icon={<FileText className="h-6 w-6 text-primary" />}
            action={<RefreshButton queryKeys={["estoque"]} />}
          />
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingIndicator message="Carregando produtos..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNav pageTitle="Cotação" />
      <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 lg:ml-64 pt-[120px] md:pt-0 w-full overflow-x-hidden">
        <PageHeader 
          title="Cotação"
          description="Crie cotações baseadas no estoque disponível"
          icon={<FileText className="h-6 w-6 text-primary" />}
          action={<RefreshButton queryKeys={["estoque"]} />}
        />

        {/* Resumo da Cotação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Itens na Cotação</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{itensCotacao.length}</div>
              <p className="text-xs text-muted-foreground">produtos selecionados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quantidade Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quantidadeTotal}</div>
              <p className="text-xs text-muted-foreground">unidades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <FileText className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">valor estimado</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Produtos para Adicionar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Produtos Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Pesquisar Produto</Label>
                  <Input
                    id="search"
                    placeholder="Código ou nome do produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Produto à Cotação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Selecionar Produto</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-x-auto overflow-y-auto">
                      {/* Desktop Table */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Código</TableHead>
                              <TableHead>Produto</TableHead>
                              <TableHead className="text-right">Estoque</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                              <TableHead className="text-center">Ação</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {produtosFiltrados.length > 0 ? (
                              produtosFiltrados.slice(0, 50).map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-mono text-sm">
                                    {item.CODIGO_PRO}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {item.NOME_PRODUTO}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Badge variant={(item.ESTOQUE_ATUAL || 0) > 0 ? "default" : "destructive"}>
                                      {item.ESTOQUE_ATUAL || 0}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    R$ {(item.VALOR_UNITARIO || 0).toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button
                                      size="sm"
                                      onClick={() => adicionarItem(item)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                  Nenhum produto encontrado
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Card List */}
                      <div className="md:hidden space-y-3">
                        {produtosFiltrados.length > 0 ? (
                          produtosFiltrados.slice(0, 50).map((item, index) => (
                            <Card key={index} className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{item.NOME_PRODUTO}</p>
                                    <p className="text-xs text-muted-foreground font-mono">
                                      {item.CODIGO_PRO}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => adicionarItem(item)}
                                    className="shrink-0"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Estoque:</span>
                                    <Badge variant={(item.ESTOQUE_ATUAL || 0) > 0 ? "default" : "destructive"} className="text-xs">
                                      {item.ESTOQUE_ATUAL || 0}
                                    </Badge>
                                  </div>
                                  <div className="font-medium">
                                    R$ {(item.VALOR_UNITARIO || 0).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            Nenhum produto encontrado
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <p className="text-xs text-muted-foreground">
                  {produtosFiltrados.length} produto(s) encontrado(s)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Itens da Cotação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Itens da Cotação
                </span>
                {itensCotacao.length > 0 && (
                  <Button variant="outline" size="sm" onClick={limparCotacao}>
                    Limpar
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {itensCotacao.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum item adicionado ainda</p>
                  <p className="text-sm">Adicione produtos à cotação</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {itensCotacao.map((item) => (
                    <Card key={item.CODIGO_PRO}>
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm sm:text-base">{item.NOME_PRODUTO}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Código: {item.CODIGO_PRO}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerItem(item.CODIGO_PRO || "")}
                              className="shrink-0"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <div className="flex-1 w-full sm:w-auto">
                              <Label htmlFor={`qtd-${item.CODIGO_PRO}`} className="text-xs sm:text-sm">Quantidade</Label>
                              <Input
                                id={`qtd-${item.CODIGO_PRO}`}
                                type="number"
                                min="1"
                                value={item.quantidade}
                                onChange={(e) =>
                                  atualizarQuantidade(
                                    item.CODIGO_PRO || "",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="text-sm sm:text-base"
                              />
                            </div>
                            <div className="flex-1 w-full sm:w-auto">
                              <Label className="text-xs sm:text-sm">Subtotal</Label>
                              <p className="text-base sm:text-lg font-bold text-success">
                                R$ {item.subtotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button
                      className="flex-1"
                      onClick={exportarCotacao}
                      disabled={itensCotacao.length === 0}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Exportar Cotação</span>
                      <span className="sm:hidden">Exportar</span>
                    </Button>
                    <Button
                      className="flex-1"
                      variant="secondary"
                      onClick={compartilharWhatsApp}
                      disabled={itensCotacao.length === 0}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Compartilhar no WhatsApp</span>
                      <span className="sm:hidden">WhatsApp</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cotacao;
