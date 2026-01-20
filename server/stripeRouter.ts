/**
 * Stripe Router - Handles subscription and billing operations
 */

import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createStripeCustomer,
  createCheckoutSession,
  createCreditCheckoutSession,
  getSubscription,
  cancelSubscription,
  updateSubscription,
  createPortalSession,
  isOwnerBypass,
  getCreditsForPlan,
  calculateBillingPeriod,
} from "./stripe";
import {
  createOrganization,
  getOrganizationById,
  getOrganizationByOwnerEmail,
  updateOrganization,
  addOrganizationMember,
  getUserOrganization,
} from "./dbOrganizations";
import { SUBSCRIPTION_TIERS, AI_CREDIT_ADDONS } from "./products";
import { notifyOwner } from "./_core/notification";

export const stripeRouter = router({
  /**
   * Create organization and Stripe customer (first step of signup)
   */
  createOrganization: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Organization name is required"),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        mode: z.enum(["ag_aerial", "residential_pest", "both"]).default("ag_aerial"),
        invitationCode: z.string().min(1, "Invitation code is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if owner bypass (skip invitation code check)
      const bypass = ctx.user.email && isOwnerBypass(ctx.user.email);

      // Validate invitation code (unless owner bypass)
      if (!bypass) {
        const validCode = process.env.INVITATION_CODE;
        if (!validCode || input.invitationCode !== validCode) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Invalid invitation code. Ready2Spray is currently in beta and requires an invitation to sign up.",
          });
        }
      }
      // Check if user already has an organization
      const existing = await getUserOrganization(ctx.user.id);
      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already belong to an organization",
        });
      }

      // Check if user email already owns an organization
      if (ctx.user.email) {
        const existingByEmail = await getOrganizationByOwnerEmail(ctx.user.email);
        if (existingByEmail) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "An organization already exists with this email address",
          });
        }
      }

      let stripeCustomerId: string | undefined;

      // Create Stripe customer (unless owner bypass)
      if (!bypass) {
        const customer = await createStripeCustomer({
          email: ctx.user.email || "",
          name: input.name,
          organizationId: 0, // Will be updated after org creation
          metadata: {
            userId: ctx.user.id.toString(),
            userName: ctx.user.name || "",
          },
        });
        stripeCustomerId = customer.id;
      }

      // Calculate billing period
      const { start, end } = calculateBillingPeriod();

      // Create organization
      const org = await createOrganization({
        name: input.name,
        ownerId: ctx.user.id,
        address: input.address,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        phone: input.phone,
        email: input.email || ctx.user.email,
        mode: input.mode,
        stripeCustomerId,
        subscriptionStatus: bypass ? "active" : "incomplete",
        subscriptionPlan: bypass ? "enterprise" : "starter",
        aiCreditsTotal: bypass ? 999999 : 0,
        aiCreditsUsed: 0,
        aiCreditsRollover: 0,
        billingPeriodStart: start,
        billingPeriodEnd: end,
      });

      // Add user as owner member
      await addOrganizationMember({
        organizationId: org.id,
        userId: ctx.user.id,
        role: "owner",
        joinedAt: new Date(),
      });

      // Notify owner of new signup (unless it's the owner signing up)
      if (!bypass) {
        await notifyOwner({
          title: "New Organization Signup",
          content: `**${org.name}** just signed up!\n\n` +
            `- Owner: ${ctx.user.name || "Unknown"}\n` +
            `- Email: ${ctx.user.email || "Not provided"}\n` +
            `- Mode: ${input.mode}\n` +
            `- Organization ID: ${org.id}`,
        });
      }

      return {
        organization: org,
        requiresPayment: !bypass,
      };
    }),

  /**
   * Create Stripe checkout session for subscription
   */
  createCheckout: protectedProcedure
    .input(
      z.object({
        planId: z.enum(["starter", "professional", "enterprise"]),
        couponCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user's organization
      const userOrg = await getUserOrganization(ctx.user.id);
      if (!userOrg) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No organization found. Please create an organization first.",
        });
      }

      const { organization } = userOrg;

      // Check if already has active subscription
      if (organization.subscriptionStatus === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Organization already has an active subscription",
        });
      }

      if (!organization.stripeCustomerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Stripe customer ID found",
        });
      }

      // Get plan details
      const tier = SUBSCRIPTION_TIERS[input.planId.toUpperCase() as keyof typeof SUBSCRIPTION_TIERS];
      if (!tier) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid plan selected",
        });
      }

      // Create checkout session
      const origin = ctx.req.headers.origin || "http://localhost:3000";
      const session = await createCheckoutSession({
        customerId: organization.stripeCustomerId,
        priceId: tier.priceId,
        successUrl: `${origin}/dashboard?subscription=success`,
        cancelUrl: `${origin}/signup/plans?subscription=cancelled`,
        metadata: {
          organizationId: organization.id.toString(),
          userId: ctx.user.id.toString(),
          planId: input.planId,
        },
        couponCode: input.couponCode,
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),

  /**
   * Create checkout for AI credit add-ons
   */
  purchaseCredits: protectedProcedure
    .input(
      z.object({
        addonId: z.enum(["ai_credits_500", "ai_credits_2500", "ai_credits_10000"]),
        quantity: z.number().min(1).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userOrg = await getUserOrganization(ctx.user.id);
      if (!userOrg) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No organization found",
        });
      }

      const { organization } = userOrg;

      if (!organization.stripeCustomerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Stripe customer ID found",
        });
      }

      const addon = AI_CREDIT_ADDONS[input.addonId.toUpperCase() as keyof typeof AI_CREDIT_ADDONS];
      if (!addon) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid add-on selected",
        });
      }

      const origin = ctx.req.headers.origin || "http://localhost:3000";
      const session = await createCreditCheckoutSession({
        customerId: organization.stripeCustomerId,
        priceId: addon.priceId,
        quantity: input.quantity,
        successUrl: `${origin}/dashboard?credits=success`,
        cancelUrl: `${origin}/dashboard?credits=cancelled`,
        metadata: {
          organizationId: organization.id.toString(),
          userId: ctx.user.id.toString(),
          addonId: input.addonId,
          credits: (addon.credits * input.quantity).toString(),
        },
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),

  /**
   * Get current subscription status
   */
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    // Dev mode bypass - return synthetic status without database queries
    const isDev = process.env.NODE_ENV === "development" || process.env.VITE_DEV_AUTH === "true";
    if (isDev && ctx.user.email && isOwnerBypass(ctx.user.email)) {
      return {
        hasOrganization: true,
        hasSubscription: true,
        status: "active",
        plan: "enterprise",
        creditsTotal: 999999,
        creditsUsed: 0,
        creditsRemaining: 999999,
        isOwnerBypass: true,
      };
    }

    let userOrg = await getUserOrganization(ctx.user.id);
    
    // Auto-create organization for owner if doesn't exist
    if (!userOrg && ctx.user.email && isOwnerBypass(ctx.user.email)) {
      const { start, end } = calculateBillingPeriod();
      const org = await createOrganization({
        name: `${ctx.user.name || "Owner"}'s Organization`,
        ownerId: ctx.user.id,
        email: ctx.user.email,
        mode: "ag_aerial",
        subscriptionPlan: "enterprise",
        subscriptionStatus: "active",
        aiCreditsTotal: 999999,
        aiCreditsUsed: 0,
        aiCreditsRollover: 0,
        billingPeriodStart: start,
        billingPeriodEnd: end,
      });
      
      // Add owner as member
      await addOrganizationMember({
        organizationId: org.id,
        userId: ctx.user.id,
        role: "owner",
      });
      
      // Refresh userOrg
      userOrg = await getUserOrganization(ctx.user.id);
    }
    
    if (!userOrg) {
      return {
        hasOrganization: false,
        hasSubscription: false,
        isOwnerBypass: ctx.user.email ? isOwnerBypass(ctx.user.email) : false,
      };
    }

    const { organization } = userOrg;

    // Check if owner bypass
    if (ctx.user.email && isOwnerBypass(ctx.user.email)) {
      return {
        hasOrganization: true,
        hasSubscription: true,
        status: "active",
        plan: "enterprise",
        creditsTotal: 999999,
        creditsUsed: organization.aiCreditsUsed,
        creditsRemaining: 999999,
        isOwnerBypass: true,
      };
    }

    // Get subscription from Stripe if exists
    let stripeSubscription = null;
    if (organization.stripeSubscriptionId) {
      stripeSubscription = await getSubscription(organization.stripeSubscriptionId);
    }

    const creditsTotal = organization.aiCreditsTotal + organization.aiCreditsRollover;
    const creditsRemaining = Math.max(0, creditsTotal - organization.aiCreditsUsed);

    return {
      hasOrganization: true,
      hasSubscription: !!organization.stripeSubscriptionId,
      status: organization.subscriptionStatus,
      plan: organization.subscriptionPlan,
      creditsTotal,
      creditsUsed: organization.aiCreditsUsed,
      creditsRemaining,
      creditsRollover: organization.aiCreditsRollover,
      billingPeriodStart: organization.billingPeriodStart,
      billingPeriodEnd: organization.billingPeriodEnd,
      stripeSubscription,
      isOwnerBypass: false,
    };
  }),

  /**
   * Get customer portal URL for managing subscription
   */
  getPortalUrl: protectedProcedure.mutation(async ({ ctx }) => {
    const userOrg = await getUserOrganization(ctx.user.id);
    if (!userOrg) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No organization found",
      });
    }

    const { organization } = userOrg;

    if (!organization.stripeCustomerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No Stripe customer found",
      });
    }

    const origin = ctx.req.headers.origin || "http://localhost:3000";
    const session = await createPortalSession({
      customerId: organization.stripeCustomerId,
      returnUrl: `${origin}/dashboard`,
    });

    return {
      portalUrl: session.url,
    };
  }),

  /**
   * Get available plans
   */
  getPlans: publicProcedure.query(() => {
    return Object.values(SUBSCRIPTION_TIERS);
  }),

  /**
   * Get available credit add-ons
   */
  getCreditAddons: protectedProcedure.query(() => {
    return Object.values(AI_CREDIT_ADDONS);
  }),
});
