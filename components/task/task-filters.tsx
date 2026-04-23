'use client';

import { useTransition, useState, useMemo, useOptimistic } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterButton } from './filter-button';

interface TaskFiltersProps {
  languages: Record<string, number>;
  tags: Record<string, number>;
}

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const INITIAL_TAG_LIMIT = 20;

export default function TaskFilters({ languages, tags }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showMoreTags, setShowMoreTags] = useState(false);

  // 1. Get real state from URL
  const currentLanguage = searchParams.get('language') || 'All';
  const currentDifficulty = searchParams.get('difficulty') || 'All';
  const currentTag = searchParams.get('tag') || 'All';

  // 2. Define Optimistic States
  // These will update instantly, then sync back with URL once the server responds
  const [optLang, setOptLang] = useOptimistic(currentLanguage);
  const [optDiff, setOptDiff] = useOptimistic(currentDifficulty);
  const [optTag, setOptTag] = useOptimistic(currentTag);

  const sortedLanguages = useMemo(() => {
    return Object.entries(languages)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [languages]);

  const { displayedTags, hasMore } = useMemo(() => {
    const allTags = Object.entries(tags)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const hasMore = allTags.length > INITIAL_TAG_LIMIT;
    const displayed = showMoreTags ? allTags : allTags.slice(0, INITIAL_TAG_LIMIT);

    return { displayedTags: displayed, hasMore };
  }, [tags, showMoreTags]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'All') {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      // 3. Update optimistic state immediately
      if (key === 'language') setOptLang(value);
      if (key === 'difficulty') setOptDiff(value);
      if (key === 'tag') setOptTag(value);

      // Start the actual navigation in background
      router.push(`/?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <section className={`space-y-6 ${isPending ? 'opacity-70' : ''}`}>
      {/* Language Filter */}
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">Language / Framework</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterButton
            label="All" 
            active={optLang === 'All'} // Using optimistic value
            onClick={() => updateFilter('language', 'All')} 
            variant="blue"
          />
          {sortedLanguages.map(({ name }) => (
            <FilterButton 
              key={name} 
              label={name} 
              active={optLang === name} // Using optimistic value
              onClick={() => updateFilter('language', name)} 
              variant="violet"
            />
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">Difficulty</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DIFFICULTIES.map(level => (
            <FilterButton 
              key={level} 
              label={level} 
              active={optDiff === level} // Using optimistic value
              onClick={() => updateFilter('difficulty', level)} 
              variant="emerald"
            />
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">Tags</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterButton 
            label="All" 
            active={optTag === 'All'} // Using optimistic value
            onClick={() => updateFilter('tag', 'All')} 
            variant="yellow"
          />
          {displayedTags.map(({ name, count }) => (
            <FilterButton 
              key={name} 
              label={`${name} (${count})`} 
              active={optTag === name} // Using optimistic value
              onClick={() => updateFilter('tag', name)} 
              variant="yellow"
            />
          ))}
          
          {hasMore && (
            <button
              onClick={() => setShowMoreTags(!showMoreTags)}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 underline underline-offset-4 px-2 cursor-pointer"
            >
              {showMoreTags ? 'Show less' : `+${Object.keys(tags).length - INITIAL_TAG_LIMIT} more`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}