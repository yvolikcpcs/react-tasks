# React Mentor AI

A React practice platform built with **Next.js 16** featuring:
- a task catalog stored in **Supabase**,
- an interactive code editor,
- AI-based solution review,
- AI task generation from an admin form.

## Features

- Browse tasks with `tag` and `difficulty` filters.
- Open a task page with Markdown description and interactive validation UI.
- Validate solutions with AI (`Gemini`) and get score, feedback, and hints.
- Generate new React tasks with AI and save them to Supabase.
- Automatic unique `slug` generation when creating tasks.
- Rate limiting for AI checks using Upstash Redis.

## Tech Stack

- `next@16`, `react@19`, `typescript`
- `tailwindcss@4`
- `@monaco-editor/react`
- `ai` + `@ai-sdk/google`
- `@supabase/supabase-js` + `@supabase/ssr`
- `@upstash/redis` + `@upstash/ratelimit`

## Project Structure

- `app/page.tsx` - home page with task list.
- `app/tasks/[slug]/page.tsx` - task details page.
- `app/actions.ts` - server actions (AI check, generation, task creation).
- `app/components/*` - UI components (filters, admin form, interactive editor, modal).
- `lib/supabase-tasks.ts` - task fetching from Supabase.
- `lib/supabase-server.ts` - Supabase server client (session cookies).
- `supabase/sql/*.sql` - SQL scripts for database setup.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

```bash
GOOGLE_GENERATIVE_AI_API_KEY=...

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### 3. Prepare the database (Supabase)

Run SQL scripts from `supabase/sql` in your Supabase SQL Editor:

1. `supabase/sql/001_tasks_schema.sql`
2. `supabase/sql/002_add_hint_column.sql`
3. `supabase/sql/003_roles_and_task_permissions.sql`

### 4. Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start development server.
- `npm run build` - build for production.
- `npm run start` - run production build.
- `npm run lint` - run ESLint.

## Task Data Model

`public.tasks` includes:

- `slug` (unique)
- `title`
- `difficulty` (`easy | medium | hard`)
- `tags` (`text[]`)
- `hint` (`text`)
- `content` (`jsonb`) with:
  - `description`
  - `starterCode`
  - `referenceSolution`

## Notes

- Reads/writes use the authenticated user session + Supabase RLS policies.
- `checkSolution` in `app/actions.ts` is rate-limited (currently 1 request per 60 seconds per client identifier).
- `generateTaskAction` and `createTaskAction` also have rate limits.
- `middleware.ts` also has a separate `/api/*` limiter (relevant if you add API routes).

## Possible Improvements

- Add authentication and proper admin-only access for task creation.
- Add e2e tests for the full flow: filters -> task page -> AI validation.
