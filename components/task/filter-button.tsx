export interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: 'violet' | 'emerald' | 'blue' | 'slate' | 'yellow';
}

// Small helper component for consistent styling
export function FilterButton({ 
  label, 
  active, 
  onClick, 
  variant = 'slate' 
}: FilterButtonProps) {
  const colors: Record<string, string> = {
    violet: active ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600',
    emerald: active ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600',
    blue: active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600',
    slate: active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600',
    yellow: active ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-slate-200 text-slate-600',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition cursor-pointer hover:border-slate-400 ${colors[variant]}`}
    >
      {label}
    </button>
  );
}