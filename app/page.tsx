import { getAllTasks } from '@/lib/supabase-tasks';
import TaskFilters from '@/app/components/task/task-filters';
import TaskEditForm from '@/app/components/task/task-edit-form';
import { learningConfig } from '@/lib/learning-config';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export default async function Home() {
  const tasks = await getAllTasks();
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programming Challenges</h1>
          <p className="text-slate-500 mt-2">Pick a task and start coding with AI feedback.</p>
        </div>
        <TaskEditForm config={learningConfig} isGuest={!user}/>
      </div>

      <TaskFilters tasks={tasks} />
    </div>
  );
}
