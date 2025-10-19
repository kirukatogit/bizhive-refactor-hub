-- Arreglar recursión infinita en RLS policies
-- El problema es que branches y employees se referencian mutuamente

-- Primero eliminar las policies problemáticas
DROP POLICY IF EXISTS "Owners y empleados pueden ver sucursales" ON public.branches;
DROP POLICY IF EXISTS "Owners y empleados pueden ver empleados" ON public.employees;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar empleados de sus sucursales" ON public.employees;
DROP POLICY IF EXISTS "Los usuarios pueden crear empleados en sus sucursales" ON public.employees;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar empleados de sus sucursales" ON public.employees;

-- Recrear policies sin recursión
-- Para branches: solo usar owner_id directo, sin verificar employees
CREATE POLICY "Owners pueden ver sus sucursales"
ON public.branches FOR SELECT
USING (auth.uid() = owner_id);

-- Para employees: solo verificar owner_id de branch, sin volver a employees
CREATE POLICY "Owners pueden ver empleados de sus sucursales"
ON public.employees FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM branches
    WHERE branches.id = employees.branch_id 
    AND branches.owner_id = auth.uid()
  )
);

CREATE POLICY "Los usuarios pueden actualizar empleados de sus sucursales"
ON public.employees FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM branches
    WHERE branches.id = employees.branch_id 
    AND branches.owner_id = auth.uid()
  )
);

CREATE POLICY "Los usuarios pueden crear empleados en sus sucursales"
ON public.employees FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM branches
    WHERE branches.id = employees.branch_id 
    AND branches.owner_id = auth.uid()
  )
);

CREATE POLICY "Los usuarios pueden eliminar empleados de sus sucursales"
ON public.employees FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM branches
    WHERE branches.id = employees.branch_id 
    AND branches.owner_id = auth.uid()
  )
);

-- Policy separada para que empleados vean su propia sucursal
CREATE POLICY "Empleados pueden ver su sucursal"
ON public.branches FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM employees
    WHERE employees.branch_id = branches.id 
    AND employees.user_id = auth.uid()
  )
);

-- Policy separada para que empleados vean compañeros de su sucursal
CREATE POLICY "Empleados pueden ver compañeros de su sucursal"
ON public.employees FOR SELECT
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM employees e2
    WHERE e2.branch_id = employees.branch_id 
    AND e2.user_id = auth.uid()
  )
);