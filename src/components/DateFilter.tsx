import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, ChevronDown, Filter, X, Check } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DateFilterProps {
  onFilterChange: (
    dataInicio: string,
    dataFim: string,
    statusPedido?: string[],
    tipoCliente?: string,
    nomeGrupo?: string,
    vendedor?: string
  ) => void;
  statusList?: string[];
  gruposClientes?: string[];
  vendedores?: string[];
  hideStatusFilter?: boolean;
}

export const DateFilter = ({
  onFilterChange,
  statusList = [],
  gruposClientes = [],
  vendedores = [],
  hideStatusFilter = false,
}: DateFilterProps) => {
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

  // Estados temporários para o mobile (aplicados ao fechar o drawer)
  const [tempDate, setTempDate] = useState<DateRange | undefined>(date);
  const [tempStatusPedido, setTempStatusPedido] = useState<string[]>([]);
  const [tempTipoCliente, setTempCliente] = useState<string>("todos");
  const [tempNomeGrupo, setTempGrupo] = useState<string>("todos");
  const [tempVendedor, setTempVendedor] = useState<string>("todos");

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);

    if (newDate?.from && newDate?.to) {
      const dataInicio = format(newDate.from, "yyyy-MM-dd");
      const dataFim = format(newDate.to, "yyyy-MM-dd");
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
      ? statusPedido.filter((s) => s !== status)
      : [...statusPedido, status];

    setStatusPedido(newStatus);

    if (date?.from && date?.to) {
      const dataInicio = format(date.from, "yyyy-MM-dd");
      const dataFim = format(date.to, "yyyy-MM-dd");
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
      const dataInicio = format(date.from, "yyyy-MM-dd");
      const dataFim = format(date.to, "yyyy-MM-dd");
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
      const dataInicio = format(date.from, "yyyy-MM-dd");
      const dataFim = format(date.to, "yyyy-MM-dd");
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
      const dataInicio = format(date.from, "yyyy-MM-dd");
      const dataFim = format(date.to, "yyyy-MM-dd");
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

  const handlePresetClick = (
    preset: "mes-atual" | "ultimos-30" | "ultimos-90"
  ) => {
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (preset) {
      case "mes-atual":
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case "ultimos-30":
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "ultimos-90":
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    const newDate = { from, to };
    setDate(newDate);

    const dataInicio = format(from, "yyyy-MM-dd");
    const dataFim = format(to, "yyyy-MM-dd");
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
      const dataInicio = format(date.from, "yyyy-MM-dd");
      const dataFim = format(date.to, "yyyy-MM-dd");
      onFilterChange(dataInicio, dataFim, undefined, undefined, undefined, undefined);
    }
  };

  const applyMobileFilters = () => {
    setDate(tempDate);
    setStatusPedido(tempStatusPedido);
    setTipoCliente(tempTipoCliente);
    setNomeGrupo(tempNomeGrupo);
    setVendedor(tempVendedor);

    if (tempDate?.from && tempDate?.to) {
      const dataInicio = format(tempDate.from, "yyyy-MM-dd");
      const dataFim = format(tempDate.to, "yyyy-MM-dd");
      onFilterChange(
        dataInicio,
        dataFim,
        tempStatusPedido.length > 0 ? tempStatusPedido : undefined,
        tempTipoCliente !== "todos" ? tempTipoCliente : undefined,
        tempNomeGrupo !== "todos" ? tempNomeGrupo : undefined,
        tempVendedor !== "todos" ? tempVendedor : undefined
      );
    }
    setIsOpen(false);
  };

  const activeFiltersCount =
    statusPedido.length +
    (tipoCliente !== "todos" ? 1 : 0) +
    (nomeGrupo !== "todos" ? 1 : 0) +
    (vendedor !== "todos" ? 1 : 0);

  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const currentStatusPedido = isMobile ? tempStatusPedido : statusPedido;
    const currentTipoCliente = isMobile ? tempTipoCliente : tipoCliente;
    const currentNomeGrupo = isMobile ? tempNomeGrupo : nomeGrupo;
    const currentVendedor = isMobile ? tempVendedor : vendedor;

    const handleStatusToggleLocal = (status: string) => {
      if (isMobile) {
        const newStatus = currentStatusPedido.includes(status)
          ? currentStatusPedido.filter((s) => s !== status)
          : [...currentStatusPedido, status];
        setTempStatusPedido(newStatus);
      } else {
        handleStatusToggle(status);
      }
    };

    const handleTipoClienteChangeLocal = (newTipo: string) => {
      if (isMobile) {
        setTempCliente(newTipo);
      } else {
        handleTipoClienteChange(newTipo);
      }
    };

    const handleNomeGrupoChangeLocal = (newGrupo: string) => {
      if (isMobile) {
        setTempGrupo(newGrupo);
      } else {
        handleNomeGrupoChange(newGrupo);
      }
    };

    const handleVendedorChangeLocal = (newVendedor: string) => {
      if (isMobile) {
        setTempVendedor(newVendedor);
      } else {
        handleVendedorChange(newVendedor);
      }
    };

    const clearAllFiltersLocal = () => {
      if (isMobile) {
        setTempStatusPedido([]);
        setTempCliente("todos");
        setTempGrupo("todos");
        setTempVendedor("todos");
      } else {
        clearAllFilters();
      }
    };

    const activeCount = isMobile
      ? tempStatusPedido.length +
        (tempTipoCliente !== "todos" ? 1 : 0) +
        (tempNomeGrupo !== "todos" ? 1 : 0) +
        (tempVendedor !== "todos" ? 1 : 0)
      : activeFiltersCount;

    return (
      <div className="space-y-4">
        {!hideStatusFilter && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Status do Pedido:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {currentStatusPedido.length === 0
                    ? "Todos os status"
                    : currentStatusPedido.length === 1
                    ? currentStatusPedido[0]
                    : `${currentStatusPedido.length} selecionados`}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-3 bg-background z-50" align="start">
                <div className="space-y-2">
                  {statusList.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}-${isMobile ? 'mobile' : 'desktop'}`}
                        checked={currentStatusPedido.includes(status)}
                        onCheckedChange={() => handleStatusToggleLocal(status)}
                      />
                      <label
                        htmlFor={`status-${status}-${isMobile ? 'mobile' : 'desktop'}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Tipo de Cliente:</span>
          <Select value={currentTipoCliente} onValueChange={handleTipoClienteChangeLocal}>
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

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Grupo de Cliente:</span>
          <Select value={currentNomeGrupo} onValueChange={handleNomeGrupoChangeLocal}>
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

        {vendedores.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Vendedor:</span>
            <Select value={currentVendedor} onValueChange={handleVendedorChangeLocal}>
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

        {activeCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFiltersLocal}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile: período fixo + ícone filtro */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-1 py-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {date?.from && date?.to
                ? `${format(date.from, "dd/MM", { locale: ptBR })} - ${format(date.to, "dd/MM", { locale: ptBR })}`
                : "Mês Atual"}
            </span>
          </div>

          <Sheet open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) {
              // Sincronizar estados temporários ao abrir
              setTempDate(date);
              setTempStatusPedido(statusPedido);
              setTempCliente(tipoCliente);
              setTempGrupo(nomeGrupo);
              setTempVendedor(vendedor);
            }
          }}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 relative">
                <Filter className="h-5 w-5" />
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] flex flex-col">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="flex-1 mt-6 overflow-y-auto space-y-6">
                {/* Período */}
                <div className="space-y-3">
                  <span className="text-sm font-medium">Período:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const now = new Date();
                        setTempDate({ from: startOfMonth(now), to: endOfMonth(now) });
                      }}
                    >
                      Mês Atual
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const now = new Date();
                        const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        setTempDate({ from, to: now });
                      }}
                    >
                      30 dias
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const now = new Date();
                        const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                        setTempDate({ from, to: now });
                      }}
                    >
                      90 dias
                    </Button>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="default" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempDate?.from && tempDate?.to
                          ? `${format(tempDate.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(
                              tempDate.to,
                              "dd/MM/yyyy",
                              { locale: ptBR }
                            )}`
                          : "Selecione período"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="range"
                        selected={tempDate}
                        onSelect={setTempDate}
                        numberOfMonths={1}
                        locale={ptBR}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Outros filtros */}
                <FilterContent isMobile={true} />
              </div>

              <SheetFooter className="mt-4 border-t pt-4">
                <Button
                  onClick={applyMobileFilters}
                  className="w-full"
                  size="lg"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Aplicar Filtros
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop: Layout completo */}
      <Card className="hidden md:block">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div
              className={cn(
                "grid gap-4",
                hideStatusFilter ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-4"
              )}
            >
              <FilterContent />
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Período:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePresetClick("mes-atual")}>
                  Mês Atual
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetClick("ultimos-30")}>
                  Últimos 30 dias
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetClick("ultimos-90")}>
                  Últimos 90 dias
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "dd/MM/yyyy", { locale: ptBR })} - {" "}
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
