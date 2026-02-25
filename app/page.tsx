import { getAllTasks } from '@/lib/supabaseTasks';
import TaskFilters from '@/app/components/TaskFilters';
import TaskAdminForm from '@/app/components/TaskAdminForm';

export default async function Home() {
  const tasks = await getAllTasks();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">React Challenges</h1>
          <p className="text-slate-500 mt-2">Pick a task and start coding with AI feedback.</p>
        </div>
        <TaskAdminForm />
      </div>

      <TaskFilters tasks={tasks} />
    </div>
  );
}
