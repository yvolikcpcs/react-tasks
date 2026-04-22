import { BookOpen, BarChart3, Tag, RotateCcw } from 'lucide-react';

/**
 * Shimmer effect using Tailwind's pulse animation.
 */
const SHIMMER = "animate-pulse bg-slate-100 dark:bg-slate-800 rounded";

export default function TaskSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* 1. Header Section Skeleton */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          {/* Mock icon container */}
          <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <BookOpen className="w-6 h-6 text-slate-200" />
          </div>
          {/* Title skeleton */}
          <div className={`h-9 w-2/3 ${SHIMMER} bg-slate-200 dark:bg-slate-700`} />
        </div>

        {/* Badges skeleton */}
        <div className="flex gap-4 flex-wrap">
          <div className={`h-7 w-24 rounded-full ${SHIMMER} flex items-center px-3`}>
            <BarChart3 className="mr-2 h-4 w-4 text-slate-200" />
            <div className={`h-3 w-12 ${SHIMMER} bg-slate-200 dark:bg-slate-600`} />
          </div>
          <div className={`h-7 w-20 rounded-full ${SHIMMER} flex items-center px-3`}>
            <Tag className="mr-2 h-4 w-4 text-slate-200" />
            <div className={`h-3 w-10 ${SHIMMER} bg-slate-200 dark:bg-slate-600`} />
          </div>
        </div>
      </header>
      
      {/* 2. Description Content Skeleton */}
      <div className="space-y-3 mb-12">
        <div className={`h-5 w-full ${SHIMMER}`} />
        <div className={`h-5 w-11/12 ${SHIMMER}`} />
        <div className={`h-5 w-4/5 ${SHIMMER}`} />
        <div className="pt-4 space-y-2">
            <div className={`h-5 w-full ${SHIMMER}`} />
            <div className={`h-5 w-2/3 ${SHIMMER}`} />
        </div>
      </div>

      {/* 3. Code Editor Mockup Skeleton */}
      <div className="my-8 border border-slate-700 rounded-xl overflow-hidden bg-[#1e1e1e] shadow-2xl">
        {/* Editor Toolbar */}
        <div className="bg-[#2d2d2d] px-4 py-2.5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] opacity-30" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-30" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] opacity-30" />
            </div>
            {/* Mock filename */}
            <div className={`h-3 w-32 ${SHIMMER} bg-slate-700 opacity-40`} />
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <RotateCcw className="w-3 h-3" />
            <div className={`h-2 w-10 ${SHIMMER} bg-slate-700`} />
          </div>
        </div>
        
        {/* Mock Editor Lines */}
        <div className="p-6 space-y-4 bg-[#1e1e1e]">
          {[...Array(6)].map((_, i) => {
            const deterministicWidth = 30 + (i * 137) % 50;
            return (
              <div key={i} className="flex gap-4">
                <div className="w-4 h-4 text-slate-600 text-xs font-mono">{i + 1}</div>
                <div className={`h-4 ${SHIMMER} bg-slate-800`} style={{ width: `${deterministicWidth}%` }} />
              </div>
            );
          })}
        </div>

        {/* Action Bar Footer */}
        <div className="p-4 bg-[#1e1e1e] border-t border-slate-800">
          <div className={`h-4 w-1/2 ${SHIMMER} bg-slate-800 mb-4`} />
          <div className="flex gap-2">
            <div className={`h-12 w-32 rounded-lg ${SHIMMER} bg-slate-700`} />
            <div className={`h-12 w-48 rounded-lg ${SHIMMER} bg-indigo-900/40`} />
          </div>
        </div>
      </div>
    </div>
  );
}