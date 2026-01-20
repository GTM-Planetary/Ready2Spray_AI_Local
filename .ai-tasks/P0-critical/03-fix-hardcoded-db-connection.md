# Task: Fix Hardcoded Database Connection

## Priority: P0 - CRITICAL
## Estimated Complexity: Low
## Files to Modify: `server/db.ts`

---

## Problem

The database connection string in `server/db.ts` has hardcoded values for the Supabase host and project ID:

```typescript
const supabaseUrl = supabasePassword
  ? `postgresql://postgres.yqimcvatzaldidmqmvtr:${encodeURIComponent(supabasePassword)}@aws-1-us-west-1.pooler.supabase.com:5432/postgres`
  : null;
```

This is a security issue and makes it impossible to use different databases for different environments (dev, staging, production).

---

## Requirements

1. Remove all hardcoded database connection details
2. Use environment variables for the full connection string
3. Support both direct DATABASE_URL and component-based configuration
4. Add validation for required database configuration

---

## Implementation

### Current Code (lines ~12-15 in server/db.ts)

```typescript
// BAD - hardcoded values
const supabasePassword = process.env.R2S_Supabase;
const supabaseUrl = supabasePassword
  ? `postgresql://postgres.yqimcvatzaldidmqmvtr:${encodeURIComponent(supabasePassword)}@aws-1-us-west-1.pooler.supabase.com:5432/postgres`
  : null;
```

### New Code

```typescript
// GOOD - fully configurable
function getDatabaseUrl(): string {
  // Prefer explicit DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

  if (databaseUrl) {
    return databaseUrl;
  }

  // Fallback to component-based construction (legacy support)
  const password = process.env.R2S_Supabase;
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || '5432';
  const database = process.env.DB_NAME || 'postgres';
  const user = process.env.DB_USER || 'postgres';

  if (password && host) {
    return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }

  throw new Error(
    'Database configuration missing. Set DATABASE_URL or SUPABASE_DATABASE_URL environment variable.'
  );
}

const connectionString = getDatabaseUrl();
```

---

## Acceptance Criteria

- [ ] No hardcoded hostnames, project IDs, or credentials in code
- [ ] DATABASE_URL environment variable is primary configuration method
- [ ] Clear error message if database not configured
- [ ] Existing R2S_Supabase variable still works as fallback (with other components)

---

## Notes for Aider

1. Read the full `server/db.ts` file first
2. Identify all places where database connection is configured
3. Replace hardcoded strings with environment variable references
4. Ensure the drizzle client initialization still works after changes
5. Test that the connection logic handles missing variables gracefully
