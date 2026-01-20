# Task: Add Rate Limiting

## Priority: P1 - HIGH
## Estimated Complexity: Medium
## Files to Modify: `server/middleware/`, router files

---

## Problem

From the review, `rateLimiter.ts` exists but isn't applied to tRPC procedures. This leaves the API vulnerable to:
- Brute force attacks on login
- API abuse and scraping
- DoS attacks
- Resource exhaustion

---

## Requirements

1. Apply rate limiting to all API endpoints
2. Stricter limits on authentication endpoints
3. Per-user rate limiting for authenticated routes
4. IP-based rate limiting for public routes
5. Configurable limits via environment variables

---

## Implementation

### Step 1: Install rate limiting packages

```bash
npm install express-rate-limit rate-limit-redis ioredis
```

### Step 2: Create rate limiter configuration

```typescript
// server/middleware/rateLimiter.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { Request, Response } from 'express';

// Redis client (optional, falls back to memory)
const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null;

// Create store based on availability
function createStore(prefix: string) {
  if (redisClient) {
    return new RedisStore({
      sendCommand: (...args: string[]) => redisClient.call(...args),
      prefix: `rl:${prefix}:`,
    });
  }
  return undefined; // Uses memory store
}

// Key generator - uses user ID if authenticated, IP otherwise
function keyGenerator(req: Request): string {
  const user = (req as any).user;
  if (user?.id) {
    return `user:${user.id}`;
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

// Standard API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_API || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('api'),
  keyGenerator,
  message: {
    error: 'Too many requests',
    retryAfter: 60,
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  },
});

// Strict rate limiter for authentication
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_AUTH || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('auth'),
  keyGenerator: (req) => req.ip || 'unknown', // Always use IP for auth
  message: {
    error: 'Too many authentication attempts',
    retryAfter: 900,
  },
});

// Strict rate limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('pwreset'),
  keyGenerator: (req) => req.ip || 'unknown',
  message: {
    error: 'Too many password reset attempts',
    retryAfter: 3600,
  },
});

// Generous limiter for read operations
export const readLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_READ || '200', 10),
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('read'),
  keyGenerator,
});

// Strict limiter for write operations
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_WRITE || '30', 10),
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('write'),
  keyGenerator,
});

// AI endpoint limiter (expensive operations)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_AI || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('ai'),
  keyGenerator,
  message: {
    error: 'AI rate limit exceeded',
    retryAfter: 60,
  },
});

// Webhook limiter (per source)
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('webhook'),
  keyGenerator: (req) => req.ip || 'unknown',
});
```

### Step 3: Apply to Express routes

```typescript
// server/index.ts

import {
  apiLimiter,
  authLimiter,
  aiLimiter,
  webhookLimiter,
} from './middleware/rateLimiter';

// Apply global API rate limit
app.use('/api', apiLimiter);

// Apply stricter limit to auth routes
app.use('/api/auth', authLimiter);

// Apply AI limiter to AI routes
app.use('/api/ai', aiLimiter);
app.use('/api/trpc/ai', aiLimiter);

// Apply webhook limiter
app.use('/api/webhooks', webhookLimiter);
```

### Step 4: Apply to tRPC procedures

```typescript
// server/trpc.ts or server/routers.ts

import { TRPCError } from '@trpc/server';

// Rate limit middleware for tRPC
const rateLimitMiddleware = (limit: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetAt: number }>();

  return t.middleware(async ({ ctx, next }) => {
    const key = ctx.user?.id || ctx.req.ip || 'unknown';
    const now = Date.now();

    let entry = requests.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      requests.set(key, entry);
    }

    entry.count++;

    if (entry.count > limit) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded',
      });
    }

    return next();
  });
};

// Apply to specific procedures
const aiProcedure = protectedProcedure.use(
  rateLimitMiddleware(10, 60 * 1000) // 10 per minute
);

// Use in routers
export const aiRouter = router({
  chat: aiProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      // AI chat logic
    }),
});
```

### Step 5: Add environment variables

```bash
# .env.example additions

# Rate Limiting
REDIS_URL=redis://localhost:6379  # Optional, falls back to memory
RATE_LIMIT_API=100      # Requests per minute for general API
RATE_LIMIT_AUTH=10      # Attempts per 15 minutes for auth
RATE_LIMIT_READ=200     # Requests per minute for read operations
RATE_LIMIT_WRITE=30     # Requests per minute for write operations
RATE_LIMIT_AI=10        # Requests per minute for AI endpoints
```

### Step 6: Add rate limit headers to responses

```typescript
// Clients can check these headers
// X-RateLimit-Limit: 100
// X-RateLimit-Remaining: 95
// X-RateLimit-Reset: 1705486800
```

---

## Acceptance Criteria

- [ ] Global API rate limiting applied
- [ ] Stricter limits on authentication endpoints
- [ ] AI endpoints have separate limits
- [ ] Rate limits configurable via environment
- [ ] Rate limit headers included in responses
- [ ] Redis support for distributed deployments
- [ ] Graceful fallback to memory store

---

## Testing

```bash
# Test rate limiting
for i in {1..15}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/auth/login
done
# Should see 429 after 10 requests
```

---

## Notes for Aider

1. Check existing `rateLimiter.ts` file and update it
2. Ensure rate limiting is applied to all API routes
3. Be careful with tRPC - may need different approach than Express middleware
4. Consider using Redis if the app is deployed across multiple instances
5. Add rate limit bypass for internal/service accounts if needed
