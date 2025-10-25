import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import convergeLogo from "@/assets/converge-logo.png";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Capturar o evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-card p-6 rounded-2xl shadow-glow">
              <img src={convergeLogo} alt="Converge Logo" className="h-20 w-auto" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CONVERGE</h1>
          <p className="text-white/80">Soluções em Saúde</p>
        </div>

        {/* Card de Instalação */}
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Instale o App</CardTitle>
            </div>
            <CardDescription>
              Instale nosso aplicativo no seu dispositivo para acesso rápido e experiência completa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isInstalled ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg border border-success/20">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-success">App Instalado!</p>
                    <p className="text-sm text-muted-foreground">O aplicativo já está instalado no seu dispositivo</p>
                  </div>
                </div>
                <Button onClick={() => navigate("/")} className="w-full" size="lg">
                  Abrir Dashboard
                </Button>
              </div>
            ) : isInstallable ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Benefícios:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Acesso rápido direto da tela inicial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Funciona offline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Experiência de app nativo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Atualizações automáticas</span>
                    </li>
                  </ul>
                </div>
                
                <Button onClick={handleInstallClick} className="w-full" size="lg">
                  <Download className="mr-2 h-5 w-5" />
                  Instalar Agora
                </Button>

                <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                  Continuar no Navegador
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-2 text-sm">
                    <p className="font-medium">Como instalar no seu dispositivo:</p>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-primary">iPhone/iPad:</p>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-1">
                          <li>Toque no botão de compartilhar (⎙)</li>
                          <li>Role e toque em "Adicionar à Tela Inicial"</li>
                          <li>Toque em "Adicionar"</li>
                        </ol>
                      </div>
                      
                      <div>
                        <p className="font-medium text-primary">Android:</p>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-1">
                          <li>Toque no menu (⋮) do navegador</li>
                          <li>Toque em "Adicionar à tela inicial"</li>
                          <li>Toque em "Adicionar"</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                  Continuar no Navegador
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/60">
          Você pode instalar este aplicativo a qualquer momento acessando esta página
        </p>
      </div>
    </div>
  );
};

export default Install;
