/**
 * Stripe Integration Helper Functions
 * 
 * This file contains all Stripe-related operations for subscription management.
 * Following best practices: store only Stripe IDs, fetch everything else from Stripe API.
 */

import Stripe from 'stripe';
import { SUBSCRIPTION_TIERS, OWNER_EMAIL } from './products';

/**
 * Validate and configure Stripe API key
 */
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
  apiVersion: '2025-11-17.clover',
});

export const isStripeTestMode = isTestMode;

/**
 * Create a Stripe customer for a new organization
 */
export async function createStripeCustomer(params: {
  email: string;
  name: string;
  organizationId: number;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      organizationId: params.organizationId.toString(),
      ...params.metadata,
    },
  });

  return customer;
}

/**
 * Create a checkout session for subscription signup
 */
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  trialDays?: number;
  couponCode?: string;
}): Promise<Stripe.Checkout.Session> {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: params.customerId,
    mode: 'subscription',
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    allow_promotion_codes: true,
  };

  // Add trial period if specified
  if (params.trialDays) {
    sessionParams.subscription_data = {
      trial_period_days: params.trialDays,
    };
  }

  // Add coupon if specified
  if (params.couponCode) {
    sessionParams.discounts = [
      {
        coupon: params.couponCode,
      },
    ];
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return session;
}

/**
 * Create a checkout session for AI credit add-ons (one-time purchase)
 */
export async function createCreditCheckoutSession(params: {
  customerId: string;
  priceId: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'payment',
    line_items: [
      {
        price: params.priceId,
        quantity: params.quantity,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Get subscription details from Stripe
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('[Stripe] Error retrieving subscription:', error);
    return null;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    // Cancel at period end
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

/**
 * Update subscription to a new plan
 */
export async function updateSubscription(params: {
  subscriptionId: string;
  newPriceId: string;
}): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(params.subscriptionId);
  
  return await stripe.subscriptions.update(params.subscriptionId, {
    items: [
      {
        id: subscription.items.data[0]?.id,
        price: params.newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

/**
 * Get customer portal session for managing subscription
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return session;
}

/**
 * Check if user is owner and should bypass payment
 */
export function isOwnerBypass(email: string): boolean {
  return email.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

/**
 * Get AI credits for a subscription plan
 */
export function getCreditsForPlan(planId: string): number {
  const tier = Object.values(SUBSCRIPTION_TIERS).find(t => t.id === planId);
  return tier?.aiCreditsPerMonth || 0;
}

/**
 * Calculate billing period dates (monthly)
 */
export function calculateBillingPeriod(): { start: Date; end: Date } {
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  
  return { start, end };
}

/**
 * Construct event from webhook for signature verification
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
