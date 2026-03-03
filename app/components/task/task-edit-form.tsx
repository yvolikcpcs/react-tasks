'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Sparkles } from 'lucide-react';
import { createTaskAction, generateTaskAction } from '@/app/actions';
import type { Difficulty } from '@/lib/types/task';
import type { LearningConfig } from '@/lib/learning-config';
import { inferLanguageRuntime, inferLanguageTag } from '@/lib/language-utils';
import Modal from '../ui/modal';
import FormField from '../ui/form/form-field';
import TextareaField from '../ui/form/textarea-field';

type TaskFormData = {
  languageName: string;
  title: string;
  description: string;
  hint: string;
  starterCode: string;
  referenceSolution: string;
  difficulty: Difficulty;
  tags: string[];
};

const createEmptyForm = (): TaskFormData => ({
  languageName: '',
  title: '',
  description: '',
  hint: '',
  starterCode: '',
  referenceSolution: '',
  difficulty: 'medium',
  tags: [],
});

type TaskFormProps = {
  config: Pick<LearningConfig, 'aiMentorRole' | 'aiContentLanguage'>;
};

export default function TaskForm({ config }: TaskFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [formData, setFormData] = useState<TaskFormData>(createEmptyForm);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useMemo(
    () => ({
      reset: (data: TaskFormData) => {
        setFormData(data);
      },
    }),
    []
  );

  const updateField = (field: keyof Omit<TaskFormData, 'tags'>, value: string) => {
    if (field === 'difficulty') {
      setFormData((prev) => ({ ...prev, difficulty: value as Difficulty }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateTags = (value: string) => {
    const nextTags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, tags: nextTags }));
  };

  const getMissingRequiredFields = () => {
    const missing: string[] = [];

    if (!formData.title.trim()) missing.push('Title');
    if (!formData.languageName.trim()) missing.push('Programming Language');
    if (!formData.description.trim()) missing.push('Description');
    if (!formData.hint.trim()) missing.push('Hint');
    if (!formData.starterCode.trim()) missing.push('Starter Code');
    if (!formData.referenceSolution.trim()) missing.push('Reference Solution');
    if (formData.tags.length === 0 || formData.tags.every((tag) => !tag.trim())) missing.push('Tags');

    return missing;
  };

  const missingFields = getMissingRequiredFields();
  const hasMissingRequiredFields = missingFields.length > 0;

  const handleGenerate = async () => {
    setLoadingGenerate(true);
    setError(null);
    try {
      const languageName = formData.languageName.trim();
      if (!languageName) {
        setError('Programming Language is required to generate a task.');
        return;
      }
      const runtime = inferLanguageRuntime(languageName);
      const data = await generateTaskAction(topic, {
        aiMentorRole: config.aiMentorRole,
        languageName,
        aiContentLanguage: config.aiContentLanguage,
        defaultTag: inferLanguageTag(languageName),
        codeFileExtension: runtime.ext,
      });
      form.reset(data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate task. Please try again.');
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleSave = async () => {
    if (hasMissingRequiredFields) {
      setError(`Please fill all required fields: ${missingFields.join(', ')}.`);
      return;
    }

    setLoadingSave(true);
    setError(null);
    try {
      const { slug } = await createTaskAction(formData);
      setOpen(false);
      router.push(`/tasks/${slug}`);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task.';
      setError(message);
    } finally {
      setLoadingSave(false);
    }
  };

  const languageRuntime = inferLanguageRuntime(formData.languageName);
  const languageLabel = formData.languageName || 'task';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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
              onClick={handleSave}
              disabled={loadingSave || hasMissingRequiredFields}
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-slate-400"
            >
              {loadingSave ? 'Saving...' : 'Save task'}
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
                onChange={(event) => setTopic(event.target.value)}
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
            value={formData.languageName}
            onChange={(event) => updateField('languageName', event.target.value)}
            required
          />

          <FormField
            id="task-title"
            label="Title"
            value={formData.title}
            onChange={(event) => updateField('title', event.target.value)}
            required
          />

          <TextareaField
            id="task-description"
            label="Description (Markdown)"
            value={formData.description}
            onChange={(event) => updateField('description', event.target.value)}
            rows={5}
            required
          />

          <TextareaField
            id="task-hint"
            label="Hint"
            value={formData.hint}
            onChange={(event) => updateField('hint', event.target.value)}
            rows={2}
            required
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="task-difficulty" className="text-sm font-semibold text-slate-700">
                Difficulty
              </label>
              <select
                id="task-difficulty"
                value={formData.difficulty}
                onChange={(event) => updateField('difficulty', event.target.value)}
                required
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
              value={formData.tags.join(', ')}
              onChange={(event) => updateTags(event.target.value)}
              required
            />
          </div>

          <TextareaField
            id="task-starter-code"
            label={`Starter Code (${languageRuntime.ext.toUpperCase()})`}
            value={formData.starterCode}
            onChange={(event) => updateField('starterCode', event.target.value)}
            rows={7}
            required
            textareaClassName="rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-blue-500"
          />

          <TextareaField
            id="task-reference-solution"
            label={`Reference Solution (${languageRuntime.ext.toUpperCase()})`}
            value={formData.referenceSolution}
            onChange={(event) => updateField('referenceSolution', event.target.value)}
            rows={7}
            required
            textareaClassName="rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-blue-500"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </Modal>
    </>
  );
}
