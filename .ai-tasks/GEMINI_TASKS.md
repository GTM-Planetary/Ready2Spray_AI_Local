# Gemini Tasks - Ready2Spray

## Environment
- Project: Ready2Spray AI - Aerial Application Platform
- Stack: React 19 + TypeScript + Tailwind CSS + shadcn/ui

---

## Task M1: Create Product Autocomplete Component

**Priority:** HIGH
**Estimated Effort:** 1-2 hours

### Problem
No quick way to search and select products when adding them to jobs. Need a reusable autocomplete component.

### Create New File
`client/src/components/ProductAutocomplete.tsx`

### Requirements
- Debounced search (300ms) to avoid excessive API calls
- Dropdown results showing: product name, EPA#, signal word badge
- Keyboard navigation (arrow keys, enter to select, escape to close)
- Support single and multi-select modes
- Loading state indicator
- Empty state message
- Uses existing `products.search` tRPC endpoint

### Implementation

```tsx
// client/src/components/ProductAutocomplete.tsx
import { useState, useRef, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { trpc } from '@/utils/trpc';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  epaRegNumber?: string;
  signalWord?: string;
}

interface ProductAutocompleteProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const signalWordColors: Record<string, string> = {
  DANGER: 'bg-red-500 text-white',
  WARNING: 'bg-yellow-500 text-black',
  CAUTION: 'bg-blue-500 text-white',
};

export function ProductAutocomplete({
  value,
  onChange,
  multiple = false,
  placeholder = 'Search products...',
  disabled = false,
}: ProductAutocompleteProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data: results, isLoading } = trpc.products.search.useQuery(
    { term: debouncedSearch },
    { enabled: debouncedSearch.length >= 2 }
  );

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !results?.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (product: Product) => {
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      if (currentValue.includes(product.id)) {
        onChange(currentValue.filter((id) => id !== product.id));
      } else {
        onChange([...currentValue, product.id]);
      }
    } else {
      onChange(product.id);
      setIsOpen(false);
      setSearch(product.name);
    }
  };

  const isSelected = (productId: string) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(productId);
    }
    return value === productId;
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(0);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />

      {isOpen && (search.length >= 2 || results?.length) && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Searching...
            </li>
          )}

          {!isLoading && results?.length === 0 && search.length >= 2 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              No products found
            </li>
          )}

          {results?.map((product, index) => (
            <li
              key={product.id}
              className={cn(
                'px-3 py-2 cursor-pointer flex items-center justify-between',
                index === highlightedIndex && 'bg-accent',
                isSelected(product.id) && 'bg-primary/10'
              )}
              onClick={() => handleSelect(product)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex flex-col">
                <span className="font-medium">{product.name}</span>
                {product.epaRegNumber && (
                  <span className="text-xs text-muted-foreground">
                    EPA# {product.epaRegNumber}
                  </span>
                )}
              </div>
              {product.signalWord && (
                <Badge
                  className={cn(
                    'text-xs',
                    signalWordColors[product.signalWord] || 'bg-gray-500'
                  )}
                >
                  {product.signalWord}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Selected items for multi-select */}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {/* Would need to fetch selected product names - simplified for now */}
          {value.map((id) => (
            <Badge key={id} variant="secondary" className="cursor-pointer">
              {id}
              <button
                onClick={() => onChange(value.filter((v) => v !== id))}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Check if useDebounce hook exists
If not, create `client/src/hooks/useDebounce.ts`:
```tsx
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### Verification
1. Import component in EditJobDialog or a test page
2. Verify search works after typing 2+ characters
3. Verify keyboard navigation (up/down/enter/escape)
4. Verify selection callback fires correctly
5. Test multi-select mode if enabled

---

## Task M2: Make LocationPicker Map Height Responsive

**Priority:** LOW
**Estimated Effort:** 10 minutes

### Problem
Map in LocationPicker has fixed 400px height which may be too tall on mobile devices.

### File to Modify
`client/src/components/LocationPicker.tsx`

### Change
Find the MapView component (around line 165) and update the className:

```tsx
// Current
<MapView
  className="w-full h-[400px] rounded-lg"
  ...
/>

// Change to
<MapView
  className="w-full h-[250px] sm:h-[300px] md:h-[400px] rounded-lg"
  ...
/>
```

This provides:
- 250px on mobile (< 640px)
- 300px on small tablets (640px - 768px)
- 400px on desktop (768px+)

### Verification
1. Open browser DevTools
2. Toggle device toolbar (mobile view)
3. Navigate to a form with LocationPicker
4. Verify map height adjusts at different breakpoints

---

## Task M3: Add EPA Number Validation

**Priority:** MEDIUM
**Estimated Effort:** 45 minutes

### Problem
No validation for EPA registration number format. Invalid numbers can be saved.

### Files to Create/Modify
1. `shared/validation.ts` - Create validation utility
2. `client/src/pages/ProductLookup.tsx` - Add frontend validation
3. `server/productsRouter.ts` - Add backend validation

### EPA Number Formats
Valid formats:
- `XXXXX-XX` (e.g., 12345-67)
- `XXXXX-XXX` (e.g., 12345-678)
- `XXXXX-XXX-XXXXX` (e.g., 12345-678-90123, includes supplemental distributor)

### Implementation

**Step 1: Create shared validation utility**
```typescript
// shared/validation.ts

/**
 * Validates EPA Registration Number format
 * Valid formats:
 * - Primary: XXXXX-XXX (5 digits, dash, 2-4 digits)
 * - With supplemental: XXXXX-XXX-XXXXX (adds dash and up to 5 digits)
 */
export function isValidEpaNumber(num: string | null | undefined): boolean {
  if (!num) return false;

  // Remove any whitespace
  const cleaned = num.trim();

  // Regex: 1-5 digits, dash, 1-4 digits, optionally followed by dash and 1-5 digits
  const epaPattern = /^\d{1,5}-\d{1,4}(-\d{1,5})?$/;

  return epaPattern.test(cleaned);
}

/**
 * Formats EPA number with consistent dashes
 */
export function formatEpaNumber(num: string): string {
  // Remove all non-digits
  const digits = num.replace(/\D/g, '');

  if (digits.length <= 5) {
    return digits;
  } else if (digits.length <= 9) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  } else {
    return `${digits.slice(0, 5)}-${digits.slice(5, 9)}-${digits.slice(9, 14)}`;
  }
}
```

**Step 2: Add validation to ProductLookup.tsx**
```tsx
import { isValidEpaNumber } from '@shared/validation';

// In form validation
const validateForm = () => {
  if (formData.epaRegNumber && !isValidEpaNumber(formData.epaRegNumber)) {
    setError('Invalid EPA Registration Number format. Expected: XXXXX-XXX');
    return false;
  }
  return true;
};

// Add visual feedback
<div className="space-y-2">
  <Label>EPA Registration Number</Label>
  <Input
    value={formData.epaRegNumber}
    onChange={(e) => setFormData({ ...formData, epaRegNumber: e.target.value })}
    className={!isValidEpaNumber(formData.epaRegNumber) && formData.epaRegNumber ? 'border-red-500' : ''}
  />
  {formData.epaRegNumber && !isValidEpaNumber(formData.epaRegNumber) && (
    <p className="text-sm text-red-500">
      Invalid format. Expected: XXXXX-XXX or XXXXX-XXX-XXXXX
    </p>
  )}
</div>
```

**Step 3: Add backend validation in productsRouter.ts**
```typescript
import { isValidEpaNumber } from '@shared/validation';
import { z } from 'zod';

// In the create mutation input schema
create: protectedProcedure
  .input(z.object({
    name: z.string().min(1),
    epaRegNumber: z.string()
      .optional()
      .refine(
        (val) => !val || isValidEpaNumber(val),
        { message: 'Invalid EPA Registration Number format' }
      ),
    // ... other fields
  }))
  .mutation(async ({ ctx, input }) => {
    // ...
  }),
```

### Verification
1. Try to save a product with invalid EPA number (e.g., "abc123")
2. Verify error message appears
3. Try with valid number (e.g., "12345-67")
4. Verify it saves successfully
5. Test edge cases: empty, null, formats with/without supplemental

---

## Running Instructions

```bash
# Navigate to project
cd "C:\Users\GTM_PLANETARY_RIG 1\OneDrive\Desktop\GTM Planetary Projects\Ready2Spray_AI_Local"

# Install dependencies
pnpm install

# Run dev server
pnpm dev

# TypeScript check
pnpm typecheck

# Run tests
pnpm test
```

---

## Completion Checklist

- [ ] M1: Created ProductAutocomplete.tsx component
- [ ] M1: Added useDebounce hook (if needed)
- [ ] M1: Verified search functionality works
- [ ] M1: Verified keyboard navigation works
- [ ] M1: Tested single and multi-select modes
- [ ] M2: Updated LocationPicker map height to be responsive
- [ ] M2: Tested on mobile viewport sizes
- [ ] M3: Created shared/validation.ts with EPA validation
- [ ] M3: Added frontend validation to ProductLookup
- [ ] M3: Added backend validation to productsRouter
- [ ] M3: Tested with valid and invalid EPA numbers
