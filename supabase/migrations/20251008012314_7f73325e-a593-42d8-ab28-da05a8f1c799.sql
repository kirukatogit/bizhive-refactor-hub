-- Actualizar función update_updated_at_column para incluir search_path
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Actualizar función get_user_role para mayor seguridad
create or replace function public.get_user_role(user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = user_id;
$$;

-- Actualizar función get_employee_branch
create or replace function public.get_employee_branch(_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select branch_id
  from public.employees
  where user_id = _user_id
  limit 1
$$;

-- Actualizar función is_branch_owner
create or replace function public.is_branch_owner(_branch_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.branches
    where id = _branch_id
      and owner_id = _user_id
  )
$$;

-- Actualizar función is_branch_employee
create or replace function public.is_branch_employee(_branch_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.employees
    where branch_id = _branch_id
      and user_id = _user_id
  )
$$;