# Code Mentor AI

**🌐 Live Demo:** [https://mentorai-six.vercel.app/](https://mentorai-six.vercel.app/)

A programming practice platform built with **Next.js 16** and **React 19**. It combines an interactive coding workflow, AI-assisted review, AI task generation, URL-driven filtering, and Supabase-backed authentication/storage.

## 🚀 Product Features

- **AI-Driven Code Review:** Get technical feedback, scores (0-100), and improvement roadmaps powered by **Gemini 2.5 Flash**.
- **Interactive Monaco Editor:** A full-featured code editing experience directly in the browser.
- **Dynamic Task Catalog:** Challenges filtered by language, difficulty (`Easy`, `Medium`, `Hard`), and tags.
- **AI Task Generation:** A specialized interface for creators to generate complete tasks (description, starter code, and reference solution) using AI.
- **Passwordless Authentication:** Secure, frictionless login via Supabase Magic Links.
- **Rate Limiting & Security:** Integrated Upstash Redis for AI request limiting and Turnstile CAPTCHA for form protection.

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security)
- **AI Integration:** Vercel AI SDK + Google Gemini 2.5 Flash
- **Infrastructure:** Upstash Redis (Rate Limiting), Vercel (Deployment)

## ⚙️ Next.js / React Features Used

This project intentionally uses modern **Next.js App Router** and **React 19** patterns across both the public task catalog and the authenticated task-creation flow.

### Next.js 16

- **App Router** with `app/` pages and nested routes.
- **Async Server Components** for page-level data loading.
- **Client Components** for interactive editor, filters, pagination, and forms.
- **Server Actions** for:
  - AI solution checking
  - AI task generation
  - task creation
  - sign in / sign out flows
- **Route Handlers** for Supabase auth callback handling and JSON task APIs:
  - [`app/auth/callback/route.ts`](app/auth/callback/route.ts)
  - [`app/api/tasks/route.ts`](app/api/tasks/route.ts)
  - [`app/api/tasks/[slug]/route.ts`](app/api/tasks/[slug]/route.ts)
- **Dynamic routes** via [`app/tasks/[slug]/page.tsx`](app/tasks/[slug]/page.tsx).
- **`searchParams`-driven routing** for filterable task listing.
- **`Suspense` boundaries** for streaming task list and task detail content.
- **Metadata API** with route-level `generateMetadata()` for task detail titles and keywords.
- **React `cache()`** for request-level deduplication between task page rendering and task metadata generation.
- **`unstable_cache()`** for caching public Supabase task reads across requests.
- **Cache revalidation** with `revalidatePath()` and `revalidateTag()` after task creation.
- **Navigation hooks** such as `useRouter()` and `useSearchParams()` for client-side transitions.
- **`next/dynamic`** to lazy-load the task creation modal so the home page does not ship the heavier form logic until it is opened.
- **`next/font`** for optimized Geist and Geist Mono loading.
- **Proxy / middleware-style request handling** via [`proxy.ts`](proxy.ts) to keep Supabase auth cookies in sync.

### React 19

- **`useActionState`** for server-action-backed create/generate task flows.
- **`useFormStatus`** inside submit buttons for action pending state.
- **`useOptimistic`** in task filters for immediate UI feedback before URL navigation completes.
- **`useTransition`** for non-blocking filter and list updates.
- **`Suspense`** for async UI boundaries.

## 🚦 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory. Use `.env.example` as a template:
- `GOOGLE_GENERATIVE_AI_API_KEY` (from Google AI Studio)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Database Migration
Run the SQL scripts located in `supabase/sql/` sequentially (001 to 006) in your Supabase SQL Editor to set up schemas, roles, and RLS policies.

### 4. Development Mode
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
npm run start
```

## 🔌 API Endpoints

For testing or mobile-client integration, the project currently exposes two read-only task endpoints:

- `GET /api/tasks`
  - supports `limit`, `offset`, `language`, `difficulty`, and `tag` query params
- `GET /api/tasks/[slug]`
  - returns full task details for a single task

## 📜 Available Scripts

- `npm run dev` – Launch development server.
- `npm run build` – Create production build.
- `npm run start` – Start the production server from `.next/`.
- `npm run type-check` – Run TypeScript validation.
- `npm run lint` – Run ESLint checks.
- `npm run test` – Run the Vitest test suite.

## 🔒 Security & Performance
- **RLS:** All database interactions are protected by Supabase Row Level Security.
- **Server Actions:** Secure server-side logic for AI evaluations and task creation.
- **Static-friendly public reads:** Public task catalog/detail queries use a cookie-free Supabase client, while auth-aware UI is handled separately in the browser.
- **Data cache invalidation:** Public task query caches are tagged and invalidated on task creation.
- **Proxy auth sync:** Request-time Supabase session refresh via `proxy.ts`.
- **Analytics:** Integrated Vercel Analytics for basic usage monitoring.

---
© 2026 Code Mentor AI. Built for developers by developers.
