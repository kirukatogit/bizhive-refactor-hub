import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Cargando logs de auditoría...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoría</CardTitle>
          <CardDescription>
            Registro completo de todas las acciones realizadas en el sistema
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
  );
};

export default AuditLogs;
