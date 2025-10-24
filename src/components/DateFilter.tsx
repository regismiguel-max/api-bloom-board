import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateFilterProps {
  onFilterChange: (dataInicio: string, dataFim: string) => void;
}

export const DateFilter = ({ onFilterChange }: DateFilterProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'mes-atual' | 'ultimos-30' | 'ultimos-90' | 'custom'>('mes-atual');

  const handlePeriodChange = (period: typeof selectedPeriod) => {
    setSelectedPeriod(period);
    
    const now = new Date();
    let dataInicio: Date;
    let dataFim: Date = now;

    switch (period) {
      case 'mes-atual':
        dataInicio = startOfMonth(now);
        dataFim = endOfMonth(now);
        break;
      case 'ultimos-30':
        dataInicio = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'ultimos-90':
        dataInicio = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    // Formatar para DD/MM/YYYY
    const formatDate = (date: Date) => format(date, 'dd/MM/yyyy', { locale: ptBR });
    
    onFilterChange(formatDate(dataInicio), formatDate(dataFim));
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Período:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPeriod === 'mes-atual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange('mes-atual')}
            >
              Mês Atual
            </Button>
            
            <Button
              variant={selectedPeriod === 'ultimos-30' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange('ultimos-30')}
            >
              Últimos 30 dias
            </Button>
            
            <Button
              variant={selectedPeriod === 'ultimos-90' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange('ultimos-90')}
            >
              Últimos 90 dias
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
