# Task: Split Monolithic Router

## Priority: P2 - ENHANCEMENT
## Estimated Complexity: Medium
## Files to Modify: `server/routers.ts` → multiple files

---

## Overview

The main `routers.ts` file is 1622+ lines, making it difficult to:
- Navigate and understand
- Test individual routers
- Maintain and extend
- Avoid merge conflicts

---

## Requirements

1. Split into domain-specific router files
2. Maintain all existing functionality
3. Keep consistent patterns across routers
4. Export combined router from index

---

## Implementation

### Target Structure

```
server/
├── routers/
│   ├── index.ts          # Combines all routers
│   ├── auth.ts           # Authentication routes
│   ├── users.ts          # User management
│   ├── organizations.ts  # Organization management
│   ├── jobs.ts           # Job CRUD and operations
│   ├── customers.ts      # Customer management
│   ├── personnel.ts      # Team member management
│   ├── equipment.ts      # Equipment tracking
│   ├── sites.ts          # Site management
│   ├── products.ts       # Chemical products
│   ├── servicePlans.ts   # Service plans
│   ├── ai.ts             # AI assistant
│   ├── stripe.ts         # Billing/payments
│   ├── webhooks.ts       # External webhooks
│   ├── apiKeys.ts        # API key management
│   ├── audit.ts          # Audit logs
│   └── weather.ts        # Weather integration
├── trpc.ts               # tRPC initialization
└── routers.ts            # Deprecated, re-exports from routers/
```

### Step-by-Step Process

#### Step 1: Create tRPC base

```typescript
// server/trpc.ts

import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import superjson from 'superjson';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(/* auth middleware */);
export const adminProcedure = t.procedure.use(/* admin middleware */);
```

#### Step 2: Create domain routers

```typescript
// server/routers/jobs.ts

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '../db';
import { jobs } from '../schema';

export const jobsRouter = router({
  list: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      customerId: z.string().uuid().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      // Implementation
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      // Implementation
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      customerId: z.string().uuid(),
      // ... other fields
    }))
    .mutation(async ({ input, ctx }) => {
      // Implementation
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      // ... update fields
    }))
    .mutation(async ({ input, ctx }) => {
      // Implementation
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Implementation
    }),
});
```

#### Step 3: Combine routers

```typescript
// server/routers/index.ts

import { router } from '../trpc';
import { authRouter } from './auth';
import { usersRouter } from './users';
import { organizationsRouter } from './organizations';
import { jobsRouter } from './jobs';
import { customersRouter } from './customers';
import { personnelRouter } from './personnel';
import { equipmentRouter } from './equipment';
import { sitesRouter } from './sites';
import { productsRouter } from './products';
import { servicePlansRouter } from './servicePlans';
import { aiRouter } from './ai';
import { stripeRouter } from './stripe';
import { webhooksRouter } from './webhooks';
import { apiKeysRouter } from './apiKeys';
import { auditRouter } from './audit';
import { weatherRouter } from './weather';

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  organizations: organizationsRouter,
  jobs: jobsRouter,
  customers: customersRouter,
  personnel: personnelRouter,
  equipment: equipmentRouter,
  sites: sitesRouter,
  products: productsRouter,
  servicePlans: servicePlansRouter,
  ai: aiRouter,
  stripe: stripeRouter,
  webhooks: webhooksRouter,
  apiKeys: apiKeysRouter,
  audit: auditRouter,
  weather: weatherRouter,
});

export type AppRouter = typeof appRouter;
```

#### Step 4: Update imports

```typescript
// server/index.ts

import { appRouter } from './routers';
// ... rest stays the same
```

#### Step 5: Deprecate old file

```typescript
// server/routers.ts

// @deprecated - Use ./routers/index.ts instead
// This file is kept for backwards compatibility
export { appRouter } from './routers/index';
export type { AppRouter } from './routers/index';
```

---

## Migration Strategy

1. Create new folder structure
2. Move one router at a time, starting with smallest
3. Test after each move
4. Update imports progressively
5. Remove old code only after all routers moved

---

## Acceptance Criteria

- [ ] All routers split into separate files
- [ ] No functionality lost
- [ ] All tests pass
- [ ] Client still works with API
- [ ] Each router file < 300 lines
- [ ] Consistent patterns across routers

---

## Notes for Aider

1. Start by reading the full `routers.ts` to understand structure
2. Identify natural groupings of procedures
3. Move shared utilities to a `utils/` folder
4. Keep middleware definitions in `trpc.ts`
5. Test incrementally - don't try to move everything at once
