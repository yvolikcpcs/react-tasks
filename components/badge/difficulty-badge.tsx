import { BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { getDifficultyColor } from '@/lib/style-utils';
import BadgePill from '@/components/ui/badge-pill';

type DifficultyBadgeProps = {
  difficulty: string;
  link?: boolean;
};

export default function DifficultyBadge({ difficulty, link = true }: DifficultyBadgeProps) {
  const difficultyColor = getDifficultyColor(difficulty);

  return (
    <BadgePill icon={<BarChart3 className={`mr-2 h-4 w-4 ${difficultyColor}`} />}>
      {link ? (
        <Link href={`/?difficulty=${difficulty}`} className="text-blue-600 hover:underline">
          {difficulty}
        </Link>
      ) : (
        <span>{difficulty}</span>
      )}
    </BadgePill>
  );
}
