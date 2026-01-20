# Task: Add Production Logging

## Priority: P1 - HIGH
## Estimated Complexity: Medium
## Files to Modify: `server/` files, create logging utility

---

## Problem

The application likely uses `console.log` for logging, which:
- Provides no log levels (error, warn, info, debug)
- Has no structured format for log aggregation
- Cannot be easily filtered in production
- Doesn't include important context (request ID, user ID)

---

## Requirements

1. Structured JSON logging for production
2. Pretty printing for development
3. Request ID tracking
4. User context in logs
5. Log levels (error, warn, info, debug)
6. Request/response logging

---

## Implementation

### Step 1: Install logging library

```bash
npm install pino pino-http pino-pretty
```

### Step 2: Create logger utility

```typescript
// server/lib/logger.ts

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Pretty print in development, JSON in production
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,

  // Base context included in all logs
  base: {
    env: process.env.NODE_ENV,
    app: 'ready2spray',
    version: process.env.APP_VERSION || '1.0.0',
  },

  // Redact sensitive fields
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'token',
      'apiKey',
      'secret',
    ],
    censor: '[REDACTED]',
  },
});

// Child logger factory for adding context
export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

// Request-scoped logger factory
export function createRequestLogger(requestId: string, userId?: string) {
  return logger.child({
    requestId,
    userId: userId || 'anonymous',
  });
}
```

### Step 3: Create HTTP logging middleware

```typescript
// server/middleware/httpLogger.ts

import pinoHttp from 'pino-http';
import { logger } from '../lib/logger';
import { randomUUID } from 'crypto';

export const httpLogger = pinoHttp({
  logger,

  // Generate request ID
  genReqId: (req) => {
    return req.headers['x-request-id']?.toString() || randomUUID();
  },

  // Customize what gets logged
  customProps: (req, res) => ({
    userId: (req as any).user?.id,
    orgId: (req as any).user?.orgId,
  }),

  // Don't log health checks
  autoLogging: {
    ignore: (req) => req.url === '/health' || req.url === '/api/health',
  },

  // Customize log level based on status code
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },

  // Custom success message
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed`;
  },

  // Custom error message
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed: ${err.message}`;
  },

  // Serialize request
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      // Don't log body by default (may contain sensitive data)
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
```

### Step 4: Create request ID middleware

```typescript
// server/middleware/requestId.ts

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.id = req.headers['x-request-id']?.toString() || randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
}
```

### Step 5: Apply middleware in Express

```typescript
// server/index.ts

import { logger } from './lib/logger';
import { httpLogger } from './middleware/httpLogger';
import { requestIdMiddleware } from './middleware/requestId';

const app = express();

// Request ID first
app.use(requestIdMiddleware);

// HTTP logging
app.use(httpLogger);

// ... rest of middleware

// Log server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});

// Log uncaught errors
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
});
```

### Step 6: Use logger in application code

```typescript
// Example usage in routers

import { logger, createRequestLogger } from '../lib/logger';

// In a tRPC procedure or Express route
async function createJob(input, ctx) {
  const log = createRequestLogger(ctx.req.id, ctx.user?.id);

  log.info({ customerId: input.customerId }, 'Creating new job');

  try {
    const job = await db.insert(jobs).values(input).returning();
    log.info({ jobId: job.id }, 'Job created successfully');
    return job;
  } catch (error) {
    log.error({ error, input }, 'Failed to create job');
    throw error;
  }
}
```

### Step 7: Add log rotation (production)

For production, use a log aggregation service (CloudWatch, Datadog, Logtail) or configure log rotation:

```typescript
// For file-based logging with rotation
import pino from 'pino';
import { multistream } from 'pino-multi-stream';

const streams = [
  { stream: process.stdout },
  {
    stream: pino.destination({
      dest: '/var/log/ready2spray/app.log',
      sync: false,
      mkdir: true,
    }),
  },
];

export const logger = pino(
  { level: 'info' },
  multistream(streams)
);
```

---

## Environment Variables

```bash
# .env.example additions

# Logging
LOG_LEVEL=info  # debug, info, warn, error, fatal
```

---

## Acceptance Criteria

- [ ] Logger utility created with proper configuration
- [ ] HTTP request/response logging enabled
- [ ] Request IDs tracked through requests
- [ ] User context included in logs
- [ ] Sensitive data redacted
- [ ] Pretty printing in development, JSON in production
- [ ] Console.log calls replaced with logger calls

---

## Log Output Examples

### Development (pretty)
```
[2026-01-17 10:30:15] INFO: Server started
    port: 3000
    env: "development"

[2026-01-17 10:30:20] INFO: POST /api/jobs completed
    requestId: "abc-123"
    userId: "user-456"
    statusCode: 201
    responseTime: 45
```

### Production (JSON)
```json
{"level":30,"time":1705486215000,"msg":"Server started","port":3000,"env":"production","app":"ready2spray"}
{"level":30,"time":1705486220000,"msg":"POST /api/jobs completed","requestId":"abc-123","userId":"user-456","statusCode":201,"responseTime":45}
```

---

## Notes for Aider

1. Search for existing logging patterns in the codebase
2. Replace `console.log`, `console.error` with logger calls
3. Ensure sensitive data is added to redaction list
4. Add request ID to tRPC context if using tRPC
5. Consider adding audit-specific logging for compliance
