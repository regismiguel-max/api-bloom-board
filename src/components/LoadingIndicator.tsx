import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator = ({ message = "Carregando..." }: LoadingIndicatorProps) => {
  return (
    <div className="fixed top-20 md:top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3 bg-background/95 backdrop-blur-sm border border-primary/20 rounded-lg px-4 py-3 shadow-lg">
        <div className="relative">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="absolute inset-0 h-5 w-5 animate-ping text-primary/20">
            <Loader2 className="h-5 w-5" />
          </div>
        </div>
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
};
