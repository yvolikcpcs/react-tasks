import { getAllTasks } from '@/lib/mdx';
import Link from 'next/link';

export default function Home() {
  const tasks = getAllTasks();

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">React Level-Up Tasks</h1>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Link 
            key={task.slug} 
            href={`/tasks/${task.slug}`}
            className="p-6 border rounded-xl hover:border-blue-500 transition-colors shadow-sm"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{task.title}</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {task.difficulty}
              </span>
            </div>
            <p className="text-gray-500 mt-2">{task.category}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}