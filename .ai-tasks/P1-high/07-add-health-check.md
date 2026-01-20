# Task: Add Health Check Endpoint

## Priority: P1 - HIGH
## Estimated Complexity: Low
## Files to Modify: `server/index.ts` or create `server/routes/health.ts`

---

## Problem

The application has no health check endpoint for:
- Container orchestration (Kubernetes, Docker)
- Load balancer health probes
- Monitoring systems
- Deployment verification

---

## Requirements

1. Basic liveness check (`/health` or `/api/health`)
2. Detailed readiness check (`/health/ready`)
3. Check database connectivity
4. Check external service connectivity
5. Return appropriate status codes

---

## Implementation

### Step 1: Create health check routes

```typescript
// server/routes/health.ts

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  checks?: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      message?: string;
      responseTime?: number;
    };
  };
}

// Simple liveness check - is the server running?
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Alias for compatibility
router.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Detailed readiness check - are all dependencies ready?
router.get('/health/ready', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const checks: HealthStatus['checks'] = {};
  let overallStatus: HealthStatus['status'] = 'healthy';

  // Check database
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    checks.database = {
      status: 'pass',
      responseTime: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
    overallStatus = 'unhealthy';
  }

  // Check Stripe (optional)
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripeStart = Date.now();
      // Just verify the key is valid format, don't make API call
      const isValid = process.env.STRIPE_SECRET_KEY.startsWith('sk_');
      checks.stripe = {
        status: isValid ? 'pass' : 'warn',
        message: isValid ? undefined : 'Invalid key format',
        responseTime: Date.now() - stripeStart,
      };
    } catch (error) {
      checks.stripe = {
        status: 'warn',
        message: 'Stripe check failed',
      };
      if (overallStatus === 'healthy') overallStatus = 'degraded';
    }
  }

  // Check email configuration
  checks.email = {
    status: process.env.MAILGUN_API_KEY ? 'pass' : 'warn',
    message: process.env.MAILGUN_API_KEY ? undefined : 'Email not configured',
  };
  if (!process.env.MAILGUN_API_KEY && overallStatus === 'healthy') {
    overallStatus = 'degraded';
  }

  // Check AI services
  checks.ai = {
    status: process.env.ANTHROPIC_API_KEY ? 'pass' : 'warn',
    message: process.env.ANTHROPIC_API_KEY ? undefined : 'AI not configured',
  };

  // Check S3/storage
  checks.storage = {
    status: process.env.AWS_ACCESS_KEY_ID ? 'pass' : 'warn',
    message: process.env.AWS_ACCESS_KEY_ID ? undefined : 'Storage not configured',
  };

  const response: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION || '1.0.0',
    checks,
  };

  // Return 503 if unhealthy, 200 otherwise
  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(response);
});

// Kubernetes-style probes
router.get('/health/live', (req: Request, res: Response) => {
  // Liveness - is the process alive?
  res.status(200).send('OK');
});

router.get('/health/startup', async (req: Request, res: Response) => {
  // Startup - has the app finished initializing?
  try {
    await db.execute(sql`SELECT 1`);
    res.status(200).send('OK');
  } catch {
    res.status(503).send('Starting');
  }
});

export default router;
```

### Step 2: Add to Express app

```typescript
// server/index.ts

import healthRouter from './routes/health';

// Add health routes early (before auth middleware)
app.use(healthRouter);

// ... rest of middleware
```

### Step 3: Update Dockerfile health check

```dockerfile
# In Dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
```

### Step 4: Add Kubernetes probes (if using K8s)

```yaml
# kubernetes/deployment.yaml
spec:
  containers:
    - name: ready2spray
      livenessProbe:
        httpGet:
          path: /health/live
          port: 3000
        initialDelaySeconds: 10
        periodSeconds: 10
        failureThreshold: 3
      readinessProbe:
        httpGet:
          path: /health/ready
          port: 3000
        initialDelaySeconds: 5
        periodSeconds: 5
        failureThreshold: 3
      startupProbe:
        httpGet:
          path: /health/startup
          port: 3000
        initialDelaySeconds: 0
        periodSeconds: 2
        failureThreshold: 30
```

---

## Response Examples

### GET /health (liveness)
```json
{
  "status": "healthy",
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

### GET /health/ready (readiness)
```json
{
  "status": "healthy",
  "timestamp": "2026-01-17T10:30:00.000Z",
  "uptime": 3600.5,
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "pass",
      "responseTime": 5
    },
    "stripe": {
      "status": "pass",
      "responseTime": 1
    },
    "email": {
      "status": "pass"
    },
    "ai": {
      "status": "pass"
    },
    "storage": {
      "status": "pass"
    }
  }
}
```

### GET /health/ready (degraded)
```json
{
  "status": "degraded",
  "timestamp": "2026-01-17T10:30:00.000Z",
  "uptime": 3600.5,
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "pass",
      "responseTime": 5
    },
    "email": {
      "status": "warn",
      "message": "Email not configured"
    }
  }
}
```

---

## Acceptance Criteria

- [ ] `/health` endpoint returns 200 when server is running
- [ ] `/health/ready` checks all critical dependencies
- [ ] Returns 503 when database is down
- [ ] Returns 200 with "degraded" when non-critical services are down
- [ ] Includes version and uptime information
- [ ] Response times tracked for dependencies
- [ ] Health check excluded from rate limiting
- [ ] Health check excluded from logging (to reduce noise)

---

## Notes for Aider

1. Add health routes before authentication middleware
2. Skip health checks in rate limiter and logger
3. Consider adding memory/CPU metrics
4. Don't expose sensitive information in health response
5. Test with database connection failure to verify 503 response
