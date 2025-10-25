import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Eye, Search, Package, User, DollarSign } from "lucide-react";
import { useState, useMemo } from "react";

interface OrderItem {
  produto: string;
  marca: string;
}

interface Order {
  id: string;
  customer: string;
  customerDoc: string;
  amount: number;
  status: string;
  totalItems: number;
  vendedor: string;
  items: OrderItem[];
}

interface DataTableProps {
  orders: Order[];
  isLoading?: boolean;
  totalUnfiltered?: number;
}

const ITEMS_PER_PAGE = 10;

export const DataTable = ({ orders, isLoading, totalUnfiltered }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    
    const search = searchTerm.toLowerCase();
    return orders.filter(order => 
      order.id.toLowerCase().includes(search) ||
      order.customer.toLowerCase().includes(search) ||
      order.customerDoc.replace(/\D/g, '').includes(search.replace(/\D/g, ''))
    );
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage]);

  // Reset to page 1 when search changes or orders change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, orders]);

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("complet") || statusLower.includes("finaliz") || statusLower.includes("pago")) {
      return "bg-success/10 text-success hover:bg-success/20";
    }
    if (statusLower.includes("pend") || statusLower.includes("aguard")) {
      return "bg-warning/10 text-warning hover:bg-warning/20";
    }
    if (statusLower.includes("process") || statusLower.includes("andamento")) {
      return "bg-primary/10 text-primary hover:bg-primary/20";
    }
    return "bg-muted/10 text-muted-foreground hover:bg-muted/20";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            Nenhum pedido recente
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pesquisa de pedidos</CardTitle>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por pedido, cliente ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        {/* Gradiente indicador de scroll - apenas mobile */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background via-background/60 to-transparent pointer-events-none z-10 md:hidden" />
        
        {/* Container com scroll horizontal */}
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Pedido</TableHead>
                <TableHead className="w-[200px]">Cliente</TableHead>
                <TableHead className="w-[120px]">Valor</TableHead>
                <TableHead className="w-[100px] text-center">Itens</TableHead>
                <TableHead className="w-[130px]">Status</TableHead>
                <TableHead className="w-[100px] text-center sticky right-0 bg-background shadow-[-4px_0_8px_rgba(0,0,0,0.05)]">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <TableCell className="font-medium w-[120px]">{order.id}</TableCell>
                  <TableCell className="w-[200px]">
                    <div className="max-w-[180px] truncate" title={order.customer}>
                      {order.customer}
                    </div>
                  </TableCell>
                  <TableCell className="w-[120px]">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(order.amount)}
                  </TableCell>
                  <TableCell className="text-center font-medium w-[100px]">{order.totalItems}</TableCell>
                  <TableCell className="w-[130px]">
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center w-[100px] sticky right-0 bg-background shadow-[-4px_0_8px_rgba(0,0,0,0.05)]">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                          <DialogHeader className="border-b pb-4">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                              <Package className="h-6 w-6 text-primary" />
                              Pedido {order.id}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 mt-6">
                            {/* Informações do pedido em cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <User className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground font-medium">Cliente</p>
                                    <p className="font-semibold text-sm truncate">{order.customer}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gradient-to-br from-accent/5 to-accent/10 p-4 rounded-lg border border-accent/20">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-accent/10 rounded-lg">
                                    <User className="h-5 w-5 text-accent-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground font-medium">Vendedor</p>
                                    <p className="font-semibold text-sm truncate">{order.vendedor}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gradient-to-br from-success/5 to-success/10 p-4 rounded-lg border border-success/20">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-success/10 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-success" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground font-medium">Valor Total</p>
                                    <p className="font-semibold text-lg text-success">
                                      {new Intl.NumberFormat('pt-BR', { 
                                        style: 'currency', 
                                        currency: 'BRL' 
                                      }).format(order.amount)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Lista de produtos */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-lg flex items-center gap-2">
                                  <Package className="h-5 w-5 text-primary" />
                                  Produtos
                                  <Badge variant="secondary" className="ml-2">{order.items.length}</Badge>
                                </h4>
                              </div>
                              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="group p-4 rounded-lg border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200">
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                        {idx + 1}
                                      </div>
                                      <div className="flex-1 space-y-2 min-w-0">
                                        <div>
                                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Produto</span>
                                          <p className="font-semibold text-foreground break-words">{item.produto}</p>
                                        </div>
                                        <div>
                                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Marca</span>
                                          <p className="text-sm text-muted-foreground">{item.marca}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        
        <div className="px-6 pb-4">
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredOrders.length} pedidos
              {totalUnfiltered && totalUnfiltered !== orders.length && (
                <> de {totalUnfiltered} total</>
              )}
              {orders.length !== filteredOrders.length && orders.length !== totalUnfiltered && (
                <> | {orders.length} após filtros</>
              )} • Página {currentPage} de {totalPages}
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
                Total: {filteredOrders.length} pedidos
                {totalUnfiltered && totalUnfiltered !== orders.length && (
                  <> de {totalUnfiltered}</>
                )}
                {orders.length !== filteredOrders.length && orders.length !== totalUnfiltered && (
                  <> | {orders.length} após filtros da página</>
                )}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
