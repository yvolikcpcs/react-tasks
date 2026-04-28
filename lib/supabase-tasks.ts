import type { Difficulty, TaskFiltersParams } from '@/lib/types/task';
import { createSupabaseServerClient } from '@/lib/supabase-server';

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

export async function getAllTasks() {
  const supabase = await createSupabaseServerClient();
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
    languageName: row.content?.languageName,
    difficulty: row.difficulty,
    tags: row.tags ?? [],
  }));
}

export async function getTaskBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
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
  const languageName = row.content?.languageName ?? 'Programming Language';
  const starterCode = row.content?.starterCode ?? '// No starter code provided';
  const referenceSolution = row.content?.referenceSolution ?? '';
  const hint = row.hint ?? '';

  return {
    data: {
      title: row.title,
      difficulty: row.difficulty,
      tags: row.tags ?? [],
      languageName,
      description,
      starterCode,
      referenceSolution,
      hint,
    },
  };
}

export async function getTasksPaginated(
  limit = 10, 
  offset = 0, 
  filters: TaskFiltersParams = {}
) {
  const supabase = await createSupabaseServerClient();
  
  // Start building the query
  let query = supabase
    .from('tasks')
    .select('slug, title, difficulty, tags, content')
    .order('created_at', { ascending: false });

  // Filter by language inside the JSONB 'content' column
  if (filters.language && filters.language !== 'All') {
    query = query.eq('content->>languageName', filters.language);
  }

  // Filter by difficulty
  if (filters.difficulty && filters.difficulty !== 'All') {
    query = query.eq('difficulty', filters.difficulty.toLowerCase());
  }

  // Filter by tags (Postgres array contains check)
  if (filters.tag && filters.tag !== 'All') {
    query = query.contains('tags', [filters.tag]);
  }

  // Apply pagination range
  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    slug: row.slug,
    title: row.title,
    languageName: row.content?.languageName,
    difficulty: row.difficulty,
    tags: row.tags ?? [],
  }));
}

export async function getFilterMetadata(params: TaskFiltersParams = {}) {
  const supabase = await createSupabaseServerClient();

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
  
  // Note: Difficulty levels are usually static, 
  // but we can count them too if needed.

  data.forEach(row => {
    // 1. Always count languages (Global counts)
    const lang = row.content?.languageName;
    if (lang) {
      languages[lang] = (languages[lang] || 0) + 1;
    }

    // 2. Count tags ONLY if the task matches selected Language and Difficulty
    const matchesLanguage = !params.language || params.language === 'All' || lang === params.language;
    const matchesDifficulty = !params.difficulty || params.difficulty === 'All' || row.difficulty === params.difficulty;

    if (matchesLanguage && matchesDifficulty) {
      if (Array.isArray(row.tags)) {
        row.tags.forEach((tag: string) => {
          if (tag) {
            tags[tag] = (tags[tag] || 0) + 1;
          }
        });
      }
    }
  });

  return { languages, tags };
}
