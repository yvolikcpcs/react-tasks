'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadMoreTasksAction } from '@/app/actions';
import TaskCard, { type TaskCardData } from './task-preview-card';

const PAGE_SIZE = 10;

export default function TaskList({ initialTasks }: { initialTasks: TaskCardData[] }) {  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Local state for accumulated tasks
  const [tasks, setTasks] = useState(initialTasks);
  const [offset, setOffset] = useState(initialTasks.length);
  const [hasMore, setHasMore] = useState(initialTasks.length >= PAGE_SIZE);

  const handleLoadMore = () => {
    const filters = {
      language: searchParams.get('language') || 'All',
      difficulty: searchParams.get('difficulty') || 'All',
      tag: searchParams.get('tag') || 'All',
    };

    startTransition(async () => {
      // Fetch the next chunk of filtered data
      const newTasks = await loadMoreTasksAction(PAGE_SIZE, offset, filters);
      
      if (newTasks.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setTasks((prev) => [...prev, ...newTasks]);
      setOffset((prev) => prev + newTasks.length);
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        {tasks.map((task) => (
          <TaskCard key={task.slug} task={task} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={isPending}
          className="w-full py-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isPending ? 'Loading...' : 'Show more tasks'}
        </button>
      )}
    </div>
  );
}