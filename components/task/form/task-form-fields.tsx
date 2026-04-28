'use client';

import type { RefObject } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { TaskFormValues } from '@/app/actions-lib/schemas';
import FormField from '@/components/ui/form/form-field';
import TextareaField from '@/components/ui/form/textarea-field';
import { GenerateButton } from './generate-button';

type TaskFormFieldsProps = {
  formErrorMessage: string | null;
  isGenerating: boolean;
  languageLabel: string;
  languageRuntimeExt: string;
  errors: FieldErrors<TaskFormValues>;
  onCaptchaExpire: () => void;
  onCaptchaSuccess: (token: string) => void;
  onGenerateClick: () => void;
  onTopicChange: (value: string) => void;
  register: UseFormRegister<TaskFormValues>;
  topic: string;
  topicError: string | null;
  turnstileRef: RefObject<TurnstileInstance | null>;
};

export function TaskFormFields({
  formErrorMessage,
  isGenerating,
  languageLabel,
  languageRuntimeExt,
  errors,
  onCaptchaExpire,
  onCaptchaSuccess,
  onGenerateClick,
  onTopicChange,
  register,
  topic,
  topicError,
  turnstileRef,
}: TaskFormFieldsProps) {
  return (
    <div
      className={`space-y-4 transition-opacity duration-300 ${
        isGenerating ? 'opacity-50 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="grid gap-2">
        <label htmlFor="task-topic" className="text-sm font-semibold text-slate-700">
          Topic for AI Generation
        </label>
        <div className="flex gap-2 items-start">
          <FormField
            id="task-topic"
            name="topic"
            value={topic}
            onChange={(event) => onTopicChange(event.target.value)}
            error={topicError || undefined}
            placeholder={`Example: ${languageLabel} arrays and control flow`}
            className="w-full"
            inputClassName="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
          />
          <GenerateButton
            loading={isGenerating}
            onClick={onGenerateClick}
          />
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
        label={`Starter Code (${languageRuntimeExt.toUpperCase()})`}
        error={errors.starterCode?.message}
        {...register('starterCode')}
        rows={7}
        textareaClassName="rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-blue-500"
      />

      <TextareaField
        id="task-reference-solution"
        label={`Reference Solution (${languageRuntimeExt.toUpperCase()})`}
        error={errors.referenceSolution?.message}
        {...register('referenceSolution')}
        rows={7}
        textareaClassName="rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-blue-500"
      />

      {formErrorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600 animate-in fade-in zoom-in duration-200">
          ⚠️ {formErrorMessage}
        </div>
      )}

      <div className="flex justify-center border-t border-slate-100 py-4">
        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onSuccess={onCaptchaSuccess}
          onExpire={onCaptchaExpire}
        />
      </div>
    </div>
  );
}
