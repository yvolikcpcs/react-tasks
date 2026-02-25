'use server'

import { generateText, Output } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { headers } from 'next/headers';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { revalidatePath } from 'next/cache';

/**
 * 1. UPSTASH CONNECTION
 * Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN 
 * are defined in your .env.local file.
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * 2. RATELIMIT CONFIGURATION
 * Sliding window: allows 1 request per 60 seconds.
 * This is more flexible than a fixed window as it resets gradually.
 */
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(1, '60 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});
const mentorModel = google('gemini-2.5-flash');

const RESPONSE_SCHEMA = z.object({
  score: z.number().int().min(0).max(100),
  isCorrect: z.boolean(),
  feedback: z.string(),
  hints: z.array(z.string()),
});

const TASK_SCHEMA = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20),
  hint: z.string().min(10),
  starterCode: z.string().min(20),
  referenceSolution: z.string().min(20),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string().min(1)).min(1),
});

type TaskInput = z.infer<typeof TASK_SCHEMA>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function parseErrorBody(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = (await response.json()) as {
      code?: string;
      message?: string;
      details?: string;
      hint?: string;
    };
    return [json.code, json.message, json.details, json.hint].filter(Boolean).join(' | ');
  }
  return response.text();
}

function isSlugConflict(status: number, details: string): boolean {
  const normalized = details.toLowerCase();
  return (
    status === 409 ||
    normalized.includes('23505') ||
    normalized.includes('duplicate key') ||
    normalized.includes('(slug)')
  );
}

export async function checkSolution(
  userCode: string, 
  taskTitle: string, 
  referenceSolution: string
) {
  // Extracting request metadata for better identification
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const ua = headerList.get('user-agent') || 'unknown';

  /**
   * 3. MULTI-FACTOR IDENTIFICATION
   * Combining IP and User-Agent helps distinguish between different users 
   * coming from the same office or provider (shared public IP).
   */
  const identifier = `${ip}-${ua}`;

  // Execute rate limit check in Redis
  const { success, reset } = await ratelimit.limit(identifier);

  if (!success) {
    const now = Date.now();
    const remainingSeconds = Math.ceil((reset - now) / 1000);
    
    return {
      score: 0,
      isCorrect: false,
      feedback: `Too many requests. Please wait ${remainingSeconds} seconds before trying again.`,
      hints: ["Rate limit is active to manage API costs."]
    };
  }

  try {
    /**
     * 4. AI EVALUATION
     * We include the referenceSolution in the system prompt so the AI 
     * understands the specific requirements and "gold standard" for the task.
     */
    const { output: evaluation } = await generateText({
      model: mentorModel,
      output: Output.object({
        schema: RESPONSE_SCHEMA,
        name: 'evaluation',
        description: 'Evaluation result for a React task solution.',
      }),
      system: `You are a Senior React Mentor. 
      You will be provided with a Reference Solution. 
      Use it as the primary criteria for correctness. 
      Be encouraging but technically rigorous. 
      Provide feedback in English.`,
      prompt: `
        Task Title: ${taskTitle}
        
        Reference Solution (Use this as your guide):
        ${referenceSolution}
        
        User's Submitted Code:
        ${userCode}
        
        Analyze if the user's code is functionally equivalent to the reference solution 
        and follows React best practices.
        
        Return score as an integer from 0 to 100 (not 0 to 1).
      `,
    });
    console.log("AI Evaluation Output:", evaluation);
    return evaluation;
  } catch (error: unknown) {
    console.error("AI Generation Error:", error);
  }

  return {
    score: 0,
    isCorrect: false,
    feedback: "The service is temporarily unavailable. Please try again in a minute.",
    hints: ["External AI provider limit reached."]
  };
}

export async function generateTaskAction(topic: string): Promise<TaskInput> {
  const safeTopic = topic.trim() || 'React hooks and state management';
  const { output: generatedTask } = await generateText({
    model: mentorModel,
    output: Output.object({
      schema: TASK_SCHEMA,
      name: 'task',
      description: 'Generated React coding task payload.',
    }),
    system: `You are a Senior React Mentor. Generate a coding task. All content (title, description, code comments) must be in English. The description should be professional and clear. The starter code should have specific missing parts or bugs for the user to fix.`,
    prompt: `Generate one React coding interview task about: ${safeTopic}.
Return only data that fits the schema.

Requirements:
- description must be Markdown format
- hint must be a short practical clue and must not reveal the full solution
- starterCode must be valid TSX with intentional gaps/bugs, not more then 25 lines of code
- referenceSolution must be valid TSX that fixes the task
- tags should be short and interview-relevant`,
  });

  return TASK_SCHEMA.parse(generatedTask);
}

export async function createTaskAction(input: TaskInput): Promise<{ slug: string }> {
  const data = TASK_SCHEMA.parse(input);
  const baseSlug = slugify(data.title);

  if (!baseSlug) {
    throw new Error('Unable to generate slug from title');
  }
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured');
  }

  const maxAttempts = 20;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidateSlug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;

    const response = await fetch(`${supabaseUrl}/rest/v1/tasks`, {
      method: 'POST',
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        slug: candidateSlug,
        title: data.title,
        difficulty: data.difficulty,
        tags: data.tags,
        hint: data.hint,
        content: {
          description: data.description,
          starterCode: data.starterCode,
          referenceSolution: data.referenceSolution,
        },
      }),
      cache: 'no-store',
    });

    if (response.ok) {
      revalidatePath('/');
      revalidatePath(`/tasks/${candidateSlug}`);
      return { slug: candidateSlug };
    }

    const details = await parseErrorBody(response);
    if (isSlugConflict(response.status, details)) {
      continue;
    }

    throw new Error(`Failed to create task in Supabase: ${details}`);
  }

  throw new Error(`Could not create unique slug after ${maxAttempts} attempts`);
}
