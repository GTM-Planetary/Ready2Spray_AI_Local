/**
 * Stripe Products and Pricing Configuration
 * 
 * This file defines the subscription tiers and AI credit add-ons for Ready2Spray.
 * Products and prices should be created in Stripe Dashboard and their IDs added here.
 */

export interface SubscriptionTier {
  id: string;
  name: string;
  priceId: string; // Stripe Price ID
  productId: string; // Stripe Product ID
  monthlyPrice: number; // In dollars
  aiCreditsPerMonth: number;
  features: string[];
  stripePriceId?: string; // Will be set after creating in Stripe
}

export interface AiCreditAddon {
  id: string;
  name: string;
  priceId: string; // Stripe Price ID
  productId: string; // Stripe Product ID
  price: number; // In dollars
  credits: number;
  stripePriceId?: string; // Will be set after creating in Stripe
}

/**
 * Subscription Tiers
 * Note: These need to be created in Stripe Dashboard first
 */
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  STARTER: {
    id: 'starter',
    name: 'Starter Plan',
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder',
    productId: process.env.STRIPE_PRODUCT_STARTER || 'prod_starter_placeholder',
    monthlyPrice: 29,
    aiCreditsPerMonth: 1000,
    features: [
      '1,000 AI credits/month (~100 conversations)',
      'All core features (jobs, customers, sites, equipment)',
      'Email support',
      'Mobile app access',
    ],
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional Plan',
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional_placeholder',
    productId: process.env.STRIPE_PRODUCT_PROFESSIONAL || 'prod_professional_placeholder',
    monthlyPrice: 79,
    aiCreditsPerMonth: 5000,
    features: [
      '5,000 AI credits/month (~500 conversations)',
      'All Starter features',
      'Priority support',
      'API access for integrations',
      'Advanced reporting',
    ],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_placeholder',
    productId: process.env.STRIPE_PRODUCT_ENTERPRISE || 'prod_enterprise_placeholder',
    monthlyPrice: 199,
    aiCreditsPerMonth: 20000,
    features: [
      '20,000 AI credits/month (~2,000 conversations)',
      'All Professional features',
      'Dedicated support',
      'Custom integrations',
      'White-label options',
    ],
  },
};

/**
 * AI Credit Add-ons
 * One-time purchases for additional credits
 */
export const AI_CREDIT_ADDONS: Record<string, AiCreditAddon> = {
  SMALL: {
    id: 'ai_credits_500',
    name: '500 AI Credits',
    priceId: process.env.STRIPE_PRICE_AI_CREDITS_500 || 'price_ai_credits_500_placeholder',
    productId: process.env.STRIPE_PRODUCT_AI_CREDITS || 'prod_ai_credits_placeholder',
    price: 10,
    credits: 500,
  },
  MEDIUM: {
    id: 'ai_credits_2500',
    name: '2,500 AI Credits',
    priceId: process.env.STRIPE_PRICE_AI_CREDITS_2500 || 'price_ai_credits_2500_placeholder',
    productId: process.env.STRIPE_PRODUCT_AI_CREDITS || 'prod_ai_credits_placeholder',
    price: 45,
    credits: 2500,
  },
  LARGE: {
    id: 'ai_credits_10000',
    name: '10,000 AI Credits',
    priceId: process.env.STRIPE_PRICE_AI_CREDITS_10000 || 'price_ai_credits_10000_placeholder',
    productId: process.env.STRIPE_PRODUCT_AI_CREDITS || 'prod_ai_credits_placeholder',
    price: 150,
    credits: 10000,
  },
};

/**
 * AI Credit Conversion
 * Approximate token-to-credit conversion for tracking
 */
export const AI_CREDIT_CONVERSION = {
  TOKENS_PER_CREDIT: 100, // 1 credit = ~100 tokens
  AVERAGE_CONVERSATION_TOKENS: 1000, // Average conversation uses ~1000 tokens
  AVERAGE_CONVERSATION_CREDITS: 10, // Average conversation = 10 credits
};

/**
 * Usage Thresholds
 */
export const USAGE_THRESHOLDS = {
  WARNING_PERCENT: 80, // Warn user at 80% usage
  CRITICAL_PERCENT: 95, // Critical warning at 95%
};

/**
 * Trial Coupon Codes
 * These should be created in Stripe Dashboard
 */
export const TRIAL_COUPONS = {
  TRIAL_14_DAY: 'TRIAL14', // 14-day free trial
  TRIAL_30_DAY: 'TRIAL30', // 30-day free trial
};

/**
 * Owner Email for Bypass
 * This email gets unlimited access without payment
 * Uses environment variable in dev mode, falls back to production email
 */
export const OWNER_EMAIL = process.env.OWNER_EMAIL || 'wyatt@gtmplanetary.com';
