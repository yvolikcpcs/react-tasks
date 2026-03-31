import { z } from 'zod';

export const RESPONSE_SCHEMA = z.object({
  score: z.number().int().min(0).max(100),
  isCorrect: z.boolean(),
  feedback: z.string(),
  hints: z.array(z.string()),
});

export const TASK_SCHEMA = z.object({
  languageName: z.string().min(2).max(50),
  title: z.string().min(3).max(120),
  description: z.string().min(20),
  hint: z.string().min(10),
  starterCode: z.string().min(20),
  referenceSolution: z.string().min(20),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.union([
    z.string().transform((val) => val.split(',').map(t => t.trim()).filter(Boolean)),
    z.array(z.string())
  ]),
});

export type TaskInput = z.infer<typeof TASK_SCHEMA>;

export type TaskFormValues = z.input<typeof TASK_SCHEMA>;
