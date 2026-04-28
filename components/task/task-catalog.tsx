'use client';

import { useCallback, useState } from 'react';
import type { TaskCardData } from './task-preview-card';
import TaskFilters from './task-filters';
import TaskList from './task-list';

type TaskCatalogProps = {
  filtersKey: string;
  initialTasks: TaskCardData[];
  languages: Record<string, number>;
  tags: Record<string, number>;
};

export default function TaskCatalog({
  filtersKey,
  initialTasks,
  languages,
  tags,
}: TaskCatalogProps) {
  const [pendingFiltersKey, setPendingFiltersKey] = useState<string | null>(null);

  const handleFilterNavigationStart = useCallback((nextFiltersKey: string) => {
    setPendingFiltersKey(nextFiltersKey);
  }, []);

  const showSkeleton =
    pendingFiltersKey !== null && pendingFiltersKey !== filtersKey;

  return (
    <>
      <TaskFilters
        languages={languages}
        tags={tags}
        onNavigationStart={handleFilterNavigationStart}
      />
      <TaskList
        key={filtersKey}
        initialTasks={initialTasks}
        showSkeleton={showSkeleton}
      />
    </>
  );
}
