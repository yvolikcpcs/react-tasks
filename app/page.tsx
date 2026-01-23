import { getAllTasks } from '@/lib/mdx';
import Link from 'next/link';

export default function Home() {
  const tasks = getAllTasks();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">React Challenges</h1>
        <p className="text-slate-500 mt-2">Pick a task and start coding with AI feedback.</p>
      </div>

      <div className="grid gap-3">
        {tasks.map((task) => (
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
                <span>{task.difficulty}</span>
                <span>•</span>
                <span>{task.category}</span>
              </div>
            </div>
            
            {/* Arrow on hover */}
            <span className="text-slate-300 group-hover:text-blue-500 transition-colors">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}