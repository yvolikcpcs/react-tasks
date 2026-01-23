import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '1 d'),
});

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    /**
     * Get the client's IP address.
     * 1. Try request.ip (available on Vercel)
     * 2. Fallback to 'x-forwarded-for' header (standard for proxies)
     * 3. Default to '127.0.0.1' for local development
     */
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';

    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse('Daily limit reached: 5 requests per day.', {
        status: 429,
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

export const config = {
  matcher: '/api/:path*',
};