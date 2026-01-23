'use server'

import { generateText, Output } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set');
}

export async function checkSolution(userCode: string, taskTitle: string, referenceSolution: string) {
  const { output: evaluation } = await generateText({
    model: google('gemini-2.0-flash'),
    output: Output.object({
      schema: z.object({
        score: z.number(),
        isCorrect: z.boolean(),
        feedback: z.string(),
        hints: z.array(z.string()),
      }),
    }),
    system: `You are a Senior React Mentor.`,
    prompt: `Review the user code for: ${taskTitle}.
Compare it to the reference solution and be strict about correctness.

Reference solution:
${referenceSolution}

User code:
${userCode}`,
  });

  return evaluation;
}
