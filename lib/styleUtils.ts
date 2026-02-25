type Difficulty = string | undefined | null;

export function getDifficultyColor(difficulty: Difficulty) {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'text-emerald-500';
    case 'medium':
      return 'text-amber-500';
    case 'hard':
      return 'text-rose-500';
    default:
      return 'text-slate-500';
  }
}
