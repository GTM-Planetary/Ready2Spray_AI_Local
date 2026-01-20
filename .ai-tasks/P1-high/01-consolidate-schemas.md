# Task: Consolidate Duplicate Schemas

## Priority: P1 - HIGH
## Estimated Complexity: High
## Files to Modify: `server/schema.ts`, related migration files

---

## Problem

The codebase has multiple duplicate/conflicting table definitions:

### Jobs Tables
- `jobs` - Main table with comprehensive fields
- `jobsV2` - Simplified version

### Products Tables
- `products` - Legacy table
- `productsNew` - Updated version
- `productsComplete` - Most comprehensive version

This creates:
- Data integrity issues
- Confusion about which table to use
- Duplicate data storage
- Inconsistent API responses

---

## Requirements

1. Audit all duplicate table definitions
2. Determine the "source of truth" for each entity
3. Create migration to consolidate data
4. Update all queries to use consolidated tables
5. Deprecate/remove unused tables

---

## Implementation Plan

### Step 1: Audit current schema

List all table definitions and their usage:

```bash
# Find all table definitions
grep -r "pgTable\|createTable" server/schema.ts

# Find all table references in queries
grep -r "from(jobs" server/
grep -r "from(products" server/
```

### Step 2: Create consolidated Jobs table

Compare `jobs` and `jobsV2`, merge into single comprehensive table:

```typescript
export const jobs = pgTable('jobs', {
  // Primary
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),

  // Basic info
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  jobType: varchar('job_type', { length: 50 }),

  // Customer & Site
  customerId: uuid('customer_id').references(() => customers.id),
  siteId: uuid('site_id').references(() => sites.id),

  // Scheduling
  scheduledStart: timestamp('scheduled_start'),
  scheduledEnd: timestamp('scheduled_end'),
  actualStart: timestamp('actual_start'),
  actualEnd: timestamp('actual_end'),

  // Assignment
  assignedTo: uuid('assigned_to').references(() => personnel.id),
  equipmentId: uuid('equipment_id').references(() => equipment.id),

  // Status & Priority
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  priority: varchar('priority', { length: 20 }).default('normal'),

  // Application details
  acreage: decimal('acreage', { precision: 10, scale: 2 }),
  applicationRate: decimal('application_rate', { precision: 10, scale: 4 }),
  totalVolume: decimal('total_volume', { precision: 10, scale: 2 }),

  // Weather conditions
  windSpeed: decimal('wind_speed', { precision: 5, scale: 2 }),
  windDirection: varchar('wind_direction', { length: 10 }),
  temperature: decimal('temperature', { precision: 5, scale: 2 }),
  humidity: decimal('humidity', { precision: 5, scale: 2 }),

  // Compliance
  applicatorLicense: varchar('applicator_license', { length: 50 }),
  supervisionRequired: boolean('supervision_required').default(false),

  // Billing
  estimatedCost: decimal('estimated_cost', { precision: 10, scale: 2 }),
  actualCost: decimal('actual_cost', { precision: 10, scale: 2 }),
  invoiced: boolean('invoiced').default(false),

  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
});
```

### Step 3: Create consolidated Products table

Merge `products`, `productsNew`, and `productsComplete`:

```typescript
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),

  // Basic info
  name: varchar('name', { length: 255 }).notNull(),
  manufacturer: varchar('manufacturer', { length: 255 }),
  description: text('description'),

  // EPA Registration
  epaRegistrationNumber: varchar('epa_registration_number', { length: 50 }),
  epaEstablishmentNumber: varchar('epa_establishment_number', { length: 50 }),

  // Classification
  productType: varchar('product_type', { length: 50 }), // herbicide, insecticide, fungicide, etc.
  signalWord: varchar('signal_word', { length: 20 }), // DANGER, WARNING, CAUTION

  // Active ingredients (JSON array)
  activeIngredients: jsonb('active_ingredients'),

  // Application
  applicationMethods: jsonb('application_methods'),
  targetPests: jsonb('target_pests'),
  targetCrops: jsonb('target_crops'),

  // Rates
  minRate: decimal('min_rate', { precision: 10, scale: 4 }),
  maxRate: decimal('max_rate', { precision: 10, scale: 4 }),
  rateUnit: varchar('rate_unit', { length: 20 }),

  // Safety intervals
  rei: integer('rei'), // Restricted Entry Interval (hours)
  phi: integer('phi'), // Pre-Harvest Interval (days)

  // Storage
  storageRequirements: text('storage_requirements'),
  shelfLife: integer('shelf_life'), // months

  // Inventory
  currentStock: decimal('current_stock', { precision: 10, scale: 2 }),
  stockUnit: varchar('stock_unit', { length: 20 }),
  reorderPoint: decimal('reorder_point', { precision: 10, scale: 2 }),

  // Cost
  unitCost: decimal('unit_cost', { precision: 10, scale: 2 }),

  // Status
  isActive: boolean('is_active').default(true),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Step 4: Create data migration

```typescript
// Migration script to consolidate data

// 1. Migrate jobsV2 data to jobs (if any missing)
await db.execute(`
  INSERT INTO jobs (id, org_id, title, status, ...)
  SELECT id, org_id, title, status, ...
  FROM jobs_v2
  WHERE id NOT IN (SELECT id FROM jobs)
`);

// 2. Migrate products data
await db.execute(`
  INSERT INTO products (id, org_id, name, ...)
  SELECT id, org_id, name, ...
  FROM products_complete
  ON CONFLICT (id) DO NOTHING
`);

// 3. Drop legacy tables (after verification)
// await db.execute('DROP TABLE IF EXISTS jobs_v2');
// await db.execute('DROP TABLE IF EXISTS products_new');
// await db.execute('DROP TABLE IF EXISTS products_complete');
```

### Step 5: Update all queries

Find and update all references:

```bash
# Find all jobsV2 references
grep -rn "jobsV2" server/

# Find all productsNew references
grep -rn "productsNew\|productsComplete" server/
```

---

## Acceptance Criteria

- [ ] Single authoritative `jobs` table
- [ ] Single authoritative `products` table
- [ ] All data migrated from legacy tables
- [ ] All queries updated to use consolidated tables
- [ ] Legacy tables marked for deprecation
- [ ] No data loss during migration

---

## Migration Safety

1. **Backup first**: Always backup before schema changes
2. **Test in staging**: Run migration on staging environment first
3. **Keep legacy tables**: Don't drop until verified
4. **Rollback plan**: Keep migration reversible

---

## Notes for Aider

1. Read the full `server/schema.ts` to understand all table definitions
2. Search for all usages of each table variant
3. Create the migration incrementally - don't try to do everything at once
4. Preserve all data during consolidation
5. This is a high-risk task - be careful with destructive operations
