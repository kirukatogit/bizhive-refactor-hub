-- Crear enum para roles
create type public.app_role as enum ('admin', 'gerente', 'empleado', 'pasante');

-- Crear tabla user_roles
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    unique (user_id, role)
);

-- Habilitar RLS
alter table public.user_roles enable row level security;

-- Política para que usuarios puedan ver su propio rol
create policy "Los usuarios pueden ver su propio rol"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

-- Crear función security definer para verificar roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Migrar datos existentes de profiles a user_roles
insert into public.user_roles (user_id, role)
select id, 
  case 
    when role = 'admin' then 'admin'::app_role
    when role = 'employee' then 'empleado'::app_role
    else 'admin'::app_role
  end as role
from public.profiles
where role is not null
on conflict (user_id, role) do nothing;

-- Actualizar el trigger de handle_new_user para usar user_roles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'company_name', 'Mi Empresa')
  );
  
  -- Asignar rol admin por defecto en user_roles
  insert into public.user_roles (user_id, role)
  values (new.id, 'admin'::app_role);
  
  return new;
end;
$$;