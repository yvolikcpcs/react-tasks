import { unstable_cache } from 'next/cache';
import type { Difficulty, TaskFiltersParams } from '@/lib/types/task';
import { createSupabasePublicClient } from '@/lib/supabase-public';
import { normalizeTag, normalizeTags } from '@/lib/tag-utils';
import {
  canonicalizeLanguageName,
  isKnownLanguageTag,
  normalizeLanguageLabel,
} from '@/lib/language-utils';

type TaskRow = {
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[] | null;
  hint: string | null;
  content: {
    languageName?: string;
    description?: string;
    starterCode?: string;
    referenceSolution?: string;
  } | null;
};

export const TASKS_LIST_CACHE_TAG = 'tasks-list';
export const TASKS_DETAIL_CACHE_TAG = 'tasks-detail';
export const TASKS_METADATA_CACHE_TAG = 'tasks-metadata';
const TASKS_CACHE_REVALIDATE_SECONDS = 300;

function normalizeDifficultyFilter(difficulty?: string) {
  return difficulty?.toLowerCase();
}

function normalizeTaskRowTags(tags: string[] | null | undefined) {
  return normalizeTags(tags ?? []).filter((tag) => !isKnownLanguageTag(tag));
}

function normalizeTaskLanguage(languageName: string | undefined) {
  return languageName ? normalizeLanguageLabel(languageName) : languageName;
}

function getTaskLanguageLabel(languageName: string | undefined) {
  return normalizeTaskLanguage(languageName) ?? 'Programming Language';
}

async function getAllTasksImpl() {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('slug,title,difficulty,tags,content')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  const rows = (data ?? []) as TaskRow[];
  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    languageName: normalizeTaskLanguage(row.content?.languageName),
    difficulty: row.difficulty,
    tags: normalizeTaskRowTags(row.tags),
  }));
}

async function getTaskBySlugImpl(slug: string) {
  const supabase = createSupabasePublicClient();
  const { data: row, error } = await supabase
    .from('tasks')
    .select('slug,title,difficulty,tags,hint,content')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch task "${slug}": ${error.message}`);
  }

  if (!row) {
    return null;
  }

  const description = row.content?.description ?? 'No description provided.';
  const languageName = normalizeTaskLanguage(row.content?.languageName) ?? 'Programming Language';
  const starterCode = row.content?.starterCode ?? '// No starter code provided';
  const referenceSolution = row.content?.referenceSolution ?? '';
  const hint = row.hint ?? '';

  return {
    data: {
      title: row.title,
      difficulty: row.difficulty,
      tags: normalizeTaskRowTags(row.tags),
      languageName,
      description,
      starterCode,
      referenceSolution,
      hint,
    },
  };
}

async function getTasksPaginatedImpl(
  limit = 10, 
  offset = 0, 
  filters: TaskFiltersParams = {}
) {
  const supabase = createSupabasePublicClient();
  
  // Start building the query
  let query = supabase
    .from('tasks')
    .select('slug, title, difficulty, tags, content')
    .order('created_at', { ascending: false });

  // Filter by difficulty
  if (filters.difficulty && filters.difficulty !== 'All') {
    query = query.eq('difficulty', normalizeDifficultyFilter(filters.difficulty));
  }

  const normalizedLanguageFilter =
    filters.language && filters.language !== 'All'
      ? canonicalizeLanguageName(filters.language)
      : null;
  const normalizedTagFilter =
    filters.tag && filters.tag !== 'All' ? normalizeTag(filters.tag) : null;

  const needsClientFiltering = Boolean(normalizedLanguageFilter || normalizedTagFilter);
  const finalQuery = needsClientFiltering ? query : query.range(offset, offset + limit - 1);
  const { data, error } = await finalQuery;

  if (error) throw new Error(error.message);

  const tasks = (data ?? []).map((row) => ({
    slug: row.slug,
    title: row.title,
    languageName: getTaskLanguageLabel(row.content?.languageName),
    difficulty: row.difficulty,
    tags: normalizeTaskRowTags(row.tags),
  }));

  if (!needsClientFiltering) {
    return tasks;
  }

  return tasks
    .filter((task) => {
      const matchesLanguage =
        !normalizedLanguageFilter ||
        canonicalizeLanguageName(task.languageName ?? '') === normalizedLanguageFilter;
      const matchesTag = !normalizedTagFilter || task.tags.includes(normalizedTagFilter);

      return matchesLanguage && matchesTag;
    })
    .slice(offset, offset + limit);
}

async function getFilterMetadataImpl(params: TaskFiltersParams = {}) {
  const supabase = createSupabasePublicClient();

  // We fetch all tasks to have global counts for languages and difficulty,
  // but we will count tags conditionally.
  const { data, error } = await supabase
    .from('tasks')
    .select('tags, content, difficulty');

  if (error) {
    console.error("Error fetching filter metadata:", error);
    return { languages: {}, tags: {} };
  }

  const languages: Record<string, number> = {};
  const tags: Record<string, number> = {};
  const selectedDifficulty = normalizeDifficultyFilter(params.difficulty);
  const selectedLanguage =
    params.language && params.language !== 'All'
      ? canonicalizeLanguageName(params.language)
      : null;
  
  // Note: Difficulty levels are usually static, 
  // but we can count them too if needed.

  data.forEach(row => {
    // 1. Always count languages (Global counts)
    const lang = row.content?.languageName;
    if (lang) {
      const displayLanguage = normalizeLanguageLabel(lang);

      if (displayLanguage) {
        languages[displayLanguage] = (languages[displayLanguage] || 0) + 1;
      }
    }

    // 2. Count tags only within the selected language/difficulty slice.
    // We intentionally do not narrow tag counts by the currently selected tag,
    // because the tag panel is meant to help users explore what else exists there.
    const matchesLanguage =
      !selectedLanguage ||
      canonicalizeLanguageName(lang ?? '') === selectedLanguage;
    const matchesDifficulty =
      !selectedDifficulty || params.difficulty === 'All' || row.difficulty === selectedDifficulty;

    if (matchesLanguage && matchesDifficulty) {
      normalizeTaskRowTags(row.tags).forEach((tag) => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    }
  });

  return { languages, tags };
}

const getAllTasksCached = unstable_cache(getAllTasksImpl, ['tasks-all'], {
  tags: [TASKS_LIST_CACHE_TAG],
  revalidate: TASKS_CACHE_REVALIDATE_SECONDS,
});

const getTaskBySlugCached = unstable_cache(getTaskBySlugImpl, ['task-by-slug'], {
  tags: [TASKS_DETAIL_CACHE_TAG],
  revalidate: TASKS_CACHE_REVALIDATE_SECONDS,
});

const getTasksPaginatedCached = unstable_cache(getTasksPaginatedImpl, ['tasks-paginated'], {
  tags: [TASKS_LIST_CACHE_TAG],
  revalidate: TASKS_CACHE_REVALIDATE_SECONDS,
});

const getFilterMetadataCached = unstable_cache(getFilterMetadataImpl, ['tasks-filter-metadata'], {
  tags: [TASKS_METADATA_CACHE_TAG],
  revalidate: TASKS_CACHE_REVALIDATE_SECONDS,
});

export async function getAllTasks() {
  return getAllTasksCached();
}

export async function getTaskBySlug(slug: string) {
  return getTaskBySlugCached(slug);
}

export async function getTasksPaginated(
  limit = 10,
  offset = 0,
  filters: TaskFiltersParams = {}
) {
  return getTasksPaginatedCached(limit, offset, filters);
}

export async function getFilterMetadata(params: TaskFiltersParams = {}) {
  return getFilterMetadataCached(params);
}
