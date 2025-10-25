import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import convergeLogo from "@/assets/converge-logo.png";

interface MobileTopBarProps {
  onMenuClick: () => void;
  title: string;
}

export const MobileTopBar = ({ onMenuClick, title }: MobileTopBarProps) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-white hover:bg-white/20"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center gap-2 flex-1 justify-center">
          <img src={convergeLogo} alt="Logo" className="h-8 w-auto object-contain" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold leading-tight">CONVERGE</span>
            <span className="text-[9px] opacity-90 leading-tight">Soluções em Saúde</span>
          </div>
        </div>

        <div className="w-10" /> {/* Spacer para centralizar o logo */}
      </div>
      
      {/* Título da página */}
      <div className="px-4 pb-3 pt-1">
        <h2 className="text-base font-semibold text-white truncate">{title}</h2>
      </div>
    </div>
  );
};
