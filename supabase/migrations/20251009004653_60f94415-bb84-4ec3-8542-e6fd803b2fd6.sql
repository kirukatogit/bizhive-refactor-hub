-- Permitir que usuarios autenticados con rol admin creen roles para nuevos usuarios
CREATE POLICY "Admins pueden crear roles para nuevos usuarios"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);

-- Permitir que admins actualicen roles
CREATE POLICY "Admins pueden actualizar roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Permitir que admins eliminen roles
CREATE POLICY "Admins pueden eliminar roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));