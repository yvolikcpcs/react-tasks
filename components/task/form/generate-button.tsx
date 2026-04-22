'use client';

import { Sparkles } from 'lucide-react';

type GenerateButtonProps = {
  onClick: () => void;
  loading: boolean;
};

export function GenerateButton({ onClick, loading }: GenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-slate-400"
    >
      <Sparkles className="h-4 w-4" />
      {loading ? 'Generating...' : 'Generate'}
    </button>
  );
}