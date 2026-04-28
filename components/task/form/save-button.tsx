'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { useFormStatus } from 'react-dom';

type SaveButtonProps = {
  loading: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const SaveButton = forwardRef<HTMLButtonElement, SaveButtonProps>(
  ({ loading, disabled, className, ...buttonProps }, ref) => {
    const { pending } = useFormStatus();

    return (
      <button
        ref={ref}
        type="submit"
        disabled={pending || disabled}
        className={className ?? 'cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-slate-400'}
        {...buttonProps}
      >
        {loading ? 'Saving...' : 'Save task'}
      </button>
    );
  }
);

SaveButton.displayName = 'SaveButton';
