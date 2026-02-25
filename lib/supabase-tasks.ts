import type { Difficulty } from '@/lib/types/task';
import { createSupabaseServerClient } from '@/lib/supabase-server';

type TaskRow = {
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[] | null;
  hint: string | null;
  content: {
    description?: string;
    starterCode?: string;
    referenceSolution?: string;
  } | null;
};

export async function getAllTasks() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('slug,title,difficulty,tags,hint')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  const rows = (data ?? []) as TaskRow[];
  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
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
  const starterCode = row.content?.starterCode ?? '// No starter code provided';
  const referenceSolution = row.content?.referenceSolution ?? '';
  const hint = row.hint ?? '';

  return {
    data: {
      title: row.title,
      difficulty: row.difficulty,
      tags: row.tags ?? [],
      description,
      starterCode,
      referenceSolution,
      hint,
    },
  };
}
