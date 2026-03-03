import { generateText, Output } from 'ai';
import { revalidatePath } from 'next/cache';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { mentorModel } from './ai-client';
import { getRequestIdentifier, requireTaskCreatorRole } from './auth';
import { isSlugConflict, slugify } from './helpers';
import { checkSolutionRatelimit, generateTaskRatelimit } from './rate-limit';
import { RESPONSE_SCHEMA, TASK_SCHEMA, type TaskInput } from './schemas';
import type { LearningConfig } from '@/lib/learning-config';
import { inferLanguageTag } from '@/lib/language-utils';

type CheckSolutionResult = {
  score: number;
  isCorrect: boolean;
  feedback: string;
  feedbackMdx?: MDXRemoteSerializeResult;
  hints: string[];
};

export async function checkSolutionImpl(
  userCode: string,
  taskTitle: string,
  referenceSolution: string,
  config?: Pick<LearningConfig, 'aiMentorRole' | 'aiContentLanguage'> & {
    languageName?: string;
  }
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
    const mentorRole = config?.aiMentorRole ?? 'Senior Programming Mentor';
    const languageName = config?.languageName?.trim() || 'Programming Language';
    const contentLanguage = config?.aiContentLanguage ?? 'English';
    const { output: evaluation } = await generateText({
      model: mentorModel,
      output: Output.object({
        schema: RESPONSE_SCHEMA,
        name: 'evaluation',
        description: `Evaluation result for a ${languageName} task solution.`,
      }),
      system: `You are a ${mentorRole}.
You will be provided with a Reference Solution.
Use it as the primary criteria for correctness.
Be encouraging but technically rigorous.
Focus your review on ${languageName}.
Provide feedback in ${contentLanguage}.`,
      prompt: `Task Title: ${taskTitle}

Reference Solution (Use this as your guide):
${referenceSolution}

User's Submitted Code:
${userCode}

Analyze if the user's code is functionally equivalent to the reference solution
and follows strong ${languageName} practices.

Return score as an integer from 0 to 100 (not 0 to 1).`,
    });

    const feedbackMdx = await serialize(evaluation.feedback);

    return {
      ...evaluation,
      feedbackMdx,
    };
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

export async function generateTaskActionImpl(
  topic: string,
  config?: Pick<LearningConfig, 'aiMentorRole' | 'aiContentLanguage'> & {
    languageName?: string;
    defaultTag?: string;
    codeFileExtension?: string;
  }
): Promise<TaskInput> {
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

  const mentorRole = config?.aiMentorRole ?? 'Senior Programming Mentor';
  const languageName = config?.languageName?.trim() || 'Programming Language';
  const contentLanguage = config?.aiContentLanguage ?? 'English';
  const defaultTag = config?.defaultTag ?? inferLanguageTag(languageName);
  const fileExtension = config?.codeFileExtension ?? 'txt';
  const safeTopic = topic.trim() || `${languageName} fundamentals and control flow`;
  const { output: generatedTask } = await generateText({
    model: mentorModel,
    output: Output.object({
      schema: TASK_SCHEMA,
      name: 'task',
      description: `Generated ${languageName} coding task payload.`,
    }),
    system: `You are a ${mentorRole}. Generate a coding task.
All content (title, description, code comments) must be in ${contentLanguage}.
The description should be professional and clear.
The starter code should have specific missing parts or bugs for the user to fix.`,
    prompt: `Generate one ${languageName} coding interview task about: ${safeTopic}.
Return only data that fits the schema.

Requirements:
- languageName must be exactly "${languageName}"
- description must be Markdown format
- hint must be a short practical clue and must not reveal the full solution
- starterCode must be valid ${languageName} code with intentional gaps/bugs, not more then 25 lines of code
- referenceSolution must be valid ${languageName} code that fixes the task
- prefer snippets with .${fileExtension} style syntax
- tags should be short and interview-relevant, include "${defaultTag}"`,
  });

  return TASK_SCHEMA.parse(generatedTask);
}

export async function createTaskActionImpl(input: TaskInput): Promise<{ slug: string }> {
  const { supabase, user } = await requireTaskCreatorRole();

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
        languageName: data.languageName,
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
