import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface RefreshButtonProps {
  queryKeys?: string[];
  label?: string;
}

export const RefreshButton = ({ queryKeys, label = "Atualizar" }: RefreshButtonProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      if (queryKeys && queryKeys.length > 0) {
        await Promise.all(
          queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
        );
      } else {
        await queryClient.invalidateQueries();
      }
      
      toast({
        title: "Dados atualizados",
        description: "As informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
      <RefreshCw className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
};
