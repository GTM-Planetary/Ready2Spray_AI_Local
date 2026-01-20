# Aider Tasks - Ready2Spray

## Environment
- Project: Ready2Spray AI - Aerial Application Platform
- Stack: React + tRPC + Drizzle ORM + PostgreSQL

---

## Task A1: Complete Product-to-Job Linking UI

**Priority:** HIGH
**Estimated Effort:** 2-3 hours

### Problem
Product lookup feature exists but products cannot be added to jobs during job creation/editing. The UI doesn't have a product selection field.

### Files to Modify/Create
1. `client/src/components/EditJobDialog.tsx` - Add product selector
2. `client/src/pages/Jobs.tsx` - Add product selector to create form
3. `client/src/components/ProductSelector.tsx` - New component (if not using Gemini's autocomplete)
4. `server/jobsRouter.ts` - Ensure product IDs can be saved with jobs

### Database Schema Check
First, verify the jobs table has a field for products:
```sql
-- Check current schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'jobs';
```

If missing, may need migration for `productIds` (JSON array) or `products` relation.

### Implementation Steps

1. **Check existing job schema** in `drizzle/schema.ts`:
   - Look for product-related fields
   - If missing, add: `productIds: jsonb('product_ids').$type<string[]>().default([])`

2. **Create ProductSelector component** (or wait for Gemini's ProductAutocomplete):
```tsx
// client/src/components/ProductSelector.tsx
import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface ProductSelectorProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

export function ProductSelector({ value, onChange }: ProductSelectorProps) {
  const [search, setSearch] = useState('');
  const { data: products } = trpc.products.search.useQuery(
    { term: search },
    { enabled: search.length > 2 }
  );

  // Implementation...
}
```

3. **Add to EditJobDialog.tsx** (after Assignment section):
```tsx
{/* Products Section */}
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Products Applied</h3>
  <ProductSelector
    value={formData.productIds || []}
    onChange={(ids) => setFormData({ ...formData, productIds: ids })}
  />
</div>
```

4. **Update job mutation** to include product IDs

### Verification
1. Create a product via Product Lookup
2. Edit a job
3. Search and select the product
4. Save the job
5. Reopen job and verify product is still selected

---

## Task A2: Fix Products Table REI/PHI Display

**Priority:** MEDIUM
**Estimated Effort:** 30 minutes

### Problem
Products.tsx table shows dashes (-) for REI (Re-entry Interval) and PHI (Pre-harvest Interval) instead of actual values from database.

### File to Modify
`client/src/pages/Products.tsx`

### Investigation Steps

1. **Check the API response** - Add temporary logging:
```tsx
const { data: products } = trpc.products.list.useQuery();
console.log('Products data:', products);
```

2. **Check database schema** in `drizzle/schema.ts`:
   - Look for REI/PHI field names in `productsComplete` table
   - Could be: `reiHours`, `rei`, `reentryInterval`, `phiDays`, `phi`, `preharvestInterval`

3. **Check productsRouter.ts** for field mapping:
   - Verify SELECT includes REI/PHI fields
   - Check if field names match frontend expectations

### Likely Fix
Update the table column accessor in Products.tsx to match actual database field name:

```tsx
// Example fix - adjust field names as needed
<TableCell>{product.reiHours || product.rei || '-'}</TableCell>
<TableCell>{product.phiDays || product.phi || '-'}</TableCell>
```

Or update the backend to return normalized field names.

### Verification
1. Add a product with REI/PHI values (via Product Lookup)
2. Navigate to Products page
3. Verify REI and PHI columns show actual values
4. Remove debug console.log after confirming

---

## Task A3: Unify Product Database Tables

**Priority:** LOW
**Estimated Effort:** 2-4 hours

### Problem
Three separate product tables exist with different schemas:
- `products` (legacy, basic fields)
- `productsNew` (modern, EPA focus)
- `productsComplete` (comprehensive, AI extraction)

### Investigation
1. Audit usage of each table:
```bash
# Search codebase for table references
grep -r "products\." server/ --include="*.ts"
grep -r "productsNew" server/ --include="*.ts"
grep -r "productsComplete" server/ --include="*.ts"
```

2. Document which features use which table

### Migration Plan
1. Choose `productsComplete` as the canonical table
2. Create data migration script to merge legacy data
3. Update all server routes to use single table
4. Update TypeScript types
5. Remove legacy table references
6. Eventually drop unused tables

### Caution
- This is a significant change
- Requires careful testing
- Consider feature flagging during transition
- May affect production data

---

## Running Instructions

```bash
# Navigate to project
cd "C:\Users\GTM_PLANETARY_RIG 1\OneDrive\Desktop\GTM Planetary Projects\Ready2Spray_AI_Local"

# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Run tests
pnpm test

# Check database schema
pnpm drizzle-kit studio
```

---

## Completion Checklist

- [ ] A1: Verified job schema supports products
- [ ] A1: Created/integrated ProductSelector component
- [ ] A1: Added product selection to EditJobDialog
- [ ] A1: Added product selection to Jobs.tsx create form
- [ ] A1: Tested end-to-end product linking
- [ ] A2: Identified correct field names for REI/PHI
- [ ] A2: Updated Products.tsx table to display values
- [ ] A2: Verified values display correctly
- [ ] A3: Documented table usage (if starting this task)
- [ ] A3: Created migration plan (if starting this task)
