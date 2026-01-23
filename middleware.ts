import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

/**
 * Initialize Ratelimit with Vercel KV (Redis)
 */
const ratelimit = new Ratelimit({
  redis: kv,
  // Limit to 5 requests per day (sliding window)
  limiter: Ratelimit.slidingWindow(5, '1 d'),
});

export default async function middleware(request: NextRequest) {
  /**
   * Only apply rate limiting to API routes to avoid
   * blocking static assets like images, fonts, or styles.
   */
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    // Identify the user by IP address or default to localhost
    const ip = request.ip ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse('Daily limit reached: 5 requests per day.', {
        status: 429, // Too Many Requests
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }
  }

  return NextResponse.next();
}

/**
 * Configure the middleware to run only on specific paths
 */
export const config = {
  matcher: '/api/:path*',
};