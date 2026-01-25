import { BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { getLevelColor } from '@/lib/styleUtils';

type LevelBadgeProps = {
  level: string;
  link?: boolean;
};

export default function LevelBadge({ level, link = true }: LevelBadgeProps) {
  const levelColor = getLevelColor(level);

  return (
    <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
      <BarChart3 className={`w-4 h-4 mr-2 ${levelColor}`} />
      {link ? (
        <Link href={`/?level=${level}`} className="text-blue-600 hover:underline">
          {level}
        </Link>
      ) : (
        <span>{level}</span>
      )}
    </div>
  );
}
