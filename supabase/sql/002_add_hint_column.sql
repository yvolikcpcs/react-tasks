-- Add a dedicated hint column so hint content is stored separately
-- from the reference solution and can be shown safely in the UI.

alter table public.tasks
add column if not exists hint text;

-- Backfill hint from legacy JSONB content when available.
update public.tasks
set hint = nullif(trim(content ->> 'hint'), '')
where hint is null
  and content ? 'hint';

-- Optional safety check: hint can be empty/null for old rows, but when
-- present it should not be only whitespace.
alter table public.tasks
drop constraint if exists tasks_hint_not_blank;

alter table public.tasks
add constraint tasks_hint_not_blank
check (hint is null or length(trim(hint)) > 0);
