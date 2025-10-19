-- Agregar campo user_id a employees para vincular con auth
ALTER TABLE public.employees 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Crear índice para mejorar rendimiento
CREATE INDEX idx_employees_user_id ON public.employees(user_id);

-- Actualizar RLS policies para branches - permitir que empleados vean su sucursal
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias sucursales" ON public.branches;

CREATE POLICY "Owners y empleados pueden ver sucursales"
ON public.branches FOR SELECT
USING (
  auth.uid() = owner_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE employees.branch_id = branches.id 
    AND employees.user_id = auth.uid()
  )
);

-- Actualizar RLS policies para employees - permitir que empleados vean compañeros de su sucursal
DROP POLICY IF EXISTS "Los usuarios pueden ver empleados de sus sucursales" ON public.employees;

CREATE POLICY "Owners y empleados pueden ver empleados"
ON public.employees FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM branches
    WHERE branches.id = employees.branch_id 
    AND (
      branches.owner_id = auth.uid()
      OR 
      EXISTS (
        SELECT 1 FROM employees e2
        WHERE e2.branch_id = branches.id 
        AND e2.user_id = auth.uid()
      )
    )
  )
);

-- Actualizar RLS policies para inventory - permitir que empleados vean inventario de su sucursal
DROP POLICY IF EXISTS "Los usuarios pueden ver inventario de sus sucursales" ON public.inventory;

CREATE POLICY "Owners y empleados pueden ver inventario"
ON public.inventory FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM branches
    WHERE branches.id = inventory.branch_id 
    AND (
      branches.owner_id = auth.uid()
      OR 
      EXISTS (
        SELECT 1 FROM employees
        WHERE employees.branch_id = branches.id 
        AND employees.user_id = auth.uid()
      )
    )
  )
);

-- Actualizar policies de INSERT/UPDATE/DELETE para inventory - permitir a empleados modificar
DROP POLICY IF EXISTS "Los usuarios pueden crear inventario en sus sucursales" ON public.inventory;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar inventario de sus sucursales" ON public.inventory;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar inventario de sus sucursales" ON public.inventory;

CREATE POLICY "Owners y empleados pueden crear inventario"
ON public.inventory FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM branches
    WHERE branches.id = inventory.branch_id 
    AND (
      branches.owner_id = auth.uid()
      OR 
      EXISTS (
        SELECT 1 FROM employees
        WHERE employees.branch_id = branches.id 
        AND employees.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Owners y empleados pueden actualizar inventario"
ON public.inventory FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM branches
    WHERE branches.id = inventory.branch_id 
    AND (
      branches.owner_id = auth.uid()
      OR 
      EXISTS (
        SELECT 1 FROM employees
        WHERE employees.branch_id = branches.id 
        AND employees.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Owners y empleados pueden eliminar inventario"
ON public.inventory FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM branches
    WHERE branches.id = inventory.branch_id 
    AND (
      branches.owner_id = auth.uid()
      OR 
      EXISTS (
        SELECT 1 FROM employees
        WHERE employees.branch_id = branches.id 
        AND employees.user_id = auth.uid()
      )
    )
  )
);

-- Actualizar tabla profiles para incluir role de empleado
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'employee'));

-- Función para obtener el role del usuario
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;