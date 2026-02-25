import { z } from 'zod';

export const RESPONSE_SCHEMA = z.object({
  score: z.number().int().min(0).max(100),
  isCorrect: z.boolean(),
  feedback: z.string(),
  hints: z.array(z.string()),
});

export const TASK_SCHEMA = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20),
  hint: z.string().min(10),
  starterCode: z.string().min(20),
  referenceSolution: z.string().min(20),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string().min(1)).min(1),
});

export type TaskInput = z.infer<typeof TASK_SCHEMA>;
