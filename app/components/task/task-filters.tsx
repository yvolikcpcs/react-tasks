'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TaskCard from './task-preview-card';
import type { Difficulty, Task } from '@/lib/types/task';

type NormalizedTask = Task & {
  languageName: string;
  difficulty: Difficulty;
  tags: string[];
};

const ALL_FILTER = 'All';
const DEFAULT_DIFFICULTY: NormalizedTask['difficulty'] = 'medium';
const UNSPECIFIED_LANGUAGE = 'General';

type TaskFiltersProps = {
  tasks: Task[];
};

export default function TaskFilters({ tasks }: TaskFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [languageFilter, setLanguageFilter] = useState(() => searchParams.get('language') || ALL_FILTER);
  const [tagFilter, setTagFilter] = useState(() => searchParams.get('tag') || ALL_FILTER);
  const [difficultyFilter, setDifficultyFilter] = useState(
    () => searchParams.get('difficulty') || ALL_FILTER
  );

  const normalizedTasks = useMemo<NormalizedTask[]>(
    () =>
      tasks.map((task) => ({
        ...task,
        languageName:
          task.languageName && task.languageName.trim().length > 0
            ? task.languageName.trim()
            : UNSPECIFIED_LANGUAGE,
        difficulty: task.difficulty ?? DEFAULT_DIFFICULTY,
        tags: task.tags ?? [],
      })),
    [tasks]
  );

  const languages = useMemo(() => {
    const unique = Array.from(new Set(normalizedTasks.map((task) => task.languageName)));
    return [ALL_FILTER, ...unique.sort()];
  }, [normalizedTasks]);

  const languageFilteredTasks = useMemo(
    () =>
      normalizedTasks.filter((task) => {
        if (languageFilter !== ALL_FILTER && task.languageName !== languageFilter) {
          return false;
        }
        return true;
      }),
    [normalizedTasks, languageFilter]
  );

  const tags = useMemo(() => {
    const unique = Array.from(new Set(languageFilteredTasks.flatMap((task) => task.tags)));
    return [ALL_FILTER, ...unique.sort()];
  }, [languageFilteredTasks]);

  const difficulties = useMemo(() => {
    const unique = Array.from(new Set(languageFilteredTasks.map((task) => task.difficulty)));
    return [ALL_FILTER, ...unique.sort()];
  }, [languageFilteredTasks]);

  const effectiveTagFilter =
    tagFilter !== ALL_FILTER && !tags.includes(tagFilter) ? ALL_FILTER : tagFilter;
  const effectiveDifficultyFilter =
    difficultyFilter !== ALL_FILTER && !difficulties.includes(difficultyFilter)
      ? ALL_FILTER
      : difficultyFilter;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (languageFilter !== ALL_FILTER) {
      params.set('language', languageFilter);
    }
    if (effectiveTagFilter !== ALL_FILTER) {
      params.set('tag', effectiveTagFilter);
    }
    if (effectiveDifficultyFilter !== ALL_FILTER) {
      params.set('difficulty', effectiveDifficultyFilter);
    }
    const query = params.toString();
    const url = query ? `/?${query}` : '/';
    router.replace(url, { scroll: false });
  }, [languageFilter, effectiveTagFilter, effectiveDifficultyFilter, router]);

  const filteredTasks = useMemo(
    () =>
      languageFilteredTasks.filter((task) => {
        if (effectiveTagFilter !== ALL_FILTER && !task.tags.includes(effectiveTagFilter)) {
          return false;
        }
        if (
          effectiveDifficultyFilter !== ALL_FILTER &&
          task.difficulty !== effectiveDifficultyFilter
        ) {
          return false;
        }
        return true;
      }),
    [languageFilteredTasks, effectiveTagFilter, effectiveDifficultyFilter]
  );

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Language / Framework / Product</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {languages.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => setLanguageFilter(language)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  languageFilter === language
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600'
                }`}
              >
                {language}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Tag</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTagFilter(tag)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  effectiveTagFilter === tag
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
                  effectiveDifficultyFilter === difficulty
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
          <TaskCard key={task.slug} task={task} />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <p className="text-sm text-slate-500">No tasks match those filters yet.</p>
      )}
    </div>
  );
}
