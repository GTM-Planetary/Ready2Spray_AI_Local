# Task: Create API Documentation

## Priority: P1 - HIGH
## Estimated Complexity: Medium
## Files to Create: `docs/api.md`, OpenAPI spec, or integrate docs tool

---

## Problem

The API has no documentation. Developers (internal and external) cannot:
- Understand available endpoints
- Know required parameters
- Understand response formats
- Test API calls
- Integrate with the platform

---

## Requirements

1. Document all API endpoints
2. Include request/response examples
3. Document authentication
4. Document error codes
5. Make documentation accessible

---

## Options

### Option A: Static Markdown Documentation
Simple, version-controlled, no additional tools.

### Option B: OpenAPI/Swagger
Standard format, auto-generates interactive docs.

### Option C: tRPC Panel (for tRPC)
If using tRPC, provides automatic documentation.

---

## Implementation (Option B - OpenAPI)

### Step 1: Install OpenAPI tools

```bash
npm install swagger-ui-express swagger-jsdoc
npm install -D @types/swagger-ui-express @types/swagger-jsdoc
```

### Step 2: Create OpenAPI configuration

```typescript
// server/docs/swagger.ts

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ready2Spray API',
      version: '1.0.0',
      description: 'API documentation for Ready2Spray agricultural operations platform',
      contact: {
        name: 'GTM Planetary',
        email: 'support@gtmplanetary.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.ready2spray.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' },
          },
        },
        Job: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'],
            },
            customerId: { type: 'string', format: 'uuid' },
            scheduledStart: { type: 'string', format: 'date-time' },
            scheduledEnd: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
          },
        },
        // Add more schemas as needed
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./server/routes/*.ts', './server/routers.ts'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Ready2Spray API Docs',
  }));

  // Also serve raw OpenAPI JSON
  app.get('/api/docs.json', (req, res) => {
    res.json(specs);
  });
}
```

### Step 3: Add JSDoc annotations to routes

```typescript
// server/routes/jobs.ts

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: List all jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, scheduled, in_progress, completed, cancelled]
 *         description: Filter by job status
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by customer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of jobs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of jobs to skip
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/jobs', authMiddleware, async (req, res) => {
  // Implementation
});

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - customerId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               customerId:
 *                 type: string
 *                 format: uuid
 *               scheduledStart:
 *                 type: string
 *                 format: date-time
 *               scheduledEnd:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/jobs', authMiddleware, async (req, res) => {
  // Implementation
});
```

### Step 4: Add to Express app

```typescript
// server/index.ts

import { setupSwagger } from './docs/swagger';

// After middleware setup
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_API_DOCS === 'true') {
  setupSwagger(app);
  console.log('API docs available at /api/docs');
}
```

### Step 5: Create static API overview

```markdown
// docs/API.md

# Ready2Spray API

## Overview

The Ready2Spray API provides programmatic access to manage spray operations.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://api.ready2spray.com/api`

## Authentication

All API requests require authentication using either:

1. **JWT Bearer Token** - Include in Authorization header
   ```
   Authorization: Bearer <your-jwt-token>
   ```

2. **API Key** - Include in X-API-Key header
   ```
   X-API-Key: <your-api-key>
   ```

## Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| General API | 100/minute |
| Auth endpoints | 10/15 minutes |
| AI endpoints | 10/minute |

## Endpoints

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/jobs | List jobs |
| POST | /api/jobs | Create job |
| GET | /api/jobs/:id | Get job |
| PUT | /api/jobs/:id | Update job |
| DELETE | /api/jobs/:id | Delete job |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/customers | List customers |
| POST | /api/customers | Create customer |
| GET | /api/customers/:id | Get customer |
| PUT | /api/customers/:id | Update customer |
| DELETE | /api/customers/:id | Delete customer |

[... continue for all endpoints ...]

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Webhooks

Configure webhooks to receive real-time notifications.

### Events

- `job.created`
- `job.updated`
- `job.completed`
- `customer.created`
- `invoice.paid`

### Payload

```json
{
  "event": "job.created",
  "timestamp": "2026-01-17T10:30:00Z",
  "data": {
    "id": "uuid",
    ...
  }
}
```
```

---

## Acceptance Criteria

- [ ] OpenAPI/Swagger spec created
- [ ] Interactive docs available at /api/docs
- [ ] All endpoints documented
- [ ] Request/response examples included
- [ ] Authentication documented
- [ ] Error codes documented
- [ ] Webhooks documented

---

## Notes for Aider

1. Check if the project uses tRPC - if so, consider trpc-panel instead
2. Document all existing routes in routers.ts
3. Include actual Zod schemas in documentation
4. Add example values for better developer experience
5. Consider generating TypeScript client from OpenAPI spec
