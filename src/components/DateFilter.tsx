import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface DateFilterProps {
  onFilterChange: (dataInicio: string, dataFim: string, statusPedido?: string, tipoCliente?: string) => void;
  statusList?: string[];
}

export const DateFilter = ({ onFilterChange, statusList = [] }: DateFilterProps) => {
  const now = new Date();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(now),
    to: endOfMonth(now),
  });
  const [statusPedido, setStatusPedido] = useState<string>("todos");
  const [tipoCliente, setTipoCliente] = useState<string>("todos");

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    
    if (newDate?.from && newDate?.to) {
      const dataInicio = format(newDate.from, 'yyyy-MM-dd');
      const dataFim = format(newDate.to, 'yyyy-MM-dd');
      onFilterChange(
        dataInicio, 
        dataFim, 
        statusPedido !== "todos" ? statusPedido : undefined,
        tipoCliente !== "todos" ? tipoCliente : undefined
      );
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusPedido(newStatus);
    
    if (date?.from && date?.to) {
      const dataInicio = format(date.from, 'yyyy-MM-dd');
      const dataFim = format(date.to, 'yyyy-MM-dd');
      onFilterChange(
        dataInicio, 
        dataFim, 
        newStatus !== "todos" ? newStatus : undefined,
        tipoCliente !== "todos" ? tipoCliente : undefined
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
        statusPedido !== "todos" ? statusPedido : undefined,
        newTipo !== "todos" ? newTipo : undefined
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
      statusPedido !== "todos" ? statusPedido : undefined,
      tipoCliente !== "todos" ? tipoCliente : undefined
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Filtros em linha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro de Status */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Status do Pedido:</span>
              <Select value={statusPedido} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {statusList.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Tipo de Cliente */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Tipo de Cliente:</span>
              <Select value={tipoCliente} onValueChange={handleTipoClienteChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pf">Pessoa Física (CPF)</SelectItem>
                  <SelectItem value="pj">Pessoa Jurídica (CNPJ)</SelectItem>
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
