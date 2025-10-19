-- Crear funciones security definer para evitar recursión infinita en RLS

-- Función para verificar si un usuario es owner de una sucursal
CREATE OR REPLACE FUNCTION public.is_branch_owner(_branch_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.branches
    WHERE id = _branch_id
      AND owner_id = _user_id
  )
$$;

-- Función para verificar si un usuario es empleado de una sucursal
CREATE OR REPLACE FUNCTION public.is_branch_employee(_branch_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees
    WHERE branch_id = _branch_id
      AND user_id = _user_id
  )
$$;

-- Función para obtener branch_id de un empleado
CREATE OR REPLACE FUNCTION public.get_employee_branch(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT branch_id
  FROM public.employees
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Eliminar todas las policies existentes de branches
DROP POLICY IF EXISTS "Empleados pueden ver su sucursal" ON public.branches;
DROP POLICY IF EXISTS "Owners pueden ver sus sucursales" ON public.branches;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propias sucursales" ON public.branches;
DROP POLICY IF EXISTS "Los usuarios pueden crear sus propias sucursales" ON public.branches;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propias sucursales" ON public.branches;

-- Recrear policies usando las funciones security definer
CREATE POLICY "Owners pueden ver sus sucursales"
ON public.branches FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Empleados pueden ver su sucursal"
ON public.branches FOR SELECT
USING (public.is_branch_employee(id, auth.uid()));

CREATE POLICY "Owners pueden actualizar sus sucursales"
ON public.branches FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Owners pueden crear sucursales"
ON public.branches FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners pueden eliminar sus sucursales"
ON public.branches FOR DELETE
USING (owner_id = auth.uid());

-- Eliminar policies existentes de employees
DROP POLICY IF EXISTS "Empleados pueden ver compañeros de su sucursal" ON public.employees;
DROP POLICY IF EXISTS "Owners pueden ver empleados de sus sucursales" ON public.employees;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar empleados de sus sucursales" ON public.employees;
DROP POLICY IF EXISTS "Los usuarios pueden crear empleados en sus sucursales" ON public.employees;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar empleados de sus sucursales" ON public.employees;

-- Recrear policies de employees usando funciones security definer
CREATE POLICY "Owners pueden ver empleados de sus sucursales"
ON public.employees FOR SELECT
USING (public.is_branch_owner(branch_id, auth.uid()));

CREATE POLICY "Empleados pueden ver compañeros de su sucursal"
ON public.employees FOR SELECT
USING (
  user_id = auth.uid()
  OR branch_id = public.get_employee_branch(auth.uid())
);

CREATE POLICY "Owners pueden actualizar empleados"
ON public.employees FOR UPDATE
USING (public.is_branch_owner(branch_id, auth.uid()));

CREATE POLICY "Owners pueden crear empleados"
ON public.employees FOR INSERT
WITH CHECK (public.is_branch_owner(branch_id, auth.uid()));

CREATE POLICY "Owners pueden eliminar empleados"
ON public.employees FOR DELETE
USING (public.is_branch_owner(branch_id, auth.uid()));