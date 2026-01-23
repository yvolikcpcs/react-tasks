import { getTaskBySlug } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import InteractiveTask from '@/app/components/InteractiveTask';
import LevelBadge from '@/app/components/LevelBadge';
import CategoryBadge from '@/app/components/CategoryBadge';
import { ChevronLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default async function TaskPage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params)?.slug;
    const task = await getTaskBySlug(slug);

    if (!task) {
        notFound();
    }

    const { data, content } = task;

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

            <header className="mb-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {data.title}
                    </h1>
                </div>

                <div className="flex gap-4">
                    <LevelBadge level={data.level} />
                    <CategoryBadge category={data.category} />
                </div>
            </header>
            
            {/* MDX Content */}
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-code:text-blue-600">
                <MDXRemote source={content} components={{ InteractiveTask }} />
            </div>
        </article>
    );
}