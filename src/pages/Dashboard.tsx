// @ts-nocheck
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import DashboardSidebar from "@/components/DashboardSidebar"
import UserInfo from "@/components/UserInfo"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { Building2, Users, Package, Loader2, Plus, MapPin, Phone, MoreVertical, XCircle, PlayCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from "zod"

const branchSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres').max(200),
  phone: z.string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .max(20, 'El teléfono no puede tener más de 20 caracteres')
    .regex(/^[0-9+\-\s()]+$/, 'El teléfono solo puede contener números y los caracteres: + - ( ) espacio')
    .optional()
    .or(z.literal('')),
  status: z.enum(['active', 'maintenance', 'inactive']),
})

interface Branch {
  id: string
  name: string
  address: string
  phone: string | null
  status: string
  employee_count?: number
  inventory_count?: number
}

const Dashboard = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalEmployees: 0,
    totalInventory: 0,
  })
  const [open, setOpen] = useState(false)
  const [closeBranchDialog, setCloseBranchDialog] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    status: 'active',
  })

  useEffect(() => {
    if (user) {
      checkUserRole()
    }
  }, [user])

  const checkUserRole = async () => {
    try {
      // Obtener rol del usuario desde user_roles
      // @ts-ignore
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)

      if (!userRoles || userRoles.length === 0) {
        fetchDashboardData()
        return
      }

      const role = userRoles[0].role

      // Si es gerente, empleado o pasante, redirigir a su sucursal
      if (role === 'gerente' || role === 'empleado' || role === 'pasante') {
        // @ts-ignore
        const { data: employee } = await supabase
          .from('employees')
          .select('branch_id')
          .eq('user_id', user?.id)
          .single()

        if (employee?.branch_id) {
          navigate(`/branch/${employee.branch_id}`)
          return
        }
      }

      // Si es admin, cargar dashboard normal
      fetchDashboardData()
    } catch (error) {
      console.error('Error checking user role:', error)
      fetchDashboardData()
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Obtener sucursales sin joins para evitar recursión en RLS
      // @ts-ignore - Supabase types need to be regenerated
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })

      if (branchesError) throw branchesError

      // Obtener counts por separado para cada sucursal
      const branchesWithCounts = await Promise.all(
        (branchesData || []).map(async (branch) => {
          // @ts-ignore
          const { count: employeeCount } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('branch_id', branch.id)

          // @ts-ignore
          const { count: inventoryCount } = await supabase
            .from('inventory')
            .select('*', { count: 'exact', head: true })
            .eq('branch_id', branch.id)

          return {
            ...branch,
            employee_count: employeeCount || 0,
            inventory_count: inventoryCount || 0,
          }
        })
      )

      setBranches(branchesWithCounts)

      const totalEmployees = branchesWithCounts.reduce((sum, b) => sum + (b.employee_count || 0), 0)
      const totalInventory = branchesWithCounts.reduce((sum, b) => sum + (b.inventory_count || 0), 0)

      setStats({
        totalBranches: branchesWithCounts.length,
        totalEmployees,
        totalInventory,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información del dashboard',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      branchSchema.parse(formData)
    } catch (error: any) {
      if (error?.errors) {
        toast({
          title: 'Error de validación',
          description: error.errors[0]?.message || 'Error de validación',
          variant: 'destructive',
        })
        return
      }
    }

    setSaving(true)
    try {
      // @ts-ignore - Supabase types need to be regenerated
      const { error } = await supabase
        .from('branches')
        .insert({
          ...formData,
          owner_id: user?.id,
          phone: formData.phone || null,
        })

      if (error) throw error

      toast({
        title: 'Sucursal creada',
        description: 'La nueva sucursal ha sido creada exitosamente',
      })
      
      setOpen(false)
      setFormData({
        name: '',
        address: '',
        phone: '',
        status: 'active',
      })
      fetchDashboardData()
    } catch (error) {
      console.error('Error creating branch:', error)
      toast({
        title: 'Error',
        description: 'No se pudo crear la sucursal',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'maintenance': return 'bg-orange-100 text-orange-700'
      case 'inactive': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa'
      case 'maintenance': return 'Mantenimiento'
      case 'inactive': return 'Inactiva'
      default: return status
    }
  }

  const handleCloseBranch = async (branchId: string) => {
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('branches')
        .update({ status: 'inactive' })
        .eq('id', branchId)

      if (error) throw error

      toast({
        title: 'Sucursal cerrada',
        description: 'La sucursal ha sido marcada como inactiva',
      })

      fetchDashboardData()
    } catch (error) {
      console.error('Error closing branch:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cerrar la sucursal',
        variant: 'destructive',
      })
    } finally {
      setCloseBranchDialog(null)
    }
  }

  const handleReactivateBranch = async (branchId: string) => {
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('branches')
        .update({ status: 'active' })
        .eq('id', branchId)

      if (error) throw error

      toast({
        title: 'Sucursal reactivada',
        description: 'La sucursal ha sido reactivada exitosamente',
      })

      fetchDashboardData()
    } catch (error) {
      console.error('Error reactivating branch:', error)
      toast({
        title: 'Error',
        description: 'No se pudo reactivar la sucursal',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-beeswax to-background">
          <DashboardSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
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
                <span className="text-2xl">🐝</span>
                Panel de Control
              </h1>
            </div>
            <UserInfo />
          </header>

          <main className="p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 hover:shadow-hive transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Sucursales</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stats.totalBranches}</p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-hive transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Empleados Totales</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stats.totalEmployees}</p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-hive transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Productos en Stock</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stats.totalInventory}</p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Branches Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="h-6 w-6" />
                      Mis Sucursales
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="showInactive"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="showInactive" className="text-sm text-muted-foreground cursor-pointer">
                        Mostrar sucursales inactivas
                      </Label>
                    </div>
                  </div>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-primary text-secondary hover:shadow-hive">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Sucursal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Sucursal</DialogTitle>
                        <DialogDescription>
                          Completa la información de la nueva sucursal
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre de la Sucursal *</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Dirección *</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="address"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status">Estado</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Activa</SelectItem>
                              <SelectItem value="maintenance">Mantenimiento</SelectItem>
                              <SelectItem value="inactive">Inactiva</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex justify-end gap-3">
                          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-gradient-primary text-secondary"
                            disabled={saving}
                          >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Sucursal
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {branches.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No tienes sucursales aún</p>
                    <p className="text-sm text-muted-foreground">Crea tu primera sucursal para comenzar</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {branches
                      .filter(branch => showInactive || branch.status !== 'inactive')
                      .map((branch) => (
                      <Card 
                        key={branch.id} 
                        className="p-6 hover:shadow-hive transition-all relative group cursor-pointer"
                        onClick={() => navigate(`/branch/${branch.id}`)}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-foreground">
                              {branch.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(branch.status)}`}>
                                {getStatusText(branch.status)}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {branch.status === 'inactive' ? (
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleReactivateBranch(branch.id)
                                      }}
                                      className="text-green-600"
                                    >
                                      <PlayCircle className="h-4 w-4 mr-2" />
                                      Reactivar Sucursal
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setCloseBranchDialog(branch.id)
                                      }}
                                      className="text-destructive"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Cerrar Sucursal
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {branch.address}
                            </p>
                            {branch.phone && (
                              <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {branch.phone}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                            <div>
                              <p className="text-xs text-muted-foreground">Empleados</p>
                              <p className="text-xl font-semibold text-foreground">{branch.employee_count || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Productos</p>
                              <p className="text-xl font-semibold text-foreground">{branch.inventory_count || 0}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </main>
        </div>

        {/* Dialog de confirmación para cerrar sucursal */}
        <AlertDialog open={!!closeBranchDialog} onOpenChange={() => setCloseBranchDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cerrar sucursal?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción marcará la sucursal como inactiva. No se eliminará de la base de datos
                y podrás reactivarla en cualquier momento. Los empleados e inventario se mantendrán intactos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => closeBranchDialog && handleCloseBranch(closeBranchDialog)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Cerrar Sucursal
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarProvider>
  )
}

export default Dashboard