'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import DifficultyBadge from './DifficultyBadge';
import TagBadge from './TagBadge';

type Task = {
  slug: string;
  title: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
};

type NormalizedTask = Task & {
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
};

const ALL_FILTER = 'All';
const DEFAULT_DIFFICULTY: NormalizedTask['difficulty'] = 'medium';

export default function TaskFilters({ tasks }: { tasks: Task[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tagFilter, setTagFilter] = useState(() => searchParams.get('tag') || ALL_FILTER);
  const [difficultyFilter, setDifficultyFilter] = useState(
    () => searchParams.get('difficulty') || ALL_FILTER
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (tagFilter !== ALL_FILTER) {
      params.set('tag', tagFilter);
    }
    if (difficultyFilter !== ALL_FILTER) {
      params.set('difficulty', difficultyFilter);
    }
    const query = params.toString();
    const url = query ? `/?${query}` : '/';
    router.replace(url, { scroll: false });
  }, [tagFilter, difficultyFilter, router]);

  const normalizedTasks = useMemo<NormalizedTask[]>(
    () =>
      tasks.map((task) => ({
        ...task,
        difficulty: task.difficulty ?? DEFAULT_DIFFICULTY,
        tags: task.tags ?? [],
      })),
    [tasks]
  );

  const tags = useMemo(() => {
    const unique = Array.from(new Set(normalizedTasks.flatMap((task) => task.tags)));
    return [ALL_FILTER, ...unique.sort()];
  }, [normalizedTasks]);

  const difficulties = useMemo(() => {
    const unique = Array.from(new Set(normalizedTasks.map((task) => task.difficulty)));
    return [ALL_FILTER, ...unique.sort()];
  }, [normalizedTasks]);

  const filteredTasks = useMemo(
    () =>
      normalizedTasks.filter((task) => {
        if (tagFilter !== ALL_FILTER && !task.tags.includes(tagFilter)) {
          return false;
        }
        if (difficultyFilter !== ALL_FILTER && task.difficulty !== difficultyFilter) {
          return false;
        }
        return true;
      }),
    [normalizedTasks, tagFilter, difficultyFilter]
  );

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Tag</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTagFilter(tag)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  tagFilter === tag
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Difficulty</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                onClick={() => setDifficultyFilter(difficulty)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  difficultyFilter === difficulty
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-3">
        {filteredTasks.map((task) => (
          <Link
            key={task.slug}
            href={`/tasks/${task.slug}`}
            className="p-5 border rounded-lg hover:bg-slate-50 hover:border-blue-400 transition-all flex items-center justify-between group"
          >
            <div>
              <h2 className="font-semibold text-slate-800 group-hover:text-blue-600">
                {task.title}
              </h2>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500 uppercase tracking-wider">
                <DifficultyBadge difficulty={task.difficulty} link={false} />
                {task.tags.map((tag) => (
                  <TagBadge key={`${task.slug}-${tag}`} tag={tag} link={false} />
                ))}
              </div>
            </div>

            <span className="text-slate-300 group-hover:text-blue-500 transition-colors">
              →
            </span>
          </Link>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <p className="text-sm text-slate-500">No tasks match those filters yet.</p>
      )}
    </div>
  );
}
