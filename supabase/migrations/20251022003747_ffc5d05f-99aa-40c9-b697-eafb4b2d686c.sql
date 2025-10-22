-- Corregir los roles de los empleados basándose en su posición
UPDATE public.user_roles ur
SET role = CASE 
  WHEN e.position ILIKE '%gerente%' THEN 'gerente'::app_role
  WHEN e.position ILIKE '%pasante%' THEN 'pasante'::app_role
  ELSE 'empleado'::app_role
END
FROM public.employees e
WHERE ur.user_id = e.user_id
  AND e.user_id IS NOT NULL;