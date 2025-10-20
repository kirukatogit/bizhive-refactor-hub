-- Corregir la función handle_new_user para que NO asigne automáticamente el rol admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
begin
  insert into public.profiles (id, full_name, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'company_name', 'Mi Empresa')
  );
  
  -- NO asignar rol automáticamente aquí
  -- El rol se asignará manualmente cuando se cree el empleado
  
  return new;
end;
$$;

-- Limpiar roles duplicados - mantener solo el rol más importante por usuario
-- Primero, crear una tabla temporal con el rol más importante de cada usuario
CREATE TEMP TABLE user_primary_roles AS
SELECT DISTINCT ON (user_id) user_id, role
FROM public.user_roles
ORDER BY user_id, 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'gerente' THEN 2
    WHEN 'empleado' THEN 3
    WHEN 'pasante' THEN 4
  END;

-- Eliminar todos los roles
DELETE FROM public.user_roles;

-- Reinsertar solo el rol principal de cada usuario
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role FROM user_primary_roles;

-- Agregar constraint para asegurar que cada usuario solo tenga un rol
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);