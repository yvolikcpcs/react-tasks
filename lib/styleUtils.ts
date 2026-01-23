type Level = string | undefined | null;

export function getLevelColor(level: Level) {
  switch (level?.toLowerCase()) {
    case 'easy':
      return 'text-emerald-500';
    case 'middle':
      return 'text-amber-500';
    case 'senior':
      return 'text-rose-500';
    default:
      return 'text-slate-500';
  }
}
