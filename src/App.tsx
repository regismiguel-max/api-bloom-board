import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AnaliseClientes from "./pages/AnaliseClientes";
import AnaliseVendedores from "./pages/AnaliseVendedores";
import AnaliseEstoque from "./pages/AnaliseEstoque";
import CarteiraClientes from "./pages/CarteiraClientes";
import Configuracoes from "./pages/Configuracoes";
import Auth from "./pages/Auth";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/install" element={<Install />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/analise-clientes" element={<ProtectedRoute><AnaliseClientes /></ProtectedRoute>} />
            <Route path="/analise-vendedores" element={<ProtectedRoute><AnaliseVendedores /></ProtectedRoute>} />
            <Route path="/analise-estoque" element={<ProtectedRoute><AnaliseEstoque /></ProtectedRoute>} />
            <Route path="/carteira-clientes" element={<ProtectedRoute><CarteiraClientes /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
