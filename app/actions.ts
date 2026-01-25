'use server'

import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { headers } from 'next/headers';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

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
 * Sliding window: allows 2 requests per 60 seconds.
 * This is more flexible than a fixed window as it resets gradually.
 */
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(2, '60 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const RESPONSE_SCHEMA = z.object({
  score: z.number().min(0).max(100),
  isCorrect: z.boolean(),
  feedback: z.string(),
  hints: z.array(z.string()),
});

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

  // Model fallback strategy
  const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash'];

  for (const modelId of models) {
    try {
      /**
       * 4. AI EVALUATION
       * We include the referenceSolution in the system prompt so the AI 
       * understands the specific requirements and "gold standard" for the task.
       */
      const { object } = await generateObject({
        model: google(modelId),
        schema: RESPONSE_SCHEMA,
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
        `,
      });

      return object;
    } catch (error: any) {
      // If we hit provider-side limits (429), try the next model in the array
      if (error.status === 429 && modelId !== models[models.length - 1]) continue;
      console.error("AI Generation Error:", error);
      break;
    }
  }

  return {
    score: 0,
    isCorrect: false,
    feedback: "The service is temporarily unavailable. Please try again in a minute.",
    hints: ["External AI provider limit reached."]
  };
}