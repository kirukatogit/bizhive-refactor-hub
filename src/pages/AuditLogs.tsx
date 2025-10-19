// @ts-nocheck
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import UserInfo from "@/components/UserInfo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  table_name: string;
  created_at: string;
  old_data?: any;
  new_data?: any;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los logs de auditoría",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTableBadgeColor = (tableName: string) => {
    switch (tableName) {
      case "employees":
        return "bg-blue-500";
      case "inventory":
        return "bg-green-500";
      case "branches":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTableLabel = (tableName: string) => {
    switch (tableName) {
      case "employees":
        return "Empleados";
      case "inventory":
        return "Inventario";
      case "branches":
        return "Sucursales";
      default:
        return tableName;
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-beeswax to-background">
          <DashboardSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Cargando logs...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-beeswax to-background">
        <DashboardSidebar />
        
        <div className="flex-1">
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Logs de Auditoría
              </h1>
            </div>
            <UserInfo />
          </header>

          <main className="p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Registro de Actividad</CardTitle>
                  <CardDescription>
                    Historial completo de todas las acciones realizadas en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No hay logs de auditoría registrados
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                    </TableCell>
                    <TableCell>{log.user_email || "Sistema"}</TableCell>
                    <TableCell>
                      <Badge className={getTableBadgeColor(log.table_name)}>
                        {getTableLabel(log.table_name)}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AuditLogs;
