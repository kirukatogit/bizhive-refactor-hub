import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Iniciando creación de usuarios de prueba...')

    // Crear usuario1
    const { data: usuario1Data, error: usuario1Error } = await supabaseAdmin.auth.admin.createUser({
      email: 'usuario1@test.com',
      password: 'Test123456!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Usuario 1',
        company_name: 'Empresa Usuario 1'
      }
    })

    if (usuario1Error) throw new Error(`Error creando usuario1: ${usuario1Error.message}`)
    console.log('Usuario1 creado:', usuario1Data.user.id)

    // Crear gerente
    const { data: gerenteData, error: gerenteError } = await supabaseAdmin.auth.admin.createUser({
      email: 'gerente@test.com',
      password: 'Test123456!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Gerente',
        company_name: 'Empresa Usuario 1'
      }
    })

    if (gerenteError) throw new Error(`Error creando gerente: ${gerenteError.message}`)
    console.log('Gerente creado:', gerenteData.user.id)

    // Crear empleado1
    const { data: empleado1Data, error: empleado1Error } = await supabaseAdmin.auth.admin.createUser({
      email: 'empleado1@test.com',
      password: 'Test123456!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Empleado 1',
        company_name: 'Empresa Usuario 1'
      }
    })

    if (empleado1Error) throw new Error(`Error creando empleado1: ${empleado1Error.message}`)
    console.log('Empleado1 creado:', empleado1Data.user.id)

    // Crear empleado2 (pasante)
    const { data: empleado2Data, error: empleado2Error } = await supabaseAdmin.auth.admin.createUser({
      email: 'empleado2@test.com',
      password: 'Test123456!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Empleado 2',
        company_name: 'Empresa Usuario 1'
      }
    })

    if (empleado2Error) throw new Error(`Error creando empleado2: ${empleado2Error.message}`)
    console.log('Empleado2 creado:', empleado2Data.user.id)

    // Crear usuario2
    const { data: usuario2Data, error: usuario2Error } = await supabaseAdmin.auth.admin.createUser({
      email: 'usuario2@test.com',
      password: 'Test123456!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Usuario 2',
        company_name: 'Empresa Usuario 2'
      }
    })

    if (usuario2Error) throw new Error(`Error creando usuario2: ${usuario2Error.message}`)
    console.log('Usuario2 creado:', usuario2Data.user.id)

    // Esperar un poco para que se ejecute el trigger handle_new_user
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Actualizar roles en user_roles
    await supabaseAdmin.from('user_roles').delete().in('user_id', [
      usuario1Data.user.id,
      gerenteData.user.id,
      empleado1Data.user.id,
      empleado2Data.user.id,
      usuario2Data.user.id
    ])

    await supabaseAdmin.from('user_roles').insert([
      { user_id: usuario1Data.user.id, role: 'admin' },
      { user_id: gerenteData.user.id, role: 'gerente' },
      { user_id: empleado1Data.user.id, role: 'empleado' },
      { user_id: empleado2Data.user.id, role: 'pasante' },
      { user_id: usuario2Data.user.id, role: 'admin' }
    ])

    console.log('Roles asignados correctamente')

    // Crear sucursal para usuario1
    const { data: sucursalData, error: sucursalError } = await supabaseAdmin
      .from('branches')
      .insert({
        name: 'Sucursal N',
        address: 'Calle Principal 123',
        phone: '+56912345678',
        status: 'active',
        owner_id: usuario1Data.user.id
      })
      .select()
      .single()

    if (sucursalError) throw new Error(`Error creando sucursal: ${sucursalError.message}`)
    console.log('Sucursal creada:', sucursalData.id)

    // Crear empleados en la sucursal
    const { error: empleadosError } = await supabaseAdmin.from('employees').insert([
      {
        name: 'Gerente',
        email: 'gerente@test.com',
        phone: '+56912345679',
        position: 'Gerente de Sucursal',
        status: 'active',
        branch_id: sucursalData.id,
        user_id: gerenteData.user.id,
        salary: 1500000
      },
      {
        name: 'Empleado 1',
        email: 'empleado1@test.com',
        phone: '+56912345680',
        position: 'Empleado',
        status: 'active',
        branch_id: sucursalData.id,
        user_id: empleado1Data.user.id,
        salary: 800000
      },
      {
        name: 'Empleado 2',
        email: 'empleado2@test.com',
        phone: '+56912345681',
        position: 'Pasante',
        status: 'active',
        branch_id: sucursalData.id,
        user_id: empleado2Data.user.id,
        salary: 400000
      }
    ])

    if (empleadosError) throw new Error(`Error creando empleados: ${empleadosError.message}`)
    console.log('Empleados creados correctamente')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuarios de prueba creados exitosamente',
        users: {
          usuario1: { id: usuario1Data.user.id, email: 'usuario1@test.com' },
          gerente: { id: gerenteData.user.id, email: 'gerente@test.com' },
          empleado1: { id: empleado1Data.user.id, email: 'empleado1@test.com' },
          empleado2: { id: empleado2Data.user.id, email: 'empleado2@test.com' },
          usuario2: { id: usuario2Data.user.id, email: 'usuario2@test.com' }
        },
        sucursal: { id: sucursalData.id, name: 'Sucursal N' }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
