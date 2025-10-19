// Update this page (the content is just a fallback if you fail to update the page)

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="text-center space-y-6 p-8">
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
        </div>
      </div>
    </div>
  );
};

export default Index;
