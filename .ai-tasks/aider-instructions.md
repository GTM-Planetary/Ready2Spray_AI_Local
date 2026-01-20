# Aider Instructions - P0-06: Fix Stripe Configuration

## CRITICAL RULES
1. Actually EDIT files - do not just describe changes
2. Read the task file first, then make the changes
3. After completing, the task is done

## Current Task: P0-06 - Fix Stripe Configuration

Read the task file: `.ai-tasks/P0-critical/06-fix-stripe-config.md`

The issue: Stripe webhook secret may not be properly validated.

Files to check and fix:
- `server/stripeRouter.ts` - Main Stripe integration
- Look for webhook signature verification
- Ensure `STRIPE_WEBHOOK_SECRET` environment variable is used

Common fix pattern:
```typescript
// Verify webhook signature
const sig = req.headers['stripe-signature'];
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET not configured');
}

const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
```

## After This Task
Continue with:
- P0-07: Configure Mailgun (`.ai-tasks/P0-critical/07-configure-mailgun.md`)
- P0-08: Fix mobile auth loop (`.ai-tasks/P0-critical/08-fix-mobile-auth-loop.md`)
- P0-09: Add database indexes (`.ai-tasks/P0-critical/09-add-database-indexes.md`)
