# Task: Add Database Indexes

## Priority: P0 - CRITICAL
## Estimated Complexity: Medium
## Files to Modify: `server/schema.ts` or database schema files

---

## Problem

The database schema defines tables but lacks proper indexes. This will cause severe performance issues at scale:
- Slow job queries by organization
- Slow customer lookups
- Slow calendar/scheduling queries
- Full table scans on foreign key joins

---

## Requirements

Add indexes for:
1. All foreign key columns
2. Frequently filtered columns (status, dates)
3. Columns used in ORDER BY clauses
4. Composite indexes for common query patterns

---

## Implementation

### Step 1: Identify tables needing indexes

Based on the schema, these tables need indexes:

#### Jobs Table
```typescript
// High-priority indexes
index('jobs_org_id_idx').on(jobs.orgId),
index('jobs_customer_id_idx').on(jobs.customerId),
index('jobs_status_idx').on(jobs.status),
index('jobs_scheduled_start_idx').on(jobs.scheduledStart),
index('jobs_assigned_to_idx').on(jobs.assignedTo),

// Composite indexes for common queries
index('jobs_org_status_idx').on(jobs.orgId, jobs.status),
index('jobs_org_scheduled_idx').on(jobs.orgId, jobs.scheduledStart),
```

#### Customers Table
```typescript
index('customers_org_id_idx').on(customers.orgId),
index('customers_email_idx').on(customers.email),
index('customers_name_idx').on(customers.name),
```

#### Personnel Table
```typescript
index('personnel_org_id_idx').on(personnel.orgId),
index('personnel_user_id_idx').on(personnel.userId),
index('personnel_role_idx').on(personnel.role),
```

#### Equipment Table
```typescript
index('equipment_org_id_idx').on(equipment.orgId),
index('equipment_type_idx').on(equipment.type),
index('equipment_status_idx').on(equipment.status),
```

#### Sites Table
```typescript
index('sites_org_id_idx').on(sites.orgId),
index('sites_customer_id_idx').on(sites.customerId),
```

#### Products Table
```typescript
index('products_org_id_idx').on(products.orgId),
index('products_epa_reg_idx').on(products.epaRegistrationNumber),
```

#### Audit Logs Table
```typescript
index('audit_logs_org_id_idx').on(auditLogs.orgId),
index('audit_logs_user_id_idx').on(auditLogs.userId),
index('audit_logs_created_at_idx').on(auditLogs.createdAt),
index('audit_logs_action_idx').on(auditLogs.action),

// Composite for common queries
index('audit_logs_org_created_idx').on(auditLogs.orgId, auditLogs.createdAt),
```

#### Service Plans Table
```typescript
index('service_plans_org_id_idx').on(servicePlans.orgId),
index('service_plans_customer_id_idx').on(servicePlans.customerId),
index('service_plans_status_idx').on(servicePlans.status),
```

### Step 2: Drizzle ORM syntax

If using Drizzle ORM, add indexes to the table definition:

```typescript
import { pgTable, index, varchar, timestamp, uuid } from 'drizzle-orm/pg-core';

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  customerId: uuid('customer_id').references(() => customers.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  scheduledStart: timestamp('scheduled_start'),
  assignedTo: uuid('assigned_to').references(() => personnel.id),
  // ... other columns
}, (table) => ({
  // Indexes
  orgIdIdx: index('jobs_org_id_idx').on(table.orgId),
  customerIdIdx: index('jobs_customer_id_idx').on(table.customerId),
  statusIdx: index('jobs_status_idx').on(table.status),
  scheduledStartIdx: index('jobs_scheduled_start_idx').on(table.scheduledStart),
  assignedToIdx: index('jobs_assigned_to_idx').on(table.assignedTo),

  // Composite indexes
  orgStatusIdx: index('jobs_org_status_idx').on(table.orgId, table.status),
  orgScheduledIdx: index('jobs_org_scheduled_idx').on(table.orgId, table.scheduledStart),
}));
```

### Step 3: Create migration

After adding indexes to schema, generate migration:

```bash
npm run db:generate
# or
npx drizzle-kit generate:pg
```

### Step 4: Apply migration

```bash
npm run db:push
# or
npx drizzle-kit push:pg
```

---

## Index Guidelines

### Do Index
- Foreign key columns (always)
- Columns in WHERE clauses
- Columns in ORDER BY clauses
- Columns in JOIN conditions
- Columns used for filtering (status, type, date ranges)

### Don't Over-Index
- Boolean columns with low cardinality
- Columns rarely used in queries
- Very small tables (< 1000 rows)

### Composite Index Order
Put the most selective column first:
```typescript
// GOOD: orgId is more selective than status
index('jobs_org_status_idx').on(table.orgId, table.status)

// BAD: status has fewer unique values
index('jobs_status_org_idx').on(table.status, table.orgId)
```

---

## Acceptance Criteria

- [ ] All foreign key columns have indexes
- [ ] Status columns have indexes
- [ ] Date columns used for filtering have indexes
- [ ] Composite indexes added for common query patterns
- [ ] Migration generated and applied
- [ ] No duplicate indexes

---

## Verification Query

After applying, verify indexes exist:

```sql
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## Notes for Aider

1. Find the schema file(s) - likely `server/schema.ts` or `shared/schema.ts`
2. Check if using Drizzle ORM syntax or raw SQL migrations
3. Look at existing index definitions to match the style
4. For each table, identify the orgId and other foreign keys
5. Generate a migration after making changes
6. Do NOT drop existing indexes - only add new ones
