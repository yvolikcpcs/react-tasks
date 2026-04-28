'use client';

import type { ButtonHTMLAttributes } from 'react';
import { Sparkles } from 'lucide-react';
import { useFormStatus } from 'react-dom';

type GenerateButtonProps = {
  loading: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function GenerateButton({
  loading,
  disabled,
  className,
  ...buttonProps
}: GenerateButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="button"
      disabled={loading || pending || disabled}
      className={className ?? 'inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-slate-400'}
      {...buttonProps}
    >
      <Sparkles className="h-4 w-4" />
      {loading ? 'Generating...' : 'Generate'}
    </button>
  );
}
