import { generateText, Output } from 'ai';
import { revalidatePath } from 'next/cache';
import { mentorModel } from './ai-client';
import { getRequestIdentifier, requireTaskCreatorRole } from './auth';
import { isSlugConflict, slugify } from './helpers';
import {
  checkSolutionRatelimit,
  createTaskRatelimit,
  generateTaskRatelimit,
} from './rate-limit';
import { RESPONSE_SCHEMA, TASK_SCHEMA, type TaskInput } from './schemas';

type CheckSolutionResult = {
  score: number;
  isCorrect: boolean;
  feedback: string;
  hints: string[];
};

export async function checkSolutionImpl(
  userCode: string,
  taskTitle: string,
  referenceSolution: string
): Promise<CheckSolutionResult> {
  const identifier = await getRequestIdentifier();
  const { success, reset } = await checkSolutionRatelimit.limit(identifier);

  if (!success) {
    const now = Date.now();
    const remainingSeconds = Math.ceil((reset - now) / 1000);

    return {
      score: 0,
      isCorrect: false,
      feedback: `Too many requests. Please wait ${remainingSeconds} seconds before trying again.`,
      hints: ['Rate limit is active to manage API costs.'],
    };
  }

  try {
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

    return evaluation;
  } catch (error: unknown) {
    console.error('AI Generation Error:', error);
  }

  return {
    score: 0,
    isCorrect: false,
    feedback: 'The service is temporarily unavailable. Please try again in a minute.',
    hints: ['External AI provider limit reached.'],
  };
}

export async function generateTaskActionImpl(topic: string): Promise<TaskInput> {
  await requireTaskCreatorRole();

  const identifier = await getRequestIdentifier();
  const { success, reset } = await generateTaskRatelimit.limit(identifier);

  if (!success) {
    const now = Date.now();
    const remainingSeconds = Math.ceil((reset - now) / 1000);
    throw new Error(
      `Too many generation requests. Please wait ${remainingSeconds} seconds and try again.`
    );
  }

  const safeTopic = topic.trim() || 'React hooks and state management';
  const { output: generatedTask } = await generateText({
    model: mentorModel,
    output: Output.object({
      schema: TASK_SCHEMA,
      name: 'task',
      description: 'Generated React coding task payload.',
    }),
    system:
      'You are a Senior React Mentor. Generate a coding task. All content (title, description, code comments) must be in English. The description should be professional and clear. The starter code should have specific missing parts or bugs for the user to fix.',
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

export async function createTaskActionImpl(input: TaskInput): Promise<{ slug: string }> {
  const { supabase, user } = await requireTaskCreatorRole();

  const identifier = await getRequestIdentifier();
  const { success, reset } = await createTaskRatelimit.limit(identifier);

  if (!success) {
    const now = Date.now();
    const remainingSeconds = Math.ceil((reset - now) / 1000);
    throw new Error(
      `Too many create requests. Please wait ${remainingSeconds} seconds and try again.`
    );
  }

  const data = TASK_SCHEMA.parse(input);
  const baseSlug = slugify(data.title);

  if (!baseSlug) {
    throw new Error('Unable to generate slug from title');
  }

  const maxAttempts = 20;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidateSlug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;

    const { error } = await supabase.from('tasks').insert({
      slug: candidateSlug,
      title: data.title,
      difficulty: data.difficulty,
      tags: data.tags,
      hint: data.hint,
      created_by: user.id,
      content: {
        description: data.description,
        starterCode: data.starterCode,
        referenceSolution: data.referenceSolution,
      },
    });

    if (!error) {
      revalidatePath('/');
      revalidatePath(`/tasks/${candidateSlug}`);
      return { slug: candidateSlug };
    }

    if (isSlugConflict(error)) {
      continue;
    }

    throw new Error(`Failed to create task in Supabase: ${error.message}`);
  }

  throw new Error(`Could not create unique slug after ${maxAttempts} attempts`);
}
