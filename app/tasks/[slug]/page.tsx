import { Suspense } from 'react';
import { ChevronLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getTaskBySlug } from '@/lib/supabase-tasks';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import TaskInteractive from '@/components/task/task-interactive';
import DifficultyBadge from '@/components/badge/difficulty-badge';
import TagBadge from '@/components/badge/tag-badge';
import { learningConfig } from '@/lib/learning-config';
import { inferLanguageRuntime } from '@/lib/language-utils';
import TaskSkeleton from './loading';

async function TaskContent({ slug }: { slug: string }) {
  
  const task = await getTaskBySlug(slug);
  
  if (!task) return notFound();

  const { data } = task;
  const runtime = inferLanguageRuntime(data.languageName);

  return (
    <>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {data.title}
          </h1>
        </div>

        <div className="flex gap-4 flex-wrap">
          <DifficultyBadge difficulty={data.difficulty} />
          {data.tags.map((tag: string) => (
              <TagBadge key={`${slug}-${tag}`} tag={tag} />
          ))}
        </div>
      </header>
      
      <div className="prose prose-slate max-w-none">
        <MDXRemote source={data.description} />
      </div>

      <TaskInteractive
        starterCode={data.starterCode}
        taskTitle={data.title}
        solution={data.referenceSolution}
        hint={data.hint}
        config={{
          ...learningConfig,
          languageName: data.languageName,
          codeEditorLanguage: runtime.editor,
          codeFileExtension: runtime.ext,
        }}
      />
    </>
  );
}

export default async function TaskPage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params)?.slug

    return (
        <article className="max-w-4xl mx-auto">
            {/* Breadcrumbs / Back link */}
            <Link 
              href="/" 
              className="flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors mb-6 group"
            >
                <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to all tasks
            </Link>

            <Suspense fallback={<TaskSkeleton />}>
              <TaskContent slug={slug} />
            </Suspense>
        </article>
    );
}
