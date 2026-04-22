import { BarChart3, Code2 } from 'lucide-react';

const SHIMMER = "animate-pulse bg-slate-100 dark:bg-slate-800 rounded";

/**
 * Individual task card skeleton mimicking task-preview-card.tsx
 */
function TaskCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 p-5 bg-white shadow-sm">
      <div className="space-y-3 flex-1">
        {/* Title skeleton */}
        <div className={`h-5 w-1/2 ${SHIMMER} bg-slate-200`} />
        
        {/* Badges row skeleton */}
        <div className="mt-2 flex flex-wrap gap-2">
          {/* Language badge */}
          <div className={`h-7 w-24 rounded-full ${SHIMMER} flex items-center px-3`}>
            <Code2 className="mr-2 h-4 w-4 text-slate-200" />
            <div className={`h-3 w-12 ${SHIMMER} bg-slate-200`} />
          </div>
          {/* Difficulty badge */}
          <div className={`h-7 w-20 rounded-full ${SHIMMER} flex items-center px-3`}>
            <BarChart3 className="mr-2 h-4 w-4 text-slate-200" />
            <div className={`h-3 w-10 ${SHIMMER} bg-slate-200`} />
          </div>
        </div>
      </div>
      {/* Arrow icon placeholder */}
      <span className="text-slate-200 ml-4">→</span>
    </div>
  );
}

/**
 * Container for multiple task card skeletons
 */
export default function TaskListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}