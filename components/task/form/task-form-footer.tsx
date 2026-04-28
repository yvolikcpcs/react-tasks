'use client';

import { SaveButton } from './save-button';

type TaskFormFooterProps = {
  hasCaptcha: boolean;
  isCreating: boolean;
  isGenerating: boolean;
  onClose: () => void;
  onSaveClick: () => void;
};

export function TaskFormFooter({
  hasCaptcha,
  isCreating,
  isGenerating,
  onClose,
  onSaveClick,
}: TaskFormFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Cancel
      </button>
      <SaveButton
        disabled={isGenerating || !hasCaptcha}
        loading={isCreating}
        onClick={onSaveClick}
      />
    </div>
  );
}
