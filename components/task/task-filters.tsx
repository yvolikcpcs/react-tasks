'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterButton } from './filter-button';

interface TaskFiltersProps {
  languages: string[];
  tags: string[];
}

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export default function TaskFilters({ languages, tags }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentLanguage = searchParams.get('language') || 'All';
  const currentDifficulty = searchParams.get('difficulty') || 'All';
  const currentTag = searchParams.get('tag') || 'All';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'All') {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      // Updates the URL, which triggers the Server Component re-fetch
      router.push(`/?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <section className={`space-y-6`}>
      {/* Language Filter */}
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">Language / Framework</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterButton
            label="All" 
            active={currentLanguage === 'All'} 
            onClick={() => updateFilter('language', 'All')} 
          />
          {languages.map(lang => (
            <FilterButton 
              key={lang} 
              label={lang} 
              active={currentLanguage === lang} 
              onClick={() => updateFilter('language', lang)} 
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
              active={currentDifficulty === level} 
              onClick={() => updateFilter('difficulty', level)} 
              variant="emerald"
            />
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Tags</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterButton 
              label="All" 
              active={currentTag === 'All'} 
              onClick={() => updateFilter('tag', 'All')} 
            />
            {tags.map(tag => (
              <FilterButton 
                key={tag} 
                label={tag} 
                active={currentTag === tag} 
                onClick={() => updateFilter('tag', tag)} 
                variant="blue"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
