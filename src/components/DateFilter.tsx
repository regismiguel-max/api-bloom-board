import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface DateFilterProps {
  onFilterChange: (dataInicio: string, dataFim: string, statusPedido?: string[], tipoCliente?: string, nomeGrupo?: string) => void;
  statusList?: string[];
  gruposClientes?: string[];
  hideStatusFilter?: boolean;
}

export const DateFilter = ({ onFilterChange, statusList = [], gruposClientes = [], hideStatusFilter = false }: DateFilterProps) => {
  const now = new Date();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(now),
    to: endOfMonth(now),
  });
  const [statusPedido, setStatusPedido] = useState<string[]>([]);
  const [tipoCliente, setTipoCliente] = useState<string>("todos");
  const [nomeGrupo, setNomeGrupo] = useState<string>("todos");

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
        nomeGrupo !== "todos" ? nomeGrupo : undefined
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
        nomeGrupo !== "todos" ? nomeGrupo : undefined
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
        nomeGrupo !== "todos" ? nomeGrupo : undefined
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
        newGrupo !== "todos" ? newGrupo : undefined
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
      nomeGrupo !== "todos" ? nomeGrupo : undefined
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Filtros em linha */}
          <div className={cn("grid gap-4", hideStatusFilter ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3")}>
            {/* Filtro de Status */}
            {!hideStatusFilter && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Status do Pedido:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
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
                          <label
                            htmlFor={`status-${status}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {status}
                          </label>
                        </div>
                      ))}
                      {statusPedido.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => {
                            setStatusPedido([]);
                            if (date?.from && date?.to) {
                              const dataInicio = format(date.from, 'yyyy-MM-dd');
                              const dataFim = format(date.to, 'yyyy-MM-dd');
                              onFilterChange(dataInicio, dataFim, undefined, tipoCliente !== "todos" ? tipoCliente : undefined);
                            }
                          }}
                        >
                          Limpar seleção
                        </Button>
                      )}
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
          </div>

          {/* Filtro de Data */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Período:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
            {/* Botões de atalho */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick('mes-atual')}
            >
              Mês Atual
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick('ultimos-30')}
            >
              Últimos 30 dias
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick('ultimos-90')}
            >
              Últimos 90 dias
            </Button>

            {/* Seletor de calendário */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
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
  );
};
