import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Mail, Phone, MapPin } from "lucide-react"

const TeamOverview = () => {
  // Mock team data - esto vendría de la API
  const teamMembers = [
    {
      id: 1,
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@bizhive.com",
      phone: "+506 8888-9999",
      position: "Supervisor de Sucursal",
      branch: "Sucursal Centro",
      avatar: "/placeholder-avatar-1.jpg",
      status: "online",
      joinDate: "2023-01-15"
    },
    {
      id: 2,
      name: "Ana López",
      email: "ana.lopez@bizhive.com", 
      phone: "+506 7777-8888",
      position: "Encargada de Inventario",
      branch: "Sucursal Norte",
      avatar: "/placeholder-avatar-2.jpg",
      status: "online",
      joinDate: "2023-03-20"
    },
    {
      id: 3,
      name: "José Martínez",
      email: "jose.martinez@bizhive.com",
      phone: "+506 6666-7777",
      position: "Vendedor Senior",
      branch: "Sucursal Este",
      avatar: "/placeholder-avatar-3.jpg",
      status: "offline",
      joinDate: "2023-06-10"
    },
    {
      id: 4,
      name: "Laura Fernández",
      email: "laura.fernandez@bizhive.com",
      phone: "+506 5555-6666",
      position: "Asistente Administrativo",
      branch: "Sucursal Centro",
      avatar: "/placeholder-avatar-4.jpg",
      status: "busy",
      joinDate: "2023-08-05"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "En línea"
      case "busy":
        return "Ocupado"
      case "offline":
        return "Desconectado"
      default:
        return "Desconocido"
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5" />
          Mi Equipo ({teamMembers.length} miembros)
        </h2>
        <Button className="bg-gradient-primary text-secondary hover:shadow-hive transition-all duration-300 hover:scale-105">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Empleado
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamMembers.map((member) => (
          <div 
            key={member.id} 
            className="bg-background border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="bg-gradient-primary text-secondary">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-background`}
                  title={getStatusText(member.status)}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {getStatusText(member.status)}
                  </Badge>
                </div>
                
                <p className="text-sm font-medium text-muted-foreground mb-1">{member.position}</p>
                
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  {member.branch}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-[150px]">{member.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {member.phone}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="flex-1">
                Ver Perfil
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                Contactar
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {teamMembers.filter(m => m.status === "online").length}
          </p>
          <p className="text-sm text-muted-foreground">En línea</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {teamMembers.filter(m => m.status === "busy").length}
          </p>
          <p className="text-sm text-muted-foreground">Ocupados</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-600">
            {teamMembers.filter(m => m.status === "offline").length}
          </p>
          <p className="text-sm text-muted-foreground">Desconectados</p>
        </div>
      </div>
    </div>
  )
}

export default TeamOverview