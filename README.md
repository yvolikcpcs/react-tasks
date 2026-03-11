# Code Mentor AI

**🌐 Live Demo:** https://mentorai-six.vercel.app/

A modern programming practice platform built with Next.js 16. Improve your coding skills with instant AI-driven feedback and dynamic task generation.

## Features

- AI Code Review: Instant scores (0-100), technical feedback, and improvement roadmaps powered by Gemini 2.5 Flash.
- Interactive Editor: Full-featured code editing experience using Monaco Editor.
- Dynamic Task Catalog: Filter challenges by language, difficulty (Easy, Medium, Hard), and custom tags.
- AI Task Generator: Creators can generate complete coding tasks from a simple topic.
- Secure Auth: Passwordless login via Supabase Magic Links.

## Tech Stack

- Framework: Next.js 16 (App Router)
- Library: React 19
- Styling: Tailwind CSS 4
- Database & Auth: Supabase (PostgreSQL + RLS)
- AI Engine: Vercel AI SDK + Google Gemini 2.5 Flash
- Rate Limiting: Upstash Redis

## Quick Start

1. Install dependencies:
   npm install

2. Environment Variables:
   Create a .env.local file based on .env.example:
   - GOOGLE_GENERATIVE_AI_API_KEY
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN

3. Database Setup:
   Execute SQL scripts in supabase/sql/ in order (001 to 006).

4. Run Locally:
   npm run dev

## Available Scripts

- npm run dev: Launch development server.
- npm run build: Create production build.
- npm run type-check: Run TypeScript validation.
- npm run lint: Run ESLint checks.

---
© 2026 Code Mentor AI.