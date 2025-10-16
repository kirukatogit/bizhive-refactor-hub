-- Crear tabla de auditoría para rastrear todas las acciones
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS en audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver todos los logs
CREATE POLICY "Solo admins pueden ver audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Sistema puede insertar logs (sin restricción de usuario)
CREATE POLICY "Sistema puede insertar audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Función para registrar cambios en employees
CREATE OR REPLACE FUNCTION public.log_employee_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email text;
  v_action text;
BEGIN
  -- Obtener email del usuario actual
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  
  -- Determinar la acción
  IF TG_OP = 'INSERT' THEN
    v_action = 'Empleado creado';
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, new_data)
    VALUES (auth.uid(), v_user_email, v_action, 'employees', NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    v_action = 'Empleado actualizado';
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), v_user_email, v_action, 'employees', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    v_action = 'Empleado eliminado';
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data)
    VALUES (auth.uid(), v_user_email, v_action, 'employees', OLD.id, to_jsonb(OLD));
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Trigger para employees
CREATE TRIGGER employee_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.log_employee_changes();

-- Función para registrar cambios en inventory
CREATE OR REPLACE FUNCTION public.log_inventory_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email text;
  v_action text;
  v_quantity_diff integer;
BEGIN
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    v_action = 'Producto agregado al inventario';
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, new_data)
    VALUES (auth.uid(), v_user_email, v_action, 'inventory', NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    -- Detectar si cambió la cantidad
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
    
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), v_user_email, v_action, 'inventory', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    v_action = 'Producto eliminado del inventario';
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data)
    VALUES (auth.uid(), v_user_email, v_action, 'inventory', OLD.id, to_jsonb(OLD));
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Trigger para inventory
CREATE TRIGGER inventory_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.log_inventory_changes();

-- Función para registrar cambios en branches
CREATE OR REPLACE FUNCTION public.log_branch_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email text;
  v_action text;
BEGIN
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    v_action = 'Sucursal creada: ' || NEW.name;
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, new_data)
    VALUES (auth.uid(), v_user_email, v_action, 'branches', NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    v_action = 'Sucursal actualizada: ' || NEW.name;
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), v_user_email, v_action, 'branches', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    v_action = 'Sucursal eliminada: ' || OLD.name;
    INSERT INTO public.audit_logs (user_id, user_email, action, table_name, record_id, old_data)
    VALUES (auth.uid(), v_user_email, v_action, 'branches', OLD.id, to_jsonb(OLD));
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Trigger para branches
CREATE TRIGGER branch_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.branches
FOR EACH ROW EXECUTE FUNCTION public.log_branch_changes();

-- Actualizar política de employees para que SOLO admins puedan crear empleados
DROP POLICY IF EXISTS "Owners pueden crear empleados" ON public.employees;

CREATE POLICY "Solo admins pueden crear empleados"
ON public.employees
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));