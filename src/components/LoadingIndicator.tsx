import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator = ({ message = "Carregando..." }: LoadingIndicatorProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 bg-card p-8 rounded-lg shadow-lg border">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 h-12 w-12 animate-ping opacity-20">
            <Loader2 className="h-12 w-12 text-primary" />
          </div>
        </div>
        <p className="text-lg font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
};
