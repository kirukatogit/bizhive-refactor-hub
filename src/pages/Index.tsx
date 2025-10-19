// Update this page (the content is just a fallback if you fail to update the page)

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="text-center space-y-6 p-8">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Sesión iniciada como: <span className="font-semibold">{user?.email}</span>
          </p>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          BizHive - Sistema de Gestión
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Sistema completo con auditoría y control de permisos
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/audit-logs">
            <Button>Ver Logs de Auditoría</Button>
          </Link>
          <Button variant="outline" onClick={signOut}>
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
