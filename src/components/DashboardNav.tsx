import { BarChart3, Users, ShoppingCart, TrendingUp, Settings, Menu, Briefcase, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import convergeLogo from "@/assets/converge-logo.png";

const navItems = [
  { icon: BarChart3, label: "Pedido x Venda", href: "/" },
  { icon: TrendingUp, label: "Análise de Clientes", href: "/analise-clientes" },
  { icon: Users, label: "Análise de Vendedores", href: "/analise-vendedores" },
  { icon: ShoppingCart, label: "Análise de Estoque", href: "/analise-estoque" },
  { icon: Briefcase, label: "Carteira de Clientes", href: "/carteira-clientes" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export const DashboardNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-sidebar-border px-6">
            <img src={convergeLogo} alt="Converge Logo" className="h-10 w-auto object-contain" />
            <div className="ml-3 flex flex-col">
              <span className="text-lg font-bold text-sidebar-foreground leading-tight">CONVERGE</span>
              <span className="text-[10px] text-sidebar-foreground/70 leading-tight">Soluções em Saúde</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.href !== "#") {
                      navigate(item.href);
                      setIsOpen(false);
                    }
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-sidebar-border p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.email || 'Usuário'}
                </p>
                <p className="text-xs text-sidebar-foreground/60">Autenticado</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
