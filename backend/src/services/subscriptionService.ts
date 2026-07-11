/**
 * @file subscriptionService.ts
 * @description Service for managing organization subscriptions,
 *              enforcing limits, and checking feature flags.
 * @module backend/services
 */

import { Membership } from '../models/Membership.js';
import { Organization } from '../models/Organization.js';
import {
  PLAN_FEATURES,
  PLAN_MAX_USERS,
  Subscription,
} from '../models/Subscription.js';
import type {
  ISubscription,
  PlanName} from '../models/Subscription.js';
import { SubscriptionLimitError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

/**
 * Get or create the default (starter) subscription for an organization.
 */
export const getSubscription = async (orgId: string): Promise<ISubscription> => {
  let sub = await Subscription.findOne({ orgId });

  if (!sub) {
    // Lazy creation of default starter plan for orgs that don't have a record yet
    sub = await Subscription.create({
      orgId,
      plan: 'starter',
      status: 'active',
      maxUsers: PLAN_MAX_USERS.starter,
      features: PLAN_FEATURES.starter,
    });
    logger.info(`[SubscriptionService] Created default starter sub for org ${orgId}`);
  }

  return sub;
};

/**
 * Ensure an organization hasn't exceeded its user limit.
 * Throws SubscriptionLimitError if the limit is reached.
 */
export const enforceUserLimit = async (orgId: string): Promise<void> => {
  const sub = await getSubscription(orgId);

  // Enterprise has Infinity maxUsers
  if (sub.plan === 'enterprise' || sub.maxUsers === Infinity) {
    return;
  }

  const activeMembersCount = await Membership.countDocuments({
    organizationId: orgId,
    status: { $in: ['ACTIVE', 'INVITED'] },
  });

  if (activeMembersCount >= sub.maxUsers) {
    logger.warn(`[SubscriptionService] Org ${orgId} hit user limit (${sub.maxUsers})`);
    throw new SubscriptionLimitError(
      `Limite d'utilisateurs atteinte pour le plan ${sub.plan} (${sub.maxUsers} max). Veuillez mettre à niveau votre abonnement.`
    );
  }
};

/**
 * Check if an organization's plan includes a specific feature.
 */
export const hasFeature = async (orgId: string, feature: string): Promise<boolean> => {
  const sub = await getSubscription(orgId);
  return sub.features.includes(feature) || sub.plan === 'enterprise';
};

/**
 * Handle Webhook data from Stripe to provision or update a subscription.
 */
export const updateFromStripe = async (
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  stripePriceId: string,
  status: string,
  currentPeriodEnd: Date
): Promise<void> => {
  // Map Stripe Price ID back to our PlanName (in a real app, this comes from DB mapping/Stripe metadata)
  let planName: PlanName = 'starter';
  if (stripePriceId === process.env.STRIPE_PRICE_PRO) planName = 'pro';
  if (stripePriceId === process.env.STRIPE_PRICE_ENTERPRISE) planName = 'enterprise';

  const org = await Organization.findOne({ stripeCustomerId });
  if (!org) {
    logger.error(
      `[SubscriptionService] Webhook error: No org found for customer ${stripeCustomerId}`
    );
    return;
  }

  const sub = await Subscription.findOneAndUpdate(
    { orgId: org._id },
    {
      plan: planName,
      status,
      stripeSubscriptionId,
      stripePriceId,
      stripeCustomerId,
      maxUsers: PLAN_MAX_USERS[planName],
      features: PLAN_FEATURES[planName],
      currentPeriodEnd,
    },
    { new: true, upsert: true }
  );

  logger.info(
    `[SubscriptionService] Updated subscription for org ${org._id} to ${planName} (${status})`
  );
};
