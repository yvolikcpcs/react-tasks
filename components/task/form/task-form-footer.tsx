'use client';

import { SaveButton } from './save-button';

type TaskFormFooterProps = {
  hasCaptcha: boolean;
  isAuthenticated: boolean | null;
  isCreating: boolean;
  isGenerating: boolean;
  onClose: () => void;
  onSaveClick: () => void;
};

export function TaskFormFooter({
  hasCaptcha,
  isAuthenticated,
  isCreating,
  isGenerating,
  onClose,
  onSaveClick,
}: TaskFormFooterProps) {
  const canSubmit = isAuthenticated === true;

  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Cancel
      </button>
      {canSubmit && (
        <SaveButton
          disabled={isGenerating || !hasCaptcha}
          loading={isCreating}
          onClick={onSaveClick}
        />
      )}
    </div>
  );
}
