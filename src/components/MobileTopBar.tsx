import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import convergeLogo from "@/assets/converge-logo.png";

interface MobileTopBarProps {
  onMenuClick: () => void;
  title: string;
}

export const MobileTopBar = ({ onMenuClick, title }: MobileTopBarProps) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg safe-top">
      <style>{`
        .safe-top {
          padding-top: env(safe-area-inset-top);
        }
      `}</style>
      
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-white hover:bg-white/20 shrink-0"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
          <img src={convergeLogo} alt="Logo" className="h-8 w-auto object-contain shrink-0" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-bold leading-tight whitespace-nowrap">CONVERGE</span>
            <span className="text-[9px] opacity-90 leading-tight whitespace-nowrap">Soluções em Saúde</span>
          </div>
        </div>

        <div className="w-10 shrink-0" /> {/* Spacer para centralizar o logo */}
      </div>
      
      {/* Título da página */}
      <div className="px-4 pb-3 pt-1 border-t border-white/10">
        <h2 className="text-sm font-semibold text-white truncate">{title}</h2>
      </div>
    </div>
  );
};
