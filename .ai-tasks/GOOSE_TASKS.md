# Goose Tasks - Ready2Spray

## Environment
- Model: GPT-OSS-120b
- Project: Ready2Spray AI - Aerial Application Platform

---

## Task G1: Fix Job Form Layout Inconsistencies

**Priority:** HIGH
**Estimated Effort:** 30 minutes

### Problem
Job creation and edit forms have inconsistent spacing between fields. Some fields have `space-y-2` wrappers, others don't.

### Files to Modify
1. `client/src/components/EditJobDialog.tsx`
2. `client/src/pages/Jobs.tsx`

### Specific Changes

#### EditJobDialog.tsx

**Line 110-116** - Add space-y-2 to title field:
```tsx
// Change from:
<div>
  <Label htmlFor="title">Job Title *</Label>
  <Input
    id="title"
    value={formData.title}
    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    placeholder="Enter job title"
    required
  />
</div>

// Change to:
<div className="space-y-2">
  <Label htmlFor="title">Job Title *</Label>
  <Input
    id="title"
    value={formData.title}
    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    placeholder="Enter job title"
    required
  />
</div>
```

**Lines 121-172** - Add space-y-2 to all Select field containers:
Look for patterns like:
```tsx
<div>
  <Label htmlFor="jobType">Job Type</Label>
  <Select ...>
```

Change each to:
```tsx
<div className="space-y-2">
  <Label htmlFor="jobType">Job Type</Label>
  <Select ...>
```

**Fields to check:**
- Job Type select
- Priority select
- Status select
- Personnel select
- Equipment select
- Scheduled Start input
- Scheduled End input

### Verification
1. Run `pnpm dev`
2. Navigate to Jobs page
3. Click "Add Job" or edit an existing job
4. Visually verify all fields have consistent 8px gap between label and input
5. Compare EditJobDialog and Jobs.tsx creation form - they should match

---

## Task G2: Clean Up Debug Console Logs

**Priority:** MEDIUM
**Estimated Effort:** 15 minutes

### Problem
AgrianProductLookup.tsx has multiple console.log statements left from development debugging.

### File to Modify
`client/src/components/AgrianProductLookup.tsx`

### Action
1. Open the file
2. Search for `console.log`
3. Remove debug/informational logs
4. Keep error logs (console.error) that help with troubleshooting
5. Consider converting important state changes to proper error handling with toast notifications

### Example Changes

```tsx
// REMOVE - Debug logs
console.log("Search results:", results);
console.log("Product detail:", detail);
console.log("State changed:", state);

// KEEP - Error handling
console.error("Failed to fetch product:", error);
```

### Verification
1. Run `pnpm dev`
2. Open browser DevTools console
3. Navigate to Product Lookup page
4. Search for a product
5. Verify no unnecessary logs appear in console

---

## Running Instructions

```bash
# Navigate to project
cd "C:\Users\GTM_PLANETARY_RIG 1\OneDrive\Desktop\GTM Planetary Projects\Ready2Spray_AI_Local"

# Install dependencies (if needed)
pnpm install

# Run dev server
pnpm dev

# Server starts at http://localhost:5173
# Use "Dev Sign In" to authenticate
```

---

## Completion Checklist

- [ ] G1: EditJobDialog.tsx - Added space-y-2 to all field containers
- [ ] G1: Jobs.tsx - Verified consistency with EditJobDialog
- [ ] G1: Visual test passed - forms look consistent
- [ ] G2: Removed debug console.log statements
- [ ] G2: Kept necessary error logging
- [ ] G2: No console spam during normal use
