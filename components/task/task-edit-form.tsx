'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { LearningConfig } from '@/lib/learning-config';

// Lazy-load the modal form so the home page does not pay for RHF, Turnstile, and action wiring before the dialog is opened.
const TaskEditFormDialog = dynamic(() => import('./task-edit-form-dialog'));

type TaskFormProps = {
  config: Pick<LearningConfig, 'aiMentorRole' | 'aiContentLanguage'>;
  isGuest: boolean;
};

export default function TaskForm({ config, isGuest }: TaskFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    if (isGuest) {
      router.push('/auth');
      return;
    }
    setOpen(true);
  };

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

      {open && (
        <TaskEditFormDialog
          config={config}
          closeModal={() => setOpen(false)}
          open={open}
        />
      )}
    </>
  );
}
