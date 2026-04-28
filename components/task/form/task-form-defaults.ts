import type { TaskFormValues } from '@/app/actions-lib/schemas';

export const DEFAULT_TASK_FORM_VALUES: TaskFormValues = {
  difficulty: 'medium',
  languageName: '',
  title: '',
  description: '',
  hint: '',
  starterCode: '',
  referenceSolution: '',
  tags: '',
};
