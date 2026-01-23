# React Tasks

A Next.js app for practicing React with MDX-based tasks and an interactive code reviewer powered by the AI SDK.

## Features

- Task list sourced from `content/*.mdx`.
- MDX rendering with embedded interactive exercises.
- Server action to evaluate solutions using Google Gemini via the AI SDK.

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env.local` in the project root:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

### 3) Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

## Content and Tasks

- Add new tasks as MDX files in `content/`.
- Each file name becomes the task slug (e.g. `content/stale-closure.mdx` -> `/tasks/stale-closure`).
- You can embed the interactive exercise component in MDX:

```mdx
<InteractiveTask
  taskTitle="Stale Closure"
  initialCode="function Counter() { ... }"
  solution="setCount(c => c + 1)"
/>
```

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - production build
- `npm run start` - run the production server
- `npm run lint` - lint the codebase
