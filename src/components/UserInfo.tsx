import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, Bell, LogOut, Crown, Shield } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

const UserInfo = () => {
  const { user, signOut } = useAuth()
  
  // Mock user data - esto vendría de la API/contexto de autenticación
  const userData = {
    name: user?.email?.split('@')[0] || "Usuario",
    email: user?.email || "usuario@bizhive.com",
    role: "Gerente General",
    avatar: "/placeholder-avatar.jpg",
    company: "MiEmpresa S.A.",
    plan: "Premium",
    notifications: 3
  }

  const getRoleIcon = (role: string) => {
    if (role.includes("Gerente") || role.includes("Dueño")) {
      return <Crown className="h-4 w-4" />
    }
    return <Shield className="h-4 w-4" />
  }

  const getRoleColor = (role: string) => {
    if (role.includes("Gerente") || role.includes("Dueño")) {
      return "bg-gradient-primary text-secondary"
    }
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="flex items-center gap-4">
      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        {userData.notifications > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            {userData.notifications}
          </span>
        )}
      </Button>

      {/* User Info Card */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback className="bg-gradient-primary text-secondary">
              {userData.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{userData.name}</h3>
              <Badge className={getRoleColor(userData.role)}>
                {getRoleIcon(userData.role)}
                <span className="ml-1">{userData.role}</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{userData.company}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                Plan {userData.plan}
              </Badge>
            </div>
          </div>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notificaciones</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export default UserInfo