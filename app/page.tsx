import { Suspense } from 'react';
import { getFilterMetadata, getTasksPaginated } from '@/lib/supabase-tasks';
import TaskFilters from '@/components/task/task-filters';
import TaskEditForm from '@/components/task/task-edit-form';
import TaskList from '@/components/task/task-list';
import TaskListSkeleton from '@/components/task/task-list-skeleton';
import { learningConfig } from '@/lib/learning-config';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { TaskFiltersParams } from '@/lib/types/task';

/**
 * Dedicated Async Component to handle data fetching for the task list.
 * This allows the rest of the page to render while the DB is queried.
 */
async function TaskListLoader({ searchParams }: { searchParams: TaskFiltersParams }) {
  const initialTasks = await getTasksPaginated(10, 0, searchParams);
  return <TaskList initialTasks={initialTasks} />;
}

export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<TaskFiltersParams> 
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fast fetch: metadata for filters
  const metadata = await getFilterMetadata(params);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programming Challenges</h1>
          <p className="text-slate-500 mt-2">Pick a task and start coding with AI feedback.</p>
        </div>
        <TaskEditForm config={learningConfig} isGuest={!user}/>
      </div>

      {/* Render filters immediately via SSR */}
      <TaskFilters 
        languages={metadata.languages} 
        tags={metadata.tags} 
      />

      <Suspense key={JSON.stringify(params)} fallback={<TaskListSkeleton />}>
        <TaskListLoader searchParams={params} />
      </Suspense>
    </div>
  );
}
