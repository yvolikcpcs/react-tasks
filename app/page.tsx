import { getFilterMetadata, getTasksPaginated } from '@/lib/supabase-tasks';
import TaskEditForm from '@/components/task/task-edit-form';
import TaskCatalog from '@/components/task/task-catalog';
import { learningConfig } from '@/lib/learning-config';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { TaskFiltersParams } from '@/lib/types/task';

function buildFiltersKey(params: TaskFiltersParams) {
  return new URLSearchParams(
    Object.entries(params).filter((entry): entry is [string, string] => {
      const [, value] = entry;
      return typeof value === 'string' && value.length > 0;
    })
  ).toString();
}

export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<TaskFiltersParams> 
}) {
  const params = await searchParams;
  const userPromise = createSupabaseServerClient().then((supabase) => supabase.auth.getUser());
  const [initialTasks, metadata] = await Promise.all([
    getTasksPaginated(10, 0, params),
    getFilterMetadata(params),
  ]);
  const filtersKey = buildFiltersKey(params);

  const userResult = await userPromise;
  const user = userResult.data.user;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programming Challenges</h1>
          <p className="text-slate-500 mt-2">Pick a task and start coding with AI feedback.</p>
        </div>
        <TaskEditForm config={learningConfig} isGuest={!user}/>
      </div>

      <TaskCatalog
        filtersKey={filtersKey}
        initialTasks={initialTasks}
        languages={metadata.languages} 
        tags={metadata.tags} 
      />
    </div>
  );
}
