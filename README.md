# Code Mentor AI

**🌐 Live Demo:** [https://mentorai-six.vercel.app/](https://mentorai-six.vercel.app/)

A high-performance programming practice platform built with **Next.js 16** and **React 19**. This project features an interactive coding environment with instant AI feedback, designed to help developers sharpen their skills through targeted challenges.

## 🚀 Key Features

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

## 🚦 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory. Use `.env.example` as a template:
- `GOOGLE_GENERATIVE_AI_API_KEY` (from Google AI Studio)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

### 3. Database Migration
Run the SQL scripts located in `supabase/sql/` sequentially (001 to 006) in your Supabase SQL Editor to set up schemas, roles, and RLS policies.

### 4. Development Mode
```bash
npm run dev
```

## 📜 Available Scripts

- `npm run dev` – Launch development server.
- `npm run build` – Create production build.
- `npm run type-check` – Run TypeScript validation.
- `npm run lint` – Run ESLint checks.

## 🔒 Security & Performance
- **RLS:** All database interactions are protected by Supabase Row Level Security.
- **Server Actions:** Secure server-side logic for AI evaluations and task creation.
- **Analytics:** Integrated Vercel Speed Insights and Analytics for performance monitoring.

---
© 2026 Code Mentor AI. Built for developers by developers.
