/**
 * @file billing.ts
 * @description Organization billing routes. Handles Stripe checkout sessions,
 *              plan retrieval, and the Stripe webhook for provisioning
 *              subscriptions in the database.
 * @module backend/routes
 */

import type { Request, Response} from 'express';
import express, { Router } from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/security.js';
import { PLAN_FEATURES, PLAN_MAX_USERS } from '../models/Subscription.js';
import { updateFromStripe } from '../services/subscriptionService.js';
import { AppError } from '../utils/AppError.js';
import { successResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

const router = Router();
const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia',
});

// Map standard plans to Stripe Product IDs (from env)
const PLAN_PRICES: Record<string, string | undefined> = {
  starter:    process.env.STRIPE_PRICE_STARTER,
  pro:        process.env.STRIPE_PRICE_PRO,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/billing/create-checkout-session
// ──────────────────────────────────────────────────────────────────────────────
router.post('/create-checkout-session', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { planId } = req.body;
    const user = req.user!;

    if (!PLAN_PRICES[planId]) {
      throw new AppError(`Plan invalide: ${planId}`, 400, 'INVALID_PLAN');
    }

    const priceId = PLAN_PRICES[planId];
    logger.info(`[Billing] Creating checkout session for user ${user.id} / plan ${planId}`);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      success_url: `${process.env.FRONTEND_URL}/fr/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/fr/pricing`,
      metadata: {
        userId: user.id,
        planId: planId,
      },
    });

    return successResponse(res, { url: session.url, id: session.id });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/billing/plans
// ──────────────────────────────────────────────────────────────────────────────
router.get('/plans', (_req: Request, res: Response) => {
  return successResponse(res, [
    {
      id: 'starter',
      name: 'Starter',
      price: 49,
      maxUsers: PLAN_MAX_USERS.starter,
      features: PLAN_FEATURES.starter,
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 149,
      popular: true,
      maxUsers: PLAN_MAX_USERS.pro,
      features: PLAN_FEATURES.pro,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 349,
      maxUsers: 'Illimité',
      features: PLAN_FEATURES.enterprise,
    },
  ]);
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/billing/webhook
// Note: Webhook MUST NOT use protection middleware; it receives raw body
// ──────────────────────────────────────────────────────────────────────────────
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response, next) => {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret || !sig) {
        throw new AppError('Configuration Stripe webhook manquante', 500, 'STRIPE_CONFIG_ERROR');
      }

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err: any) {
        logger.error(`[Billing] Vérification de la signature webhook échouée: ${err.message}`);
        throw new AppError('Signature Webhook invalide', 400, 'STRIPE_SIGNATURE_INVALID');
      }

      // Process event
      if (
        event.type === 'customer.subscription.created' ||
        event.type === 'customer.subscription.updated'
      ) {
        const subscription = event.data.object as any;
        const stripeCustomerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;

        await updateFromStripe(
          stripeCustomerId,
          subscription.id,
          priceId,
          subscription.status,
          new Date(subscription.current_period_end * 1000)
        );

        logger.info(`[Billing] Abonnement mis à jour avec succès: ${subscription.id}`);
      } else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as any;
        const stripeCustomerId = subscription.customer as string;

        await updateFromStripe(stripeCustomerId, subscription.id, '', 'canceled', new Date());
        logger.warn(`[Billing] Subscription canceled: ${subscription.id}`);
      }

      res.send({ received: true });
    } catch (err) {
      // Only pass to global handler if it's our AppError.
      // Otherwise return 400 so Stripe knows we rejected the payload.
      if (err instanceof AppError) {
        next(err);
      } else {
        res.status(400).send(`Webhook Error: ${(err as Error).message}`);
      }
    }
  }
);

export default router;
