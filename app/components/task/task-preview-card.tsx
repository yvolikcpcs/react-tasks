import Link from 'next/link';
import DifficultyBadge from '../badge/difficulty-badge';
import LanguageBadge from '../badge/language-badge';
import TagBadge from '../badge/tag-badge';
import type { Difficulty, Task } from '@/lib/types/task';

export type TaskCardData = Task & {
  languageName: string;
  difficulty: Difficulty;
  tags: string[];
};

export default function TaskCard({ task }: { task: TaskCardData }) {
  return (
    <Link
      href={`/tasks/${task.slug}`}
      className="group flex items-center justify-between rounded-lg border p-5 transition-all hover:border-blue-400 hover:bg-slate-50"
    >
      <div>
        <h2 className="font-semibold text-slate-800 group-hover:text-blue-600">{task.title}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <LanguageBadge language={task.languageName} link={false} />
          <DifficultyBadge difficulty={task.difficulty} link={false} />
          {task.tags.map((tag) => (
            <TagBadge key={`${task.slug}-${tag}`} tag={tag} link={false} />
          ))}
        </div>
      </div>

      <span className="text-slate-300 transition-colors group-hover:text-blue-500">→</span>
    </Link>
  );
}
