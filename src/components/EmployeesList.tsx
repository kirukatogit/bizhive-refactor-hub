// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Mail, Phone, DollarSign, Calendar, User, Briefcase } from 'lucide-react';
import { z } from 'zod';
const employeeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().regex(/^[0-9+\s()-]*$/, 'El teléfono solo puede contener números y el símbolo +').max(20).optional(),
  position: z.string().min(2, 'La posición debe tener al menos 2 caracteres').max(100),
  salary: z.number().positive('El salario debe ser positivo').optional(),
  hire_date: z.string().optional(),
  status: z.enum(['active', 'inactive', 'vacation'])
});
interface Employee {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string;
  salary: number | null;
  hire_date: string | null;
  status: string;
}
interface EmployeesListProps {
  branchId: string;
  userRole?: string;
}
const EmployeesList = ({
  branchId,
  userRole = 'admin'
}: EmployeesListProps) => {
  const canEdit = userRole === 'admin' || userRole === 'gerente';
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    salary: '',
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active',
    createAccount: false,
    password: ''
  });
  useEffect(() => {
    fetchEmployees();
  }, [branchId]);
  const fetchEmployees = async () => {
    try {
      // @ts-ignore - Supabase types need to be regenerated
      const {
        data,
        error
      } = await supabase.from('employees').select('*').eq('branch_id', branchId).order('name');
      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el personal',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.createAccount && !formData.email) {
      toast({
        title: 'Error',
        description: 'Se requiere email para crear cuenta de usuario',
        variant: 'destructive'
      });
      return;
    }
    if (formData.createAccount && !formData.password) {
      toast({
        title: 'Error',
        description: 'Se requiere contraseña para crear cuenta de usuario',
        variant: 'destructive'
      });
      return;
    }
    const payload = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      position: formData.position,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      hire_date: formData.hire_date,
      status: formData.status
    };
    try {
      employeeSchema.parse(payload);
    } catch (error: any) {
      if (error?.errors) {
        toast({
          title: 'Error de validación',
          description: error.errors[0]?.message || 'Error de validación',
          variant: 'destructive'
        });
        return;
      }
    }
    setSaving(true);
    try {
      let userId = null;

      // Si se debe crear cuenta, primero crear usuario en auth
      if (formData.createAccount && formData.email && formData.password) {
        const {
          data: authData,
          error: authError
        } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name
            },
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (authError) {
          throw new Error('Error creando cuenta: ' + authError.message);
        }
        userId = authData.user?.id;

        // Asignar rol según la posición en user_roles
        if (userId) {
          let roleToAssign: 'gerente' | 'empleado' | 'pasante' = 'empleado';
          
          if (formData.position.toLowerCase().includes('gerente')) {
            roleToAssign = 'gerente';
          } else if (formData.position.toLowerCase().includes('pasante')) {
            roleToAssign = 'pasante';
          }

          // Insertar rol (el constraint asegura que solo haya uno por usuario)
          await supabase.from('user_roles').insert({
            user_id: userId,
            role: roleToAssign
          });
        }
      }

      // @ts-ignore - Supabase types need to be regenerated
      const {
        error
      } = await supabase.from('employees').insert({
        ...payload,
        branch_id: branchId,
        user_id: userId
      });
      if (error) throw error;
      toast({
        title: 'Empleado agregado',
        description: formData.createAccount ? 'El empleado ha sido agregado y puede iniciar sesión con su correo' : 'El empleado ha sido agregado exitosamente'
      });
      setOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        salary: '',
        hire_date: new Date().toISOString().split('T')[0],
        status: 'active',
        createAccount: false,
        password: ''
      });
      fetchEmployees();
    } catch (error: any) {
      console.error('Error adding employee:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo agregar el empleado',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'vacation':
        return 'bg-blue-100 text-blue-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'vacation':
        return 'Vacaciones';
      case 'inactive':
        return 'Inactivo';
      default:
        return status;
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Personal ({employees.length})</h2>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-secondary hover:shadow-hive">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Empleado
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
              <DialogDescription>
                Completa la información del nuevo empleado
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="name" value={formData.name} onChange={e => setFormData({
                    ...formData,
                    name: e.target.value
                  })} className="pl-10" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Posición *</Label>
                  <Select value={formData.position} onValueChange={value => setFormData({
                  ...formData,
                  position: value
                })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar posición" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="empleado">Empleado</SelectItem>
                      <SelectItem value="pasante">Pasante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={formData.email} onChange={e => setFormData({
                    ...formData,
                    email: e.target.value
                  })} className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({
                    ...formData,
                    phone: e.target.value
                  })} className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salario ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="salary" type="number" step="0.01" value={formData.salary} onChange={e => setFormData({
                    ...formData,
                    salary: e.target.value
                  })} className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hire_date">Fecha de Contratación</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="hire_date" type="date" value={formData.hire_date} onChange={e => setFormData({
                    ...formData,
                    hire_date: e.target.value
                  })} className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={value => setFormData({
                  ...formData,
                  status: value
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="vacation">Vacaciones</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="createAccount" checked={formData.createAccount} onChange={e => setFormData({
                  ...formData,
                  createAccount: e.target.checked
                })} className="rounded" />
                  <Label htmlFor="createAccount">Crear cuenta de usuario para este empleado</Label>
                </div>

                {formData.createAccount && <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" type="password" value={formData.password} onChange={e => setFormData({
                  ...formData,
                  password: e.target.value
                })} placeholder="Contraseña para iniciar sesión" required={formData.createAccount} />
                    <p className="text-xs text-muted-foreground">
                      El empleado podrá iniciar sesión con su correo y esta contraseña
                    </p>
                  </div>}
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-primary text-secondary" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {employees.length === 0 ? <Card className="p-12 text-center">
          <p className="text-muted-foreground">No hay empleados registrados en esta sucursal</p>
        </Card> : <div className="grid gap-4">
          {employees.map(employee => <Card key={employee.id} className="p-6 hover:shadow-hive transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{employee.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(employee.status)}`}>
                      {getStatusText(employee.status)}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{employee.position}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {employee.email && <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {employee.email}
                      </span>}
                    {employee.phone && <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {employee.phone}
                      </span>}
                    {employee.salary && <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ₡{employee.salary.toLocaleString()}
                      </span>}
                    {employee.hire_date && <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(employee.hire_date).toLocaleDateString()}
                      </span>}
                  </div>
                </div>
              </div>
            </Card>)}
        </div>}
    </div>;
};
export default EmployeesList;