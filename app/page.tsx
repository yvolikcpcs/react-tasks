// app/page.tsx
import { getFilterMetadata, getTasksPaginated } from '@/lib/supabase-tasks';
import TaskFilters from '@/components/task/task-filters';
import TaskEditForm from '@/components/task/task-edit-form';
import TaskList from '@/components/task/task-list';
import { learningConfig } from '@/lib/learning-config';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { TaskFiltersParams } from '@/lib/types/task';

export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<TaskFiltersParams> 
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Parallel fetch: current tasks and dynamic filter options
  const [initialTasks, metadata] = await Promise.all([
    getTasksPaginated(10, 0, params),
    getFilterMetadata()
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programming Challenges</h1>
          <p className="text-slate-500 mt-2">Pick a task and start coding with AI feedback.</p>
        </div>
        <TaskEditForm config={learningConfig} isGuest={!user}/>
      </div>

      {/* Pass the dynamically fetched languages and tags */}
      <TaskFilters 
        languages={metadata.languages} 
        tags={metadata.tags} 
      />

      {/* This component handles the "Show more" logic and initial data display */}
      <TaskList initialTasks={initialTasks} />
    </div>
  );
}