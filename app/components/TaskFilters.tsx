'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { BarChart3 } from 'lucide-react';
import { getLevelColor } from '@/lib/styleUtils';
import LevelBadge from './LevelBadge';
import CategoryBadge from './CategoryBadge';

type Task = {
  slug: string;
  title: string;
  category?: string;
  level?: string;
};

type NormalizedTask = Task & {
  category: string;
  level: string;
};

const ALL_FILTER = 'All';
const DEFAULT_CATEGORY = 'General';
const DEFAULT_LEVEL = 'Unspecified';

export default function TaskFilters({ tasks }: { tasks: Task[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('category') || ALL_FILTER);
  const [levelFilter, setlevelFilter] = useState(() => searchParams.get('level') || ALL_FILTER);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryFilter !== ALL_FILTER) {
      params.set('category', categoryFilter);
    }
    if (levelFilter !== ALL_FILTER) {
      params.set('level', levelFilter);
    }
    const query = params.toString();
    const url = query ? `/?${query}` : '/';
    router.replace(url, { scroll: false });
  }, [categoryFilter, levelFilter, router]);

  const normalizedTasks = useMemo<NormalizedTask[]>(
    () =>
      tasks.map((task) => ({
        ...task,
        category: task.category ?? DEFAULT_CATEGORY,
        level: task.level ?? DEFAULT_LEVEL,
      })),
    [tasks]
  );

  const categories = useMemo(() => {
    const unique = Array.from(new Set(normalizedTasks.map((task) => task.category)));
    return [ALL_FILTER, ...unique.sort()];
  }, [normalizedTasks]);

  const levels = useMemo(() => {
    const unique = Array.from(new Set(normalizedTasks.map((task) => task.level)));
    return [ALL_FILTER, ...unique.sort()];
  }, [normalizedTasks]);

  const filteredTasks = useMemo(
    () =>
      normalizedTasks.filter((task) => {
        if (categoryFilter !== ALL_FILTER && task.category !== categoryFilter) {
          return false;
        }
        if (levelFilter !== ALL_FILTER && task.level !== levelFilter) {
          return false;
        }
        return true;
      }),
    [normalizedTasks, categoryFilter, levelFilter]
  );

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Category</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setCategoryFilter(category)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  categoryFilter === category
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Level</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {levels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setlevelFilter(level)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  levelFilter === level
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                {level}
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
              <div className="flex gap-3 mt-1 text-xs text-slate-500 uppercase tracking-wider">
                <LevelBadge level={task.level} link={false} />
                <CategoryBadge category={task.category} link={false} />
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
