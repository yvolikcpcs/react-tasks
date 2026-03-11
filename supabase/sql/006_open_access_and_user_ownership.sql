drop policy if exists "tasks insert creator admin quota" on public.tasks;
drop policy if exists "tasks insert creator admin" on public.tasks;

create policy "tasks insert any authenticated user"
on public.tasks
for insert
to authenticated
with check (
  created_by = auth.uid() 
  and public.can_create_task_today()
);
