-- Tasks table for React challenge storage.
-- This script is intended to run in Supabase SQL Editor.

create table if not exists public.tasks (
  id bigserial primary key,
  slug text not null unique,
  title text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  tags text[] not null default '{}',
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for common filtering and lookup patterns.
create index if not exists tasks_difficulty_idx on public.tasks (difficulty);
create index if not exists tasks_tags_gin_idx on public.tasks using gin (tags);

-- Keep updated_at in sync on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;

create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

-- Optional: enable RLS and allow read access for all users.
-- You can keep writes restricted to server-side service role calls.
alter table public.tasks enable row level security;

drop policy if exists "public read tasks" on public.tasks;
create policy "public read tasks"
on public.tasks
for select
to anon, authenticated
using (true);
