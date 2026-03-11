import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

function getNumberEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getWindowEnv(name: string, fallback: `${number} ${'s' | 'm' | 'h' | 'd'}`) {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw as `${number} ${'s' | 'm' | 'h' | 'd'}`;
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const checkSolutionRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    getNumberEnv('RATE_LIMIT_CHECK_SOLUTION_LIMIT', 1),
    getWindowEnv('RATE_LIMIT_CHECK_SOLUTION_WINDOW', '60 s')
  ),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

export const generateTaskRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    getNumberEnv('RATE_LIMIT_GENERATE_TASK_LIMIT', 5),
    getWindowEnv('RATE_LIMIT_GENERATE_TASK_WINDOW', '10 m')
  ),
  analytics: true,
  prefix: '@upstash/ratelimit:generate-task',
});

export const signInRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    getNumberEnv('RATE_LIMIT_SIGN_IN_LIMIT', 1),
    getWindowEnv('RATE_LIMIT_SIGN_IN_WINDOW', '60 s')),
  analytics: true,
  prefix: '@upstash/ratelimit:sign-in',
});
