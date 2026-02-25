import { BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { getDifficultyColor } from '@/lib/styleUtils';

type DifficultyBadgeProps = {
  difficulty: string;
  link?: boolean;
};

export default function DifficultyBadge({ difficulty, link = true }: DifficultyBadgeProps) {
  const difficultyColor = getDifficultyColor(difficulty);

  return (
    <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
      <BarChart3 className={`w-4 h-4 mr-2 ${difficultyColor}`} />
      {link ? (
        <Link href={`/?difficulty=${difficulty}`} className="text-blue-600 hover:underline">
          {difficulty}
        </Link>
      ) : (
        <span>{difficulty}</span>
      )}
    </div>
  );
}
