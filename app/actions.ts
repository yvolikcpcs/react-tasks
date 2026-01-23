'use server'

import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function checkSolution(userCode: string, taskTitle: string, referenceSolution: string) {
  const { output: evaluation } = await generateText({
    model: google('gemini-1.5-flash'),
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
