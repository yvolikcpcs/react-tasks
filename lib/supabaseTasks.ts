type Difficulty = 'easy' | 'medium' | 'hard';

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

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured');
  }

  return { url, key };
}

export async function getAllTasks() {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/tasks?select=slug,title,difficulty,tags,hint`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${await response.text()}`);
  }

  const rows = (await response.json()) as TaskRow[];
  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    difficulty: row.difficulty,
    tags: row.tags ?? [],
  }));
}

export async function getTaskBySlug(slug: string) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/tasks?select=slug,title,difficulty,tags,hint,content&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch task "${slug}": ${await response.text()}`);
  }

  const rows = (await response.json()) as TaskRow[];
  const row = rows[0];

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
