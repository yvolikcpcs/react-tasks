import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const checkSolutionRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, '60 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

export const generateTaskRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  analytics: true,
  prefix: '@upstash/ratelimit:generate-task',
});

export const createTaskRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, '1 d'),
  analytics: true,
  prefix: '@upstash/ratelimit:create-task',
});
