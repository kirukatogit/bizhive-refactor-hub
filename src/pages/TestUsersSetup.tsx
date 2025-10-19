import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

const TestUsersSetup = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const createTestUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-test-users')

      if (error) throw error

      toast({
        title: '¡Usuarios creados!',
        description: 'Los usuarios de prueba han sido creados exitosamente. Revisa la consola para más detalles.'
      })

      console.log('Usuarios creados:', data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron crear los usuarios de prueba',
        variant: 'destructive'
      })
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Crear Usuarios de Prueba</h1>
        
        <div className="space-y-4 mb-8">
          <p className="text-muted-foreground">
            Esta herramienta creará los siguientes usuarios de prueba en tu base de datos:
          </p>
          
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <div className="font-semibold">Usuarios principales:</div>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>usuario1@test.com</strong> - Admin con Sucursal N</li>
              <li><strong>usuario2@test.com</strong> - Admin independiente</li>
            </ul>
            
            <div className="font-semibold mt-4">Empleados de Sucursal N:</div>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>gerente@test.com</strong> - Gerente de Sucursal</li>
              <li><strong>empleado1@test.com</strong> - Empleado</li>
              <li><strong>empleado2@test.com</strong> - Pasante</li>
            </ul>
            
            <div className="mt-4 text-xs text-muted-foreground">
              Contraseña para todos: <code className="bg-background px-2 py-1 rounded">Test123456!</code>
            </div>
          </div>
        </div>

        <Button 
          onClick={createTestUsers} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear Usuarios de Prueba
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Nota: Si los usuarios ya existen, se mostrará un error. Puedes eliminarlos manualmente desde el dashboard de Supabase.
        </p>
      </Card>
    </div>
  )
}

export default TestUsersSetup
