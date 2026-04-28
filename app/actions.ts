'use server';

import {
  checkSolutionImpl,
  createTaskActionImpl,
  generateTaskActionImpl,
  type TaskGenerationConfig,
} from '@/app/actions-lib/task-actions';
import type { TaskFormValues } from '@/app/actions-lib/schemas';
import type { CreateTaskState, GenerateTaskState } from '@/app/actions-lib/task-action-types';
import type { LearningConfig } from '@/lib/learning-config';
import { inferLanguageRuntime } from '@/lib/language-utils';
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

function getFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === 'string' ? value : null;
}

export async function generateTaskAction(
  _prevState: GenerateTaskState,
  formData: FormData
): Promise<GenerateTaskState> {
  const captchaToken = getFormString(formData, 'captchaToken');
  if (!captchaToken) {
    return { success: false, error: 'Missing captcha token' };
  }

  const topic = getFormString(formData, 'topic')?.trim() ?? '';
  if (!topic) {
    return { success: false, error: 'Please enter a topic first' };
  }

  const languageName = getFormString(formData, 'languageName')?.trim() ?? '';
  if (!languageName) {
    return { success: false, error: 'Programming language is required for AI generation' };
  }

  try {
    const runtime = inferLanguageRuntime(languageName);
    const aiMentorRole = getFormString(formData, 'aiMentorRole');
    const aiContentLanguage = getFormString(formData, 'aiContentLanguage');
    const generateConfig: TaskGenerationConfig = {
      languageName,
      codeFileExtension: runtime.ext,
      ...(aiMentorRole ? { aiMentorRole } : {}),
      ...(aiContentLanguage ? { aiContentLanguage } : {}),
    };

    const task = await generateTaskActionImpl(topic, captchaToken, generateConfig);

    return {
      success: true,
      task,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate task. Please try again.',
    };
  }
}

export async function createTaskAction(_prevState: CreateTaskState, formData: FormData): Promise<CreateTaskState> {
  const captchaToken = getFormString(formData, 'captchaToken');

  if (!captchaToken) {
    return { success: false, error: 'Missing captcha token' };
  }

  const input: TaskFormValues = {
    languageName: getFormString(formData, 'languageName') ?? '',
    title: getFormString(formData, 'title') ?? '',
    description: getFormString(formData, 'description') ?? '',
    hint: getFormString(formData, 'hint') ?? '',
    starterCode: getFormString(formData, 'starterCode') ?? '',
    referenceSolution: getFormString(formData, 'referenceSolution') ?? '',
    difficulty: (getFormString(formData, 'difficulty') ?? '') as TaskFormValues['difficulty'],
    tags: getFormString(formData, 'tags') ?? '',
  };

  return createTaskActionImpl(input, captchaToken);
}

export async function loadMoreTasksAction(
  limit: number,
  offset: number,
  filters: TaskFiltersParams
) {
  return getTasksPaginated(limit, offset, filters);
}
