'use server';

import {
  checkSolutionImpl,
  createTaskActionImpl,
  generateTaskActionImpl,
} from '@/app/actions-lib/task-actions';
import type { TaskInput } from '@/app/actions-lib/schemas';

// Next.js Server Actions in a `use server` file must be directly exported async functions.
// Re-exporting action implementations from another module breaks this constraint.
export async function checkSolution(
  userCode: string,
  taskTitle: string,
  referenceSolution: string
) {
  return checkSolutionImpl(userCode, taskTitle, referenceSolution);
}

export async function generateTaskAction(topic: string): Promise<TaskInput> {
  return generateTaskActionImpl(topic);
}

export async function createTaskAction(input: TaskInput): Promise<{ slug: string }> {
  return createTaskActionImpl(input);
}
