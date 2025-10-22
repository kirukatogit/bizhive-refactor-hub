-- Actualizar política de INSERT en user_roles para permitir que gerentes también creen roles
DROP POLICY IF EXISTS "Admins pueden crear roles para nuevos usuarios" ON public.user_roles;

CREATE POLICY "Admins y gerentes pueden crear roles para nuevos usuarios"
ON public.user_roles
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gerente'::app_role)
);

-- También actualizar las políticas de UPDATE y DELETE para que gerentes puedan gestionar roles
DROP POLICY IF EXISTS "Admins pueden actualizar roles" ON public.user_roles;

CREATE POLICY "Admins y gerentes pueden actualizar roles"
ON public.user_roles
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gerente'::app_role)
);

DROP POLICY IF EXISTS "Admins pueden eliminar roles" ON public.user_roles;

CREATE POLICY "Admins y gerentes pueden eliminar roles"
ON public.user_roles
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gerente'::app_role)
);