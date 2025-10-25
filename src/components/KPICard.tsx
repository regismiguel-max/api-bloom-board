import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: "up" | "down";
}

export const KPICard = ({ title, value, change, icon: Icon, trend }: KPICardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 bg-gradient-to-br from-card to-card/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend === "up" ? "text-success" : "text-destructive"
                  )}
                >
                  {trend === "up" ? "+" : ""}{change}%
                </span>
                <span className="text-xs text-muted-foreground">vs mês anterior</span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-3 ml-2">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
