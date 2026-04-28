'use client';

import type { ButtonHTMLAttributes } from 'react';
import { useFormStatus } from 'react-dom';

type SaveButtonProps = {
  loading: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function SaveButton({
  loading,
  disabled,
  className,
  ...buttonProps
}: SaveButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="button"
      disabled={pending || disabled}
      className={className ?? 'cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-slate-400'}
      {...buttonProps}
    >
      {loading ? 'Saving...' : 'Save task'}
    </button>
  );
}
