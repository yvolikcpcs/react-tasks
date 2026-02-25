-- Role model for the app:
-- - student (default)
-- - creator (can create/edit own tasks)
-- - admin (full access)

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('student', 'creator', 'admin');
  end if;
end
$$;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  created_at timestamptz not null default now()
);

create index if not exists user_roles_role_idx on public.user_roles (role);

alter table public.user_roles enable row level security;

-- Backfill existing users that do not have a role yet.
insert into public.user_roles (user_id, role)
select u.id, 'student'::public.app_role
from auth.users u
left join public.user_roles ur on ur.user_id = u.id
where ur.user_id is null;

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_role on auth.users;

create trigger on_auth_user_created_role
after insert on auth.users
for each row
execute function public.handle_new_user_role();

create or replace function public.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and (ur.role = required_role or ur.role = 'admin')
  );
$$;

-- user_roles policies
drop policy if exists "user roles read own" on public.user_roles;
create policy "user roles read own"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid() or public.has_role('admin'));

drop policy if exists "user roles admin write" on public.user_roles;
create policy "user roles admin write"
on public.user_roles
for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

-- Extend tasks with author ownership.
alter table public.tasks
add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.tasks
alter column created_by set default auth.uid();

create index if not exists tasks_created_by_idx on public.tasks (created_by);

-- Keep existing public read behavior (anon + authenticated).
drop policy if exists "public read tasks" on public.tasks;
drop policy if exists "tasks read all" on public.tasks;
create policy "tasks read all"
on public.tasks
for select
to anon, authenticated
using (true);

-- creator/admin can insert tasks.
drop policy if exists "tasks insert creator admin" on public.tasks;
create policy "tasks insert creator admin"
on public.tasks
for insert
to authenticated
with check (
  public.has_role('creator')
  and (public.has_role('admin') or created_by = auth.uid())
);

-- creator can update/delete own tasks, admin can update/delete any task.
drop policy if exists "tasks update owner admin" on public.tasks;
create policy "tasks update owner admin"
on public.tasks
for update
to authenticated
using (public.has_role('admin') or created_by = auth.uid())
with check (public.has_role('admin') or created_by = auth.uid());

drop policy if exists "tasks delete owner admin" on public.tasks;
create policy "tasks delete owner admin"
on public.tasks
for delete
to authenticated
using (public.has_role('admin') or created_by = auth.uid());

-- Optional helper:
-- Promote a user manually in SQL editor:
-- update public.user_roles set role = 'creator' where user_id = '<auth_user_uuid>';
-- update public.user_roles set role = 'admin' where user_id = '<auth_user_uuid>';
