# Ready2Spray AI - Multi-Agent Action Plan

Generated: 2026-01-19

## Summary

This document outlines the immediate tasks for our multi-agent development team (Goose/GPT-OSS-120b, Aider, Gemini) to fix critical issues discovered during local development testing.

---

## CRITICAL FIXES COMPLETED (Claude)

The following issues were fixed before creating this action plan:

1. **Sidebar Navigation Buttons Missing** - Fixed
   - Root cause: Synthetic dev user had `user_role` (snake_case) but `usePermissions` expects `userRole` (camelCase)
   - File: `server/_core/sdk.ts` line 285
   - Fix: Changed `user_role: "owner"` to `userRole: "owner"`

2. **Redirect to /signup/organization** - Fixed
   - Root cause: `getSubscriptionStatus` was querying database for org before checking owner bypass
   - File: `server/stripeRouter.ts` line 276-290
   - Fix: Added dev mode bypass at start of function to return mock subscription status

---

## GOOSE TASKS (GPT-OSS-120b)

### Task G1: Fix Job Form Layout Inconsistencies (Priority: HIGH)

**Files to modify:**
- `client/src/components/EditJobDialog.tsx`
- `client/src/pages/Jobs.tsx`

**Issues to fix:**

1. Add `space-y-2` wrapper to title field (EditJobDialog.tsx line 110-116):
```tsx
// Current
<div>
  <Label htmlFor="title">Job Title *</Label>
  <Input ... />
</div>

// Should be
<div className="space-y-2">
  <Label htmlFor="title">Job Title *</Label>
  <Input ... />
</div>
```

2. Add `space-y-2` wrapper to all individual field divs in EditJobDialog.tsx that are missing it (lines 121-172)

3. Ensure LocationPicker wrapper has consistent spacing

4. Verify all Select components have consistent label spacing matching Jobs.tsx pattern

**Acceptance criteria:**
- All form fields have consistent vertical spacing
- EditJobDialog and Jobs.tsx forms should look identical
- No visual jumps or inconsistent gaps between fields

---

### Task G2: Clean Up Debug Console Logs (Priority: MEDIUM)

**Files to modify:**
- `client/src/components/AgrianProductLookup.tsx`

**Issue:**
Multiple `console.log` statements left in production code for debugging.

**Action:**
- Review file and remove unnecessary console.log statements
- Keep error logging but remove debug logs
- Add proper error boundary or toast notifications for user-facing errors

---

## AIDER TASKS

### Task A1: Complete Product-to-Job Linking UI (Priority: HIGH)

**Problem:**
Product lookup exists but is not integrated into job creation/editing forms. Users cannot easily add products to jobs.

**Files to modify:**
- `client/src/components/EditJobDialog.tsx`
- `client/src/pages/Jobs.tsx`
- `server/jobsRouter.ts` (if schema updates needed)

**Implementation steps:**

1. Add a product selector field to EditJobDialog.tsx:
```tsx
<div className="space-y-2">
  <Label>Products Applied</Label>
  <ProductSelector
    selectedProducts={selectedProducts}
    onSelect={handleProductSelect}
  />
</div>
```

2. Create reusable `ProductSelector` component with:
   - Search/autocomplete functionality
   - Multi-select support
   - Display of signal word badges
   - Quick "Add New Product" button

3. Connect to existing `products.search` tRPC endpoint

4. Ensure product IDs are saved with job data

**Acceptance criteria:**
- Users can search and select products when creating/editing jobs
- Selected products display with signal word color coding
- Products are persisted with job records

---

### Task A2: Fix Products Table REI/PHI Display (Priority: MEDIUM)

**Problem:**
Products.tsx table shows dashes (-) for REI and PHI instead of actual values.

**File:** `client/src/pages/Products.tsx`

**Investigation needed:**
1. Check if data is coming from backend (add console.log temporarily)
2. Verify field names match between database schema and frontend
3. Check for type mismatches (string vs number)

**Likely fix:**
Ensure the table cell accessor matches the actual database column name:
- `reiHours` vs `rei` vs `reentryInterval`
- `phiDays` vs `phi` vs `preharvestInterval`

---

### Task A3: Unify Product Database Tables (Priority: LOW)

**Problem:**
Three separate product tables exist with inconsistent field names:
- `products` (legacy)
- `productsNew` (modern)
- `productsComplete` (comprehensive)

**Action:**
1. Audit which tables are actively used
2. Create migration plan to consolidate to `productsComplete`
3. Update all references in code to use unified table
4. Keep backward compatibility during transition

---

## GEMINI TASKS

### Task M1: Add Product Autocomplete Component (Priority: HIGH)

**Problem:**
No quick way to search/select products when adding to jobs.

**Create new file:** `client/src/components/ProductAutocomplete.tsx`

**Requirements:**
- Debounced search input
- Results dropdown with product name, EPA#, signal word badge
- Keyboard navigation support
- Uses existing `products.search` endpoint
- Supports single and multi-select modes

**Example interface:**
```tsx
interface ProductAutocompleteProps {
  value: string | string[];
  onChange: (productId: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
}
```

---

### Task M2: Make LocationPicker Map Height Responsive (Priority: LOW)

**File:** `client/src/components/LocationPicker.tsx`

**Current:**
```tsx
<MapView className="w-full h-[400px] rounded-lg" ... />
```

**Change to:**
```tsx
<MapView className="w-full h-[250px] sm:h-[300px] md:h-[400px] rounded-lg" ... />
```

This improves form UX on mobile devices.

---

### Task M3: Add EPA Number Validation (Priority: MEDIUM)

**Files to modify:**
- `shared/validation.ts` (create if not exists)
- `server/productsRouter.ts`
- Product form components

**Implementation:**
1. Create EPA registration number format validator:
```typescript
// EPA format: XXXXX-XXX or XXXXX-XXX-XXXXX
export function isValidEpaNumber(num: string): boolean {
  return /^\d{1,5}-\d{1,4}(-\d{1,5})?$/.test(num);
}
```

2. Add validation to product creation/update
3. Add visual feedback in UI for invalid numbers

---

## SHARED/COLLABORATIVE TASKS

### Task S1: End-to-End Testing of Auth Flow

After all dev auth fixes, test the complete flow:
1. Clear cookies
2. Navigate to /dashboard
3. Click "Dev Sign In"
4. Verify redirect to dashboard
5. Verify sidebar shows all navigation items
6. Verify no redirect to /signup/organization
7. Test navigation to each menu item

### Task S2: Product Integration Test

Test the complete product workflow:
1. Navigate to Product Lookup
2. Search for a product via Agrian
3. Save product to library
4. Create a new job
5. Select the saved product
6. Verify product appears in job details

---

## PRIORITY ORDER

1. **G1** - Job form layouts (immediate visual fix)
2. **A1** - Product-to-job linking (core functionality gap)
3. **M1** - Product autocomplete (enables A1)
4. **A2** - REI/PHI display fix (data visibility)
5. **G2** - Console log cleanup (code quality)
6. **M3** - EPA validation (data integrity)
7. **M2** - Responsive map (mobile UX)
8. **A3** - Database unification (technical debt)

---

## FILE REFERENCE

Key files mentioned in this action plan:

```
client/src/
├── components/
│   ├── EditJobDialog.tsx        # G1: Form layout fixes
│   ├── AgrianProductLookup.tsx  # G2: Debug cleanup
│   ├── LocationPicker.tsx       # M2: Responsive height
│   └── ProductAutocomplete.tsx  # M1: New component
├── pages/
│   ├── Jobs.tsx                 # G1, A1: Form + product selector
│   ├── Products.tsx             # A2: REI/PHI display
│   └── ProductLookup.tsx        # Reference for product flow
server/
├── _core/
│   ├── sdk.ts                   # FIXED: userRole property
├── stripeRouter.ts              # FIXED: Dev mode bypass
├── productsRouter.ts            # A1, M3: Product routes
└── jobsRouter.ts                # A1: Job-product linking
shared/
└── validation.ts                # M3: EPA validation (create)
```

---

## AGENT ASSIGNMENT SUMMARY

| Agent  | Tasks | Focus Area |
|--------|-------|------------|
| Goose  | G1, G2 | UI/Layout fixes, code cleanup |
| Aider  | A1, A2, A3 | Backend integration, database |
| Gemini | M1, M2, M3 | New components, validation |

---

## NOTES

- Use `pnpm dev` to run the development server
- Dev auth is now working - use "Dev Sign In" button
- Test changes in browser at http://localhost:5173
- Server runs on port 3333, Vite proxy forwards API calls
