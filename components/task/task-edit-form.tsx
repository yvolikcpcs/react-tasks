'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { LearningConfig } from '@/lib/learning-config';
import { useBrowserAuthState } from '@/components/auth/use-browser-auth-state';

// Lazy-load the modal form so the home page does not pay for RHF, Turnstile, and action wiring before the dialog is opened.
const TaskFormModal = dynamic(() =>
  import('./form/task-form-modal').then((module) => module.TaskFormModal)
);

type TaskFormProps = {
  config: Pick<LearningConfig, 'aiMentorRole' | 'aiContentLanguage'>;
};

export default function TaskForm({ config }: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const isAuthenticated = useBrowserAuthState();

  const handleOpenModal = () => {
    setOpen(true);
  };

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={handleOpenModal}
        className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Add task
      </button>

      {open && (
        <TaskFormModal
          config={config}
          closeModal={() => setOpen(false)}
          isAuthenticated={isAuthenticated}
          open={open}
        />
      )}
    </div>
  );
}
