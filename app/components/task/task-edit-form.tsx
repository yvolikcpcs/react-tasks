'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Sparkles } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { createTaskAction, generateTaskAction } from '@/app/actions';
import type { LearningConfig } from '@/lib/learning-config';
import { inferLanguageRuntime, inferLanguageTag } from '@/lib/language-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TASK_SCHEMA, type TaskInput } from '@/app/actions-lib/schemas';
import Modal from '@/app/components/ui/modal';
import FormField from '@/app/components/ui/form/form-field';
import TextareaField from '@/app/components/ui/form/textarea-field';


type TaskFormProps = {
  config: Pick<LearningConfig, 'aiMentorRole' | 'aiContentLanguage'>;
  isGuest: boolean;
};

export default function TaskForm({ config, isGuest }: TaskFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [topicError, setTopicError] = useState<string | null>(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<TaskInput>({
    resolver: zodResolver(TASK_SCHEMA),
    defaultValues: {
      difficulty: 'medium',
      languageName: '',
      title: '',
      description: '',
      tags: [],
    },
  });

  const handleOpenModal = () => {
    if (isGuest) {
      router.push('/auth');
      return;
    }
    setOpen(true);
  };

  const turnstileRef = useRef<TurnstileInstance>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setTopicError('Please enter a topic first');
      return;
    }
    
    if (!captchaToken) {
      setError('root', { message: 'Please verify you are human' });
      return;
    }

    const languageName = getValues('languageName');
    if (!languageName) {
      setError('languageName', { message: 'Required for AI generation' });
      return;
    }
  
    setLoadingGenerate(true);
    setTopicError(null);
    try {
      const runtime = inferLanguageRuntime(languageName);
      const data = await generateTaskAction(topic, captchaToken!, {
        aiMentorRole: config.aiMentorRole,
        languageName,
        aiContentLanguage: config.aiContentLanguage,
        defaultTag: inferLanguageTag(languageName),
        codeFileExtension: runtime.ext,
      });
      reset(data);
      setTopic('');
    } catch (err) {
      console.error(err);
      setError('root', { message: 'Failed to generate task. Please try again.' });
    } finally {
      setLoadingGenerate(false);
      setCaptchaToken(null);
      turnstileRef.current?.reset();
    }
  };

  const onSubmit = async (data: TaskInput) => {
    if (!captchaToken) {
      setError('root', { message: 'Please verify you are human' });
      return;
    }
    clearErrors();
    try {
      const { slug } = await createTaskAction(data, captchaToken!);
      setOpen(false);
      router.push(`/tasks/${slug}`);
      router.refresh();
    }  catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError('root', { message: errorMessage });
      
      setCaptchaToken(null);
      turnstileRef.current?.reset();
    }
  };

  const languageLabel = getValues('languageName') || 'task';
  const languageRuntime = inferLanguageRuntime(getValues('languageName'));

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Add task
      </button>

      <Modal
        open={open}
        title={`Create ${languageLabel} task`}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || !captchaToken}
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-slate-400"
            >
              {isSubmitting ? 'Saving...' : 'Save task'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="task-topic" className="text-sm font-semibold text-slate-700">
              Topic for AI Generation
            </label>
            <div className="flex gap-2">
            <FormField
              id="task-topic"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setTopicError(null);
              }}
              error={topicError || undefined}
              placeholder={`Example: ${languageLabel} arrays and control flow`}
              className="w-full"
              inputClassName="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
            />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loadingGenerate}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-slate-400"
              >
                <Sparkles className="h-4 w-4" />
                {loadingGenerate ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          <FormField
            id="task-language-name"
            label="Programming Language / Framework / Product"
            error={errors.languageName?.message}
            {...register('languageName')}
          />

          <FormField
            id="task-title"
            label="Title"
            error={errors.title?.message}
            {...register('title')}
          />

          <TextareaField
            id="task-description"
            label="Description (Markdown)"
            error={errors.description?.message}
            {...register('description')}
            rows={5}
          />

          <TextareaField
            id="task-hint"
            label="Hint"
            error={errors.hint?.message}
            {...register('hint')}
            rows={2}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="task-difficulty" className="text-sm font-semibold text-slate-700">
                Difficulty
              </label>
              <select
                id="task-difficulty"
                {...register('difficulty')}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
            </div>
            <FormField
              id="task-tags"
              label="Tags (comma-separated)"
              error={errors.tags?.message}
              {...register('tags')}
            />
          </div>

          <TextareaField
            id="task-starter-code"
            label={`Starter Code (${languageRuntime.ext.toUpperCase()})`}
            error={errors.starterCode?.message}
            {...register('starterCode')}
            rows={7}
            textareaClassName="rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-blue-500"
          />

          <TextareaField
            id="task-reference-solution"
            label={`Reference Solution (${languageRuntime.ext.toUpperCase()})`}
            error={errors.referenceSolution?.message}
            {...register('referenceSolution')}
            rows={7}
            textareaClassName="rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-blue-500"
          />

          {errors.root && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium animate-in fade-in zoom-in duration-200">
              ⚠️ {errors.root.message}
            </div>
          )}

          <div className="flex justify-center py-4 border-t border-slate-100">
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
