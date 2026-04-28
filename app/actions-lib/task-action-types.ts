import type { TaskInput } from './schemas';

export type CreateTaskState = {
  success: boolean;
  slug?: string;
  error?: string | null;
};

export type GenerateTaskState = {
  success: boolean;
  task?: TaskInput;
  error?: string | null;
};
