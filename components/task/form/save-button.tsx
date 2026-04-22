'use client';

type SaveButtonProps = {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
};

export function SaveButton({ onClick, loading, disabled }: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-slate-400"
    >
      {loading ? 'Saving...' : 'Save task'}
    </button>
  );
}