import { MapPin, Users, Package, TrendingUp, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Branch {
  id: number
  name: string
  address: string
  status: "active" | "maintenance" | "closed"
  inventory: number
  employees: number
  revenue: string
}

interface BranchCardProps {
  branch: Branch
}

const BranchCard = ({ branch }: BranchCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "closed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activa"
      case "maintenance":
        return "Mantenimiento"
      case "closed":
        return "Cerrada"
      default:
        return "Desconocido"
    }
  }

  return (
    <div className="bg-background border border-border rounded-lg p-5 hover:shadow-hive transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {branch.name}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {branch.address}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(branch.status)}>
            {getStatusText(branch.status)}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
              <DropdownMenuItem>Editar Sucursal</DropdownMenuItem>
              <DropdownMenuItem>Gestionar Inventario</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Eliminar Sucursal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg mb-2 mx-auto">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <p className="text-lg font-semibold text-foreground">{branch.inventory}</p>
          <p className="text-xs text-muted-foreground">Productos</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500/10 to-blue-500/20 rounded-lg mb-2 mx-auto">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-lg font-semibold text-foreground">{branch.employees}</p>
          <p className="text-xs text-muted-foreground">Empleados</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500/10 to-green-500/20 rounded-lg mb-2 mx-auto">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-sm font-semibold text-foreground">{branch.revenue}</p>
          <p className="text-xs text-muted-foreground">Ingresos</p>
        </div>
      </div>

      {/* Action Button */}
      <Button 
        className="w-full bg-gradient-primary text-secondary hover:shadow-lg transition-all duration-300"
        onClick={() => console.log(`Gestionar ${branch.name}`)}
      >
        Gestionar Sucursal
      </Button>
    </div>
  )
}

export default BranchCard