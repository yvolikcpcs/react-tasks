import { getTaskBySlug } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import InteractiveTask from '@/components/InteractiveTask';

export default async function TaskPage({ params }: { params: Promise<{ slug: string }> }) {
  const task = await getTaskBySlug((await params)?.slug);
  if (!task) {
    notFound();
  }
  const { data, content } = task;

  return (
    <article className="max-w-3xl mx-auto p-8 prose lg:prose-xl">
      <header className="mb-8">
        <h1 className="mb-2">{data.title}</h1>
        <div className="flex gap-2">
          <span className="badge">{data.difficulty}</span>
          <span className="badge">{data.category}</span>
        </div>
      </header>
      
      {/* Рендерим контент из MDX */}
      <MDXRemote source={content} components={{ InteractiveTask }} />
    </article>
  );
}
