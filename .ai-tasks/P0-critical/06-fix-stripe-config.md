# Task: Fix Stripe Configuration

## Priority: P0 - CRITICAL
## Estimated Complexity: Medium
## Files to Modify: `server/stripe.ts`, related router files
## Files to Reference: `todo.md`

---

## Problem

From the project's `todo.md`:
> Fix Stripe API key validation error - "Invalid prod secret key: must start with 'sk_live_'"

The Stripe integration is broken, preventing payment processing and new customer signups.

---

## Likely Causes

1. **Test key used in production mode** - Using `sk_test_` key when code expects `sk_live_`
2. **Environment variable not set** - `STRIPE_SECRET_KEY` is empty or undefined
3. **Key validation too strict** - Code may reject test keys during development
4. **Webhook secret mismatch** - Webhook verification failing

---

## Requirements

1. Allow both test and live Stripe keys based on environment
2. Add proper validation with helpful error messages
3. Ensure webhook secret is properly configured
4. Add environment-aware Stripe initialization

---

## Implementation

### Step 1: Find and review current Stripe initialization

Look for `stripe.ts` or Stripe initialization in the server code.

### Step 2: Update Stripe configuration

```typescript
// server/stripe.ts

import Stripe from 'stripe';

function getStripeConfig(): { secretKey: string; isTestMode: boolean } {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY environment variable is required. ' +
      'Get your key from https://dashboard.stripe.com/apikeys'
    );
  }

  const isTestMode = secretKey.startsWith('sk_test_');
  const isLiveMode = secretKey.startsWith('sk_live_');

  if (!isTestMode && !isLiveMode) {
    throw new Error(
      'Invalid STRIPE_SECRET_KEY format. ' +
      'Key must start with "sk_test_" (test mode) or "sk_live_" (production).'
    );
  }

  // Warn if using test keys in production
  if (process.env.NODE_ENV === 'production' && isTestMode) {
    console.warn(
      '⚠️  WARNING: Using Stripe test key in production environment. ' +
      'Set STRIPE_SECRET_KEY to a live key (sk_live_) for real payments.'
    );
  }

  return { secretKey, isTestMode };
}

const { secretKey, isTestMode } = getStripeConfig();

export const stripe = new Stripe(secretKey, {
  apiVersion: '2023-10-16', // or latest version
  typescript: true,
});

export const isStripeTestMode = isTestMode;

// Webhook secret validation
export function getWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET environment variable is required for webhook verification. ' +
      'Get it from https://dashboard.stripe.com/webhooks'
    );
  }

  return webhookSecret;
}
```

### Step 3: Update webhook handler

```typescript
// In webhook route handler

import { getWebhookSecret } from './stripe';

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      getWebhookSecret()
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event...
});
```

### Step 4: Add publishable key endpoint (for frontend)

```typescript
// Add to router

getStripeConfig: publicProcedure.query(() => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('STRIPE_PUBLISHABLE_KEY not configured');
  }

  return {
    publishableKey,
    isTestMode: publishableKey.startsWith('pk_test_'),
  };
}),
```

---

## Acceptance Criteria

- [ ] Both `sk_test_` and `sk_live_` keys are accepted
- [ ] Clear error messages for missing/invalid keys
- [ ] Warning logged when using test keys in production
- [ ] Webhook secret properly validated
- [ ] Frontend can retrieve publishable key
- [ ] Tests pass with test keys

---

## Testing

1. Set `STRIPE_SECRET_KEY=sk_test_xxxxx` - should work
2. Set `STRIPE_SECRET_KEY=sk_live_xxxxx` - should work
3. Set `STRIPE_SECRET_KEY=invalid` - should error with helpful message
4. Unset `STRIPE_SECRET_KEY` - should error with helpful message

---

## Notes for Aider

1. Search for all files containing "stripe" to find initialization points
2. Check `server/stripe.ts` and any router files using Stripe
3. Look at `stripe.test.ts` and `stripe.validation.test.ts` for expected behavior
4. Ensure changes don't break existing tests
