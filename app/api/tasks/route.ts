import { NextResponse } from 'next/server';
import { getTasksPaginated } from '@/lib/supabase-tasks';
import type { TaskFiltersParams } from '@/lib/types/task';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

function getTaskFilters(searchParams: URLSearchParams): TaskFiltersParams {
  const language = searchParams.get('language');
  const difficulty = searchParams.get('difficulty');
  const tag = searchParams.get('tag');

  return {
    ...(language ? { language } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(tag ? { tag } : {}),
  };
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const limit = Math.min(
    parsePositiveInteger(requestUrl.searchParams.get('limit'), DEFAULT_LIMIT),
    MAX_LIMIT
  );
  const offset = parsePositiveInteger(requestUrl.searchParams.get('offset'), 0);
  const filters = getTaskFilters(requestUrl.searchParams);

  try {
    const tasks = await getTasksPaginated(limit, offset, filters);

    return NextResponse.json(
      {
        items: tasks,
        pagination: {
          limit,
          offset,
          count: tasks.length,
        },
        filters,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
      },
      {
        status: 500,
      }
    );
  }
}
