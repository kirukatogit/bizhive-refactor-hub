-- Primero, agregamos 'gerente' al enum app_role si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'gerente' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'gerente';
  END IF;
END $$;

-- Agregamos 'empleado' y 'pasante' al enum app_role si no existen
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'empleado' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'empleado';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pasante' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'pasante';
  END IF;
END $$;

-- Crear función para obtener el owner_id de las sucursales del usuario
CREATE OR REPLACE FUNCTION public.get_user_owner_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Si el usuario es dueño de sucursales, retorna su propio ID
  SELECT id FROM auth.users WHERE id = _user_id AND EXISTS (
    SELECT 1 FROM public.branches WHERE owner_id = _user_id
  )
  UNION
  -- Si el usuario es empleado, retorna el owner_id de la sucursal donde trabaja
  SELECT b.owner_id FROM public.branches b
  INNER JOIN public.employees e ON e.branch_id = b.id
  WHERE e.user_id = _user_id
  LIMIT 1
$$;

-- Eliminar política anterior de audit_logs
DROP POLICY IF EXISTS "Solo admins pueden ver audit logs" ON public.audit_logs;

-- Crear nueva política para audit_logs que filtre por tenant
CREATE POLICY "Usuarios pueden ver audit logs de su empresa"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.owner_id = get_user_owner_id(auth.uid())
  )
);

-- Eliminar política anterior de employees para INSERT
DROP POLICY IF EXISTS "Solo admins pueden crear empleados" ON public.employees;

-- Crear nueva política para que solo admins y gerentes puedan crear empleados
CREATE POLICY "Admins y gerentes pueden crear empleados"
ON public.employees
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'gerente'::app_role)
);