import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, ChevronDown, Filter, X } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DateFilterProps {
  onFilterChange: (dataInicio: string, dataFim: string, statusPedido?: string[], tipoCliente?: string, nomeGrupo?: string, vendedor?: string) => void;
  statusList?: string[];
  gruposClientes?: string[];
  vendedores?: string[];
  hideStatusFilter?: boolean;
}

export const DateFilter = ({ onFilterChange, statusList = [], gruposClientes = [], vendedores = [], hideStatusFilter = false }: DateFilterProps) => {
  const now = new Date();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(now),
    to: endOfMonth(now),
  });
  const [statusPedido, setStatusPedido] = useState<string[]>([]);
  const [tipoCliente, setTipoCliente] = useState<string>("todos");
  const [nomeGrupo, setNomeGrupo] = useState<string>("todos");
  const [vendedor, setVendedor] = useState<string>("todos");
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    
    if (newDate?.from && newDate?.to) {
      const dataInicio = format(newDate.from, 'yyyy-MM-dd');
      const dataFim = format(newDate.to, 'yyyy-MM-dd');
      onFilterChange(
        dataInicio, 
        dataFim, 
        statusPedido.length > 0 ? statusPedido : undefined,
        tipoCliente !== "todos" ? tipoCliente : undefined,
        nomeGrupo !== "todos" ? nomeGrupo : undefined,
        vendedor !== "todos" ? vendedor : undefined
      );
    }
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = statusPedido.includes(status)
      ? statusPedido.filter(s => s !== status)
      : [...statusPedido, status];
    
    setStatusPedido(newStatus);
    
    if (date?.from && date?.to) {
      const dataInicio = format(date.from, 'yyyy-MM-dd');
      const dataFim = format(date.to, 'yyyy-MM-dd');
      onFilterChange(
        dataInicio, 
        dataFim, 
        newStatus.length > 0 ? newStatus : undefined,
        tipoCliente !== "todos" ? tipoCliente : undefined,
        nomeGrupo !== "todos" ? nomeGrupo : undefined,
        vendedor !== "todos" ? vendedor : undefined
      );
    }
  };

  const handleTipoClienteChange = (newTipo: string) => {
    setTipoCliente(newTipo);
    
    if (date?.from && date?.to) {
      const dataInicio = format(date.from, 'yyyy-MM-dd');
      const dataFim = format(date.to, 'yyyy-MM-dd');
      onFilterChange(
        dataInicio, 
        dataFim, 
        statusPedido.length > 0 ? statusPedido : undefined,
        newTipo !== "todos" ? newTipo : undefined,
        nomeGrupo !== "todos" ? nomeGrupo : undefined,
        vendedor !== "todos" ? vendedor : undefined
      );
    }
  };

  const handleNomeGrupoChange = (newGrupo: string) => {
    setNomeGrupo(newGrupo);
    
    if (date?.from && date?.to) {
      const dataInicio = format(date.from, 'yyyy-MM-dd');
      const dataFim = format(date.to, 'yyyy-MM-dd');
      onFilterChange(
        dataInicio, 
        dataFim, 
        statusPedido.length > 0 ? statusPedido : undefined,
        tipoCliente !== "todos" ? tipoCliente : undefined,
        newGrupo !== "todos" ? newGrupo : undefined,
        vendedor !== "todos" ? vendedor : undefined
      );
    }
  };

  const handleVendedorChange = (newVendedor: string) => {
    setVendedor(newVendedor);
    
    if (date?.from && date?.to) {
      const dataInicio = format(date.from, 'yyyy-MM-dd');
      const dataFim = format(date.to, 'yyyy-MM-dd');
      onFilterChange(
        dataInicio, 
        dataFim, 
        statusPedido.length > 0 ? statusPedido : undefined,
        tipoCliente !== "todos" ? tipoCliente : undefined,
        nomeGrupo !== "todos" ? nomeGrupo : undefined,
        newVendedor !== "todos" ? newVendedor : undefined
      );
    }
  };

  const handlePresetClick = (preset: 'mes-atual' | 'ultimos-30' | 'ultimos-90') => {
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (preset) {
      case 'mes-atual':
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case 'ultimos-30':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'ultimos-90':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    const newDate = { from, to };
    setDate(newDate);
    
    const dataInicio = format(from, 'yyyy-MM-dd');
    const dataFim = format(to, 'yyyy-MM-dd');
    onFilterChange(
      dataInicio, 
      dataFim, 
      statusPedido.length > 0 ? statusPedido : undefined,
      tipoCliente !== "todos" ? tipoCliente : undefined,
      nomeGrupo !== "todos" ? nomeGrupo : undefined,
      vendedor !== "todos" ? vendedor : undefined
    );
  };

  const clearAllFilters = () => {
    setStatusPedido([]);
    setTipoCliente("todos");
    setNomeGrupo("todos");
    setVendedor("todos");
    
    if (date?.from && date?.to) {
      const dataInicio = format(date.from, 'yyyy-MM-dd');
      const dataFim = format(date.to, 'yyyy-MM-dd');
      onFilterChange(dataInicio, dataFim, undefined, undefined, undefined, undefined);
    }
  };

  const activeFiltersCount = 
    statusPedido.length + 
    (tipoCliente !== "todos" ? 1 : 0) + 
    (nomeGrupo !== "todos" ? 1 : 0) + 
    (vendedor !== "todos" ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Filtro de Status */}
      {!hideStatusFilter && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Status do Pedido:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {statusPedido.length === 0 
                  ? "Todos os status" 
                  : statusPedido.length === 1
                  ? statusPedido[0]
                  : `${statusPedido.length} selecionados`
                }
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-3 bg-background z-50" align="start">
              <div className="space-y-2">
                {statusList.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={statusPedido.includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    <label htmlFor={`status-${status}`} className="text-sm font-medium leading-none cursor-pointer">
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Filtro de Tipo de Cliente */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Tipo de Cliente:</span>
        <Select value={tipoCliente} onValueChange={handleTipoClienteChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pf">Pessoa Física (CPF)</SelectItem>
            <SelectItem value="pj">Pessoa Jurídica (CNPJ)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtro de Grupo de Cliente */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Grupo de Cliente:</span>
        <Select value={nomeGrupo} onValueChange={handleNomeGrupoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o grupo" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="todos">Todos</SelectItem>
            {gruposClientes.map((grupo) => (
              <SelectItem key={grupo} value={grupo}>
                {grupo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro de Vendedor */}
      {vendedores.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Vendedor:</span>
          <Select value={vendedor} onValueChange={handleVendedorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o vendedor" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="todos">Todos</SelectItem>
              {vendedores.map((vend) => (
                <SelectItem key={vend} value={vend}>
                  {vend}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {activeFiltersCount > 0 && (
        <Button variant="outline" size="sm" onClick={clearAllFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: Botão compacto com drawer */}
      <div className="md:hidden">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh]">
                  <SheetHeader>
                    <SheetTitle>Filtros Avançados</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Botões de período compactos */}
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => handlePresetClick('mes-atual')} className="text-xs px-2">
                  Mês
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetClick('ultimos-30')} className="text-xs px-2">
                  30d
                </Button>
              </div>

              {/* Data selecionada */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="default" size="sm" className="flex-1">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span className="text-xs truncate">
                      {date?.from && format(date.from, "dd/MM", { locale: ptBR })}
                      {date?.to && ` - ${format(date.to, "dd/MM", { locale: ptBR })}`}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={date}
                    onSelect={handleDateSelect}
                    numberOfMonths={1}
                    locale={ptBR}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop: Layout completo */}
      <Card className="hidden md:block">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Filtros em linha */}
            <div className={cn("grid gap-4", hideStatusFilter ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-4")}>
              <FilterContent />
            </div>

            {/* Filtro de Data */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Período:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePresetClick('mes-atual')}>
                  Mês Atual
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetClick('ultimos-30')}>
                  Últimos 30 dias
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetClick('ultimos-90')}>
                  Últimos 90 dias
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="default" size="sm" className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                            {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                          </>
                        ) : (
                          format(date.from, "dd/MM/yyyy", { locale: ptBR })
                        )
                      ) : (
                        <span>Selecione o período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="range"
                      selected={date}
                      onSelect={handleDateSelect}
                      numberOfMonths={2}
                      locale={ptBR}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
