import { getAllTasks } from '@/lib/mdx';
import TaskFilters from '@/app/components/TaskFilters';

export default function Home() {
  const tasks = getAllTasks();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">React Challenges</h1>
        <p className="text-slate-500 mt-2">Pick a task and start coding with AI feedback.</p>
      </div>

      <TaskFilters tasks={tasks} />
    </div>
  );
}
