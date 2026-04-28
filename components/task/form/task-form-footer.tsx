'use client';

import type { RefObject } from 'react';
import { SaveButton } from './save-button';

type TaskFormFooterProps = {
  hasCaptcha: boolean;
  isCreating: boolean;
  isGenerating: boolean;
  onClose: () => void;
  saveSubmitButtonRef: RefObject<HTMLButtonElement | null>;
};

export function TaskFormFooter({
  hasCaptcha,
  isCreating,
  isGenerating,
  onClose,
  saveSubmitButtonRef,
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
        ref={saveSubmitButtonRef}
        data-intent="save"
        disabled={isGenerating || !hasCaptcha}
        loading={isCreating}
      />
    </div>
  );
}
