-- Enforce daily task-create quota in Supabase (DB-level source of truth).
-- Quotas:
-- - can_create_more_tasks = false => 10 tasks/day
-- - can_create_more_tasks = true  => 20 tasks/day

create or replace function public.get_task_create_daily_limit()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.can_create_more_tasks = true
    ) then 20
    else 10
  end;
$$;

create or replace function public.can_create_task_today()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    select count(*)
    from public.tasks t
    where t.created_by = auth.uid()
      and t.created_at >= date_trunc('day', now())
  ) < public.get_task_create_daily_limit();
$$;

create index if not exists tasks_created_by_created_at_idx
on public.tasks (created_by, created_at desc);

drop policy if exists "tasks insert creator admin" on public.tasks;
drop policy if exists "tasks insert creator admin quota" on public.tasks;
create policy "tasks insert creator admin quota"
on public.tasks
for insert
to authenticated
with check (
  public.has_role('creator')
  and (public.has_role('admin') or created_by = auth.uid())
  and public.can_create_task_today()
);
