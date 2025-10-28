import { useState } from "react";
import { useClientes, Cliente } from "@/hooks/useClientes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Search, Send, CheckSquare, Square } from "lucide-react";
import { DashboardNav } from "@/components/DashboardNav";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { RefreshButton } from "@/components/RefreshButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.object({
  subject: z.string().trim().min(1, "Assunto é obrigatório").max(200, "Assunto muito longo"),
  message: z.string().trim().min(1, "Mensagem é obrigatória").max(5000, "Mensagem muito longa"),
});

const DisparoEmails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientes, setSelectedClientes] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const { data: clientes = [], isLoading } = useClientes();

  // Normalizar nome do cliente
  const getClienteName = (cliente: Cliente) => {
    return cliente.NOME_CLIENTE || cliente.nome || cliente.name || cliente.NOME || "Cliente sem nome";
  };

  // Normalizar email do cliente
  const getClienteEmail = (cliente: Cliente) => {
    return cliente.email || "";
  };

  // Normalizar código do cliente para usar como ID
  const getClienteId = (cliente: Cliente) => {
    return String(cliente.CODIGO_CLIENTE || cliente.id || Math.random());
  };

  // Filtrar clientes com email
  const clientesComEmail = clientes.filter(c => getClienteEmail(c));

  // Filtrar clientes baseado na pesquisa
  const clientesFiltrados = clientesComEmail.filter(cliente => {
    const termo = searchTerm.toLowerCase();
    const nome = getClienteName(cliente).toLowerCase();
    const email = getClienteEmail(cliente).toLowerCase();
    return nome.includes(termo) || email.includes(termo);
  });

  // Toggle seleção de cliente
  const toggleCliente = (clienteId: string) => {
    const newSelected = new Set(selectedClientes);
    if (newSelected.has(clienteId)) {
      newSelected.delete(clienteId);
    } else {
      newSelected.add(clienteId);
    }
    setSelectedClientes(newSelected);
  };

  // Selecionar todos
  const toggleSelectAll = () => {
    if (selectedClientes.size === clientesFiltrados.length) {
      setSelectedClientes(new Set());
    } else {
      setSelectedClientes(new Set(clientesFiltrados.map(c => getClienteId(c))));
    }
  };

  // Enviar e-mails
  const enviarEmails = async () => {
    try {
      // Validar formulário
      const validation = emailSchema.safeParse({ subject, message });
      if (!validation.success) {
        toast({
          title: "Erro de validação",
          description: validation.error.issues[0].message,
          variant: "destructive",
        });
        return;
      }

      if (selectedClientes.size === 0) {
        toast({
          title: "Nenhum cliente selecionado",
          description: "Selecione pelo menos um cliente para enviar e-mails",
          variant: "destructive",
        });
        return;
      }

      setIsSending(true);

      // Obter emails dos clientes selecionados
      const clientesSelecionados = clientesFiltrados.filter(c => 
        selectedClientes.has(getClienteId(c))
      );

      const emails = clientesSelecionados.map(c => ({
        email: getClienteEmail(c),
        name: getClienteName(c),
      }));

      // Chamar edge function para enviar e-mails
      const { data, error } = await supabase.functions.invoke('enviar-emails', {
        body: {
          emails,
          subject,
          message,
        },
      });

      if (error) throw error;

      toast({
        title: "E-mails enviados com sucesso!",
        description: `${emails.length} e-mail(s) foram enviados`,
      });

      // Limpar formulário
      setSubject("");
      setMessage("");
      setSelectedClientes(new Set());
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: "Erro ao enviar e-mails",
        description: "Ocorreu um erro ao tentar enviar os e-mails. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardNav pageTitle="Disparo de E-mails" />
        <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 lg:ml-64 pt-[120px] md:pt-0 w-full overflow-x-hidden">
          <PageHeader 
            title="Disparo de E-mails"
            description="Envie e-mails para seus clientes"
            icon={<Mail className="h-6 w-6 text-primary" />}
            action={<RefreshButton queryKeys={["clientes"]} />}
          />
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingIndicator message="Carregando clientes..." />
          </div>
        </div>
      </div>
    );
  }

  const allSelected = selectedClientes.size === clientesFiltrados.length && clientesFiltrados.length > 0;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNav pageTitle="Disparo de E-mails" />
      <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 lg:ml-64 pt-[120px] md:pt-0 w-full overflow-x-hidden">
        <PageHeader 
          title="Disparo de E-mails"
          description="Envie e-mails para seus clientes"
          icon={<Mail className="h-6 w-6 text-primary" />}
          action={<RefreshButton queryKeys={["clientes"]} />}
        />

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes com E-mail</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientesComEmail.length}</div>
              <p className="text-xs text-muted-foreground">clientes disponíveis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Selecionados</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedClientes.size}</div>
              <p className="text-xs text-muted-foreground">para envio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isSending ? (
                  <Badge variant="secondary">Enviando...</Badge>
                ) : (
                  <Badge variant="outline">Pronto</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">estado atual</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Selecionar Clientes
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                >
                  {allSelected ? "Desmarcar Todos" : "Selecionar Todos"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Buscar Cliente</Label>
                  <Input
                    id="search"
                    placeholder="Nome ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
                  {clientesFiltrados.length > 0 ? (
                    clientesFiltrados.map((cliente) => {
                      const clienteId = getClienteId(cliente);
                      const isSelected = selectedClientes.has(clienteId);
                      
                      return (
                        <Card
                          key={clienteId}
                          className={`p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                            isSelected ? 'bg-accent border-primary' : ''
                          }`}
                          onClick={() => toggleCliente(clienteId)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleCliente(clienteId)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {getClienteName(cliente)}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {getClienteEmail(cliente)}
                              </p>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum cliente encontrado</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {clientesFiltrados.length} cliente(s) encontrado(s)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de E-mail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Compor E-mail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); enviarEmails(); }}>
                <div>
                  <Label htmlFor="subject">Assunto *</Label>
                  <Input
                    id="subject"
                    placeholder="Digite o assunto do e-mail"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    maxLength={200}
                    disabled={isSending}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {subject.length}/200 caracteres
                  </p>
                </div>

                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    placeholder="Digite a mensagem do e-mail"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={5000}
                    rows={10}
                    disabled={isSending}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.length}/5000 caracteres
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSending || selectedClientes.size === 0 || !subject || !message}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSending ? "Enviando..." : `Enviar E-mails (${selectedClientes.size})`}
                  </Button>
                  
                  {selectedClientes.size === 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Selecione pelo menos um cliente para enviar
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DisparoEmails;
