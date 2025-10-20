import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { 
  Home, 
  User,
  Building2, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Mi Perfil", url: "/profile", icon: User },
  { title: "Logs de Auditoría", url: "/audit-logs", icon: FileText },
]

const DashboardSidebar = () => {
  const { signOut } = useAuth()
  const { state, toggleSidebar } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const handleSignOut = async () => {
    await signOut()
  }

  const isActive = (path: string) => currentPath === path
  const hasActiveRoute = navigationItems.some((item) => isActive(item.url))

  const getNavClassName = (isCurrentActive: boolean) =>
    isCurrentActive 
      ? "bg-gradient-primary text-secondary font-medium hover:bg-gradient-primary" 
      : "hover:bg-accent hover:text-accent-foreground"

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} bg-background border-r border-border transition-all duration-300`}
      collapsible="icon"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-secondary font-bold text-lg">🐝</span>
            </div>
            <h2 className="font-semibold text-foreground">BizHive</h2>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navegación Principal
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavClassName(isActive(item.url))} flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200`}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Actions */}
        <div className="mt-auto p-4 border-t border-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  {!collapsed && <span>Cerrar Sesión</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

export default DashboardSidebar