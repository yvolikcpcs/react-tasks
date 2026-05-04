import { NextResponse } from 'next/server';
import { getTaskBySlug } from '@/lib/supabase-tasks';

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const task = await getTaskBySlug(slug);

    if (!task) {
      return NextResponse.json(
        {
          error: `Task "${slug}" not found`,
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        slug,
        ...task,
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
        error: error instanceof Error ? error.message : 'Failed to fetch task',
      },
      {
        status: 500,
      }
    );
  }
}
