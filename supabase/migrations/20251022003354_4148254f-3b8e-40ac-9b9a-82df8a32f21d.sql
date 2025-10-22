-- Agregar columna owner_id a audit_logs para identificar la empresa
ALTER TABLE public.audit_logs 
ADD COLUMN owner_id uuid REFERENCES auth.users(id);

-- Crear índice para mejorar rendimiento de consultas
CREATE INDEX idx_audit_logs_owner_id ON public.audit_logs(owner_id);

-- Actualizar logs existentes con el owner_id correspondiente
UPDATE public.audit_logs al
SET owner_id = (
  SELECT COALESCE(
    -- Si el log es de una sucursal, obtener el owner_id de la sucursal
    (SELECT b.owner_id FROM public.branches b WHERE b.id::text = al.record_id::text AND al.table_name = 'branches' LIMIT 1),
    -- Si el log es de un empleado, obtener el owner_id de la sucursal del empleado
    (SELECT b.owner_id FROM public.branches b 
     INNER JOIN public.employees e ON e.branch_id = b.id 
     WHERE e.id::text = al.record_id::text AND al.table_name = 'employees' LIMIT 1),
    -- Si el log es de inventario, obtener el owner_id de la sucursal del inventario
    (SELECT b.owner_id FROM public.branches b 
     INNER JOIN public.inventory i ON i.branch_id = b.id 
     WHERE i.id::text = al.record_id::text AND al.table_name = 'inventory' LIMIT 1),
    -- Si no se puede determinar, usar el user_id del log
    al.user_id
  )
)
WHERE owner_id IS NULL;

-- Actualizar función log_branch_changes para incluir owner_id
CREATE OR REPLACE FUNCTION public.log_branch_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_email text;
  v_action text;
  v_owner_id uuid;
BEGIN
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    v_action = 'Sucursal creada: ' || NEW.name;
    v_owner_id = NEW.owner_id;
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, new_data, owner_id)
    VALUES (auth.uid(), v_user_email, v_action, 'branches', NEW.id, to_jsonb(NEW), v_owner_id);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action = 'Sucursal actualizada: ' || NEW.name;
    v_owner_id = NEW.owner_id;
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data, new_data, owner_id)
    VALUES (auth.uid(), v_user_email, v_action, 'branches', NEW.id, to_jsonb(OLD), to_jsonb(NEW), v_owner_id);
  ELSIF TG_OP = 'DELETE' THEN
    v_action = 'Sucursal eliminada: ' || OLD.name;
    v_owner_id = OLD.owner_id;
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data, owner_id)
    VALUES (auth.uid(), v_user_email, v_action, 'branches', OLD.id, to_jsonb(OLD), v_owner_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Actualizar función log_employee_changes para incluir owner_id
CREATE OR REPLACE FUNCTION public.log_employee_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_email text;
  v_action text;
  v_owner_id uuid;
BEGIN
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    v_action = 'Empleado creado';
    SELECT b.owner_id INTO v_owner_id FROM public.branches b WHERE b.id = NEW.branch_id;
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, new_data, owner_id)
    VALUES (auth.uid(), v_user_email, v_action, 'employees', NEW.id, to_jsonb(NEW), v_owner_id);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action = 'Empleado actualizado';
    SELECT b.owner_id INTO v_owner_id FROM public.branches b WHERE b.id = NEW.branch_id;
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data, new_data, owner_id)
    VALUES (auth.uid(), v_user_email, v_action, 'employees', NEW.id, to_jsonb(OLD), to_jsonb(NEW), v_owner_id);
  ELSIF TG_OP = 'DELETE' THEN
    v_action = 'Empleado eliminado';
    SELECT b.owner_id INTO v_owner_id FROM public.branches b WHERE b.id = OLD.branch_id;
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data, owner_id)
    VALUES (auth.uid(), v_user_email, v_action, 'employees', OLD.id, to_jsonb(OLD), v_owner_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Actualizar función log_inventory_changes para incluir owner_id
CREATE OR REPLACE FUNCTION public.log_inventory_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_email text;
  v_action text;
  v_quantity_diff integer;
  v_owner_id uuid;
BEGIN
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    v_action = 'Producto agregado al inventario';
    SELECT b.owner_id INTO v_owner_id FROM public.branches b WHERE b.id = NEW.branch_id;
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, new_data, owner_id)
    VALUES (auth.uid(), v_user_email, v_action, 'inventory', NEW.id, to_jsonb(NEW), v_owner_id);
  ELSIF TG_OP = 'UPDATE' THEN
    SELECT b.owner_id INTO v_owner_id FROM public.branches b WHERE b.id = NEW.branch_id;
    IF OLD.quantity != NEW.quantity THEN
      v_quantity_diff = NEW.quantity - OLD.quantity;
      IF v_quantity_diff > 0 THEN
        v_action = 'Inventario incrementado: +' || v_quantity_diff || ' unidades de ' || NEW.product_name;
      ELSE
        v_action = 'Inventario descontado: ' || v_quantity_diff || ' unidades de ' || NEW.product_name;
      END IF;
    ELSE
      v_action = 'Producto actualizado en inventario';
    END IF;
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data, new_data, owner_id)
    VALUES (auth.uid(), v_user_email, v_action, 'inventory', NEW.id, to_jsonb(OLD), to_jsonb(NEW), v_owner_id);
  ELSIF TG_OP = 'DELETE' THEN
    v_action = 'Producto eliminado del inventario';
    SELECT b.owner_id INTO v_owner_id FROM public.branches b WHERE b.id = OLD.branch_id;
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data, owner_id)
    VALUES (auth.uid(), v_user_email, v_action, 'inventory', OLD.id, to_jsonb(OLD), v_owner_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Eliminar política RLS anterior
DROP POLICY IF EXISTS "Usuarios pueden ver audit logs de su empresa" ON public.audit_logs;

-- Crear nueva política RLS que filtre por owner_id
CREATE POLICY "Usuarios pueden ver audit logs de su empresa"
ON public.audit_logs
FOR SELECT
USING (
  owner_id = auth.uid() OR 
  owner_id = get_user_owner_id(auth.uid())
);

-- Actualizar política de INSERT para incluir owner_id
DROP POLICY IF EXISTS "Sistema puede insertar audit logs" ON public.audit_logs;

CREATE POLICY "Sistema puede insertar audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);