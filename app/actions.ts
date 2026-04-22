'use server';

import {
  checkSolutionImpl,
  createTaskActionImpl,
  generateTaskActionImpl,
} from '@/app/actions-lib/task-actions';
import type { TaskInput } from '@/app/actions-lib/schemas';
import type { LearningConfig } from '@/lib/learning-config';
import { getTasksPaginated } from '@/lib/supabase-tasks';
import { TaskFiltersParams } from '@/lib/types/task';

// Next.js Server Actions in a `use server` file must be directly exported async functions.
// Re-exporting action implementations from another module breaks this constraint.
export async function checkSolution(
  userCode: string,
  taskTitle: string,
  referenceSolution: string,
  config?: Pick<LearningConfig, 'aiMentorRole' | 'aiContentLanguage'> & {
    languageName?: string;
  }
) {
  return checkSolutionImpl(userCode, taskTitle, referenceSolution, config);
}

export async function generateTaskAction(
  topic: string,
  captchaToken: string,
  config?: Pick<LearningConfig, 'aiMentorRole' | 'aiContentLanguage'> & {
    languageName?: string;
    defaultTag?: string;
    codeFileExtension?: string;
  }
): Promise<TaskInput> {
  return generateTaskActionImpl(topic, captchaToken, config);
}

export async function createTaskAction(input: TaskInput, captchaToken: string): Promise<{ slug: string }> {
  return createTaskActionImpl(input, captchaToken);
}

export async function loadMoreTasksAction(
  limit: number,
  offset: number,
  filters: TaskFiltersParams
) {
  return getTasksPaginated(limit, offset, filters);
}
