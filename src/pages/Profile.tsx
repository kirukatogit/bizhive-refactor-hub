// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, User, Building2, Phone, Mail, Lock } from 'lucide-react'
import { z } from 'zod'

const profileSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  company_name: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres').max(100),
  phone: z.string().regex(/^[0-9+\s()-]*$/, 'El teléfono solo puede contener números y el símbolo +').optional(),
})

type ProfileData = z.infer<typeof profileSchema>

const Profile = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    company_name: '',
    phone: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      // @ts-ignore - Supabase types need to be regenerated
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setProfile({
          // @ts-ignore - Supabase types need to be regenerated
          full_name: data.full_name || '',
          // @ts-ignore - Supabase types need to be regenerated
          company_name: data.company_name || '',
          // @ts-ignore - Supabase types need to be regenerated
          phone: data.phone || '',
        })
      } else {
        // Si no existe perfil, crear uno por defecto
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user?.id,
            full_name: user?.email?.split('@')[0] || '',
            company_name: 'Mi Empresa',
          })

        if (!insertError) {
          setProfile({
            full_name: user?.email?.split('@')[0] || '',
            company_name: 'Mi Empresa',
            phone: '',
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar el perfil',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      profileSchema.parse(profile)
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
        .from('profiles')
        .update({
          full_name: profile.full_name,
          company_name: profile.company_name,
          phone: profile.phone,
        })
        .eq('id', user?.id)

      if (error) throw error

      toast({
        title: 'Perfil actualizado',
        description: 'Tu información ha sido guardada exitosamente',
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passwordData.currentPassword) {
      toast({
        title: 'Error',
        description: 'Debes ingresar tu contraseña actual',
        variant: 'destructive',
      })
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 8 caracteres',
        variant: 'destructive',
      })
      return
    }

    setChangingPassword(true)
    try {
      // Primero reautenticamos al usuario con su contraseña actual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword,
      })

      if (signInError) {
        toast({
          title: 'Error',
          description: 'La contraseña actual es incorrecta',
          variant: 'destructive',
        })
        return
      }

      // Si la reautenticación es exitosa, actualizamos la contraseña
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido cambiada exitosamente',
      })
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cambiar la contraseña',
        variant: 'destructive',
      })
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-beeswax to-background">
        <DashboardSidebar />
        
        <div className="flex-1">
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold ml-4">Mi Perfil</h1>
          </header>

          <main className="p-6">
            <div className="max-w-2xl mx-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Información Personal
                    </CardTitle>
                    <CardDescription>
                      Actualiza tu información de perfil y datos de tu empresa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="pl-10"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          El email no se puede cambiar
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nombre Completo *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="full_name"
                            type="text"
                            value={profile.full_name}
                            onChange={(e) =>
                              setProfile({ ...profile, full_name: e.target.value })
                            }
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company_name">Nombre de la Empresa *</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="company_name"
                            type="text"
                            value={profile.company_name}
                            onChange={(e) =>
                              setProfile({ ...profile, company_name: e.target.value })
                            }
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
                            value={profile.phone}
                            onChange={(e) =>
                              setProfile({ ...profile, phone: e.target.value })
                            }
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          className="bg-gradient-primary text-secondary hover:shadow-hive"
                          disabled={saving}
                        >
                          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Guardar Cambios
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate('/dashboard')}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {!loading && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Cambiar Contraseña
                    </CardTitle>
                    <CardDescription>
                      Actualiza tu contraseña de acceso
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña Actual *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, currentPassword: e.target.value })
                            }
                            className="pl-10"
                            required
                            placeholder="Ingresa tu contraseña actual"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva Contraseña *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, newPassword: e.target.value })
                            }
                            className="pl-10"
                            required
                            minLength={8}
                            placeholder="Mínimo 8 caracteres"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                            }
                            className="pl-10"
                            required
                            minLength={8}
                            placeholder="Repite la nueva contraseña"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          className="bg-gradient-primary text-secondary hover:shadow-hive"
                          disabled={changingPassword}
                        >
                          {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Cambiar Contraseña
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Profile
