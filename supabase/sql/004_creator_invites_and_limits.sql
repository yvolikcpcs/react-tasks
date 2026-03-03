-- Role model:
-- - student (default): read-only
-- - creator: can read + create/edit/delete own tasks
-- - admin: full task access
--
-- Creator assignment is invite-only using creator_invites(email).
-- Per-creator daily create quota option:
-- - can_create_more_tasks = false => 10 tasks/day
-- - can_create_more_tasks = true  => 20 tasks/day

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('student', 'creator', 'admin');
  else
    alter type public.app_role add value if not exists 'student';
    alter type public.app_role add value if not exists 'creator';
    alter type public.app_role add value if not exists 'admin';
  end if;
end
$$;

alter table public.user_roles
alter column role set default 'student';

alter table public.user_roles
add column if not exists can_create_more_tasks boolean not null default false;

create table if not exists public.creator_invites (
  email text primary key,
  created_at timestamptz not null default now()
);

create unique index if not exists creator_invites_email_lower_idx
on public.creator_invites ((lower(email)));

alter table public.creator_invites enable row level security;

drop policy if exists "creator invites deny all" on public.creator_invites;
create policy "creator invites deny all"
on public.creator_invites
for all
to authenticated
using (false)
with check (false);

-- Migrate existing roles into the two-role model.
update public.user_roles
set role = 'student'
where role::text in ('student', 'reader');

update public.user_roles
set role = 'creator'
where role::text in ('creator');

-- Backfill users without role rows.
insert into public.user_roles (user_id, role)
select
  u.id,
  case
    when exists (
      select 1
      from public.creator_invites ci
      where lower(ci.email) = lower(u.email)
    ) then 'creator'::public.app_role
    else 'student'::public.app_role
  end
from auth.users u
left join public.user_roles ur on ur.user_id = u.id
where ur.user_id is null;

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role public.app_role;
begin
  select
    case
      when exists (
        select 1
        from public.creator_invites ci
        where lower(ci.email) = lower(new.email)
      ) then 'creator'::public.app_role
      else 'student'::public.app_role
    end
  into assigned_role;

  insert into public.user_roles (user_id, role)
  values (new.id, assigned_role)
  on conflict (user_id) do update set role = excluded.role;

  return new;
end;
$$;

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

drop policy if exists "user roles read own" on public.user_roles;
create policy "user roles read own"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "user roles admin write" on public.user_roles;

drop policy if exists "tasks insert creator admin" on public.tasks;
drop policy if exists "tasks insert creator only" on public.tasks;
create policy "tasks insert creator admin"
on public.tasks
for insert
to authenticated
with check (
  public.has_role('creator')
  and (public.has_role('admin') or created_by = auth.uid())
);

drop policy if exists "tasks update owner admin" on public.tasks;
drop policy if exists "tasks update creator own" on public.tasks;
create policy "tasks update owner admin"
on public.tasks
for update
to authenticated
using (public.has_role('admin') or created_by = auth.uid())
with check (public.has_role('admin') or created_by = auth.uid());

drop policy if exists "tasks delete owner admin" on public.tasks;
drop policy if exists "tasks delete creator own" on public.tasks;
create policy "tasks delete owner admin"
on public.tasks
for delete
to authenticated
using (public.has_role('admin') or created_by = auth.uid());

-- Example setup:
-- insert into public.creator_invites(email) values ('creator1@example.com');
-- update public.user_roles
-- set can_create_more_tasks = true
-- where user_id = '<creator-user-id>';
