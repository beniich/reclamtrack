import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_dummy_build_key', {
  apiVersion: '2025-01-27.acacia' as any,
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Configuration Stripe webhook manquante' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err: any) {
      console.error(`[Stripe Webhook] Signature invalide: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook signature invalide: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Événement reçu: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Stripe Webhook] Session de paiement réussie: ${session.id}`);
        // TODO: Mettre à jour le plan de l'organisation dans la base de données
        // via l'API backend /api/billing/webhook
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe Webhook] Renouvellement d'abonnement réussi: ${invoice.id}`);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe Webhook] Abonnement mis à jour: ${subscription.id}`);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe Webhook] Abonnement annulé: ${subscription.id}`);
        break;
      }
      default:
        console.log(`[Stripe Webhook] Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Erreur interne:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
