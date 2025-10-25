import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Shield, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
}

const Configuracoes = () => {
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      // Buscar perfis de usuários
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar roles dos usuários
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combinar dados
      const usersWithRoles: UserProfile[] = profiles.map((profile) => ({
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        roles: userRoles
          .filter((ur) => ur.user_id === profile.id)
          .map((ur) => ur.role),
      }));

      return usersWithRoles;
    },
  });

  const totalUsuarios = usuarios?.length || 0;
  const admins = usuarios?.filter((u) => u.roles.includes("admin")).length || 0;
  const usuariosComuns = usuarios?.filter((u) => u.roles.includes("user")).length || 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <DashboardNav />
      
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 w-full overflow-x-hidden">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerenciamento de usuários e configurações do sistema
          </p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{totalUsuarios}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{admins}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Comuns</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{usuariosComuns}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados</CardTitle>
            <CardDescription>
              Lista de todos os usuários com acesso ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px] sm:min-w-0">Email</TableHead>
                        <TableHead className="min-w-[100px] sm:min-w-0">Função</TableHead>
                        <TableHead className="hidden sm:table-cell min-w-[150px]">Data de Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios && usuarios.length > 0 ? (
                        usuarios.map((usuario) => (
                          <TableRow key={usuario.id}>
                            <TableCell className="font-medium break-all sm:break-normal">
                              {usuario.email}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {usuario.roles.map((role) => (
                                  <Badge
                                    key={role}
                                    variant={role === "admin" ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {role === "admin" ? "Admin" : "Usuário"}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                              {format(new Date(usuario.created_at), "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            Nenhum usuário cadastrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informação sobre permissões */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Gerenciamento de Permissões</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Para alterar as permissões de um usuário, é necessário acessar o banco de dados diretamente.
                  Entre em contato com o administrador do sistema para solicitar mudanças de permissão.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Configuracoes;
