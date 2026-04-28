'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Sparkles } from 'lucide-react';
import { useFormStatus } from 'react-dom';

type GenerateButtonProps = {
  loading: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const GenerateButton = forwardRef<HTMLButtonElement, GenerateButtonProps>(
  ({ onClick, loading, disabled, className, ...buttonProps }, ref) => {
    const { pending } = useFormStatus();

    return (
      <button
        ref={ref}
        type="submit"
        onClick={onClick}
        disabled={loading || pending || disabled}
        className={className ?? 'inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-slate-400'}
        {...buttonProps}
      >
        <Sparkles className="h-4 w-4" />
        {loading ? 'Generating...' : 'Generate'}
      </button>
    );
  }
);

GenerateButton.displayName = 'GenerateButton';
