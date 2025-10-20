// @ts-nocheck
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2, Users, Package } from 'lucide-react'
import EmployeesList from '@/components/EmployeesList'
import InventoryList from '@/components/InventoryList'

interface Branch {
  id: string
  name: string
  address: string
  phone: string | null
  status: string
}

const BranchDetail = () => {
  const { branchId } = useParams<{ branchId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [branch, setBranch] = useState<Branch | null>(null)
  const [userRole, setUserRole] = useState<string>('admin')

  useEffect(() => {
    if (branchId && user) {
      fetchBranch()
      fetchUserRole()
    }
  }, [branchId, user])

  const fetchUserRole = async () => {
    try {
      // @ts-ignore
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)

      if (userRoles && userRoles.length > 0) {
        // Ahora solo debe haber un rol por usuario
        const role = userRoles[0].role
        setUserRole(role)
        console.log('User role:', role)
      } else {
        // Si no tiene rol, asignar empleado por defecto
        setUserRole('empleado')
        console.log('No role found, defaulting to empleado')
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole('empleado')
    }
  }

  const fetchBranch = async () => {
    try {
      // @ts-ignore - Supabase types need to be regenerated
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .single()

      if (error) throw error
      setBranch(data)
    } catch (error) {
      console.error('Error fetching branch:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar la sucursal',
        variant: 'destructive',
      })
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-beeswax to-background">
          <DashboardSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </SidebarProvider>
    )
  }

  if (!branch) return null

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-beeswax to-background">
        <DashboardSidebar />
        
        <div className="flex-1">
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6">
            <SidebarTrigger />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="ml-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </header>

          <main className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{branch.name}</h1>
                    <p className="text-muted-foreground mt-2">{branch.address}</p>
                    {branch.phone && (
                      <p className="text-muted-foreground">Tel: {branch.phone}</p>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    branch.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {branch.status === 'active' ? 'Activa' : 'Mantenimiento'}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="employees" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="employees" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Inventario
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="employees" className="mt-6">
                  <EmployeesList branchId={branchId!} userRole={userRole} />
                </TabsContent>

                <TabsContent value="inventory" className="mt-6">
                  <InventoryList branchId={branchId!} userRole={userRole} />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default BranchDetail
