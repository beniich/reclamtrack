import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    // Stripe Signature verification goes here using process.env.STRIPE_WEBHOOK_SECRET
    // const signature = headers().get('stripe-signature') as string;

    // For mock purposes, we just parse the body
    const event = JSON.parse(body);

    console.log(`[Stripe Webhook] Réception de l'événement: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        // Logique pour upgrader l'organisation
        console.log(`[Stripe Webhook] Session de paiement réussie !`);
        break;
      case 'invoice.payment_succeeded':
        // Renouvellement réussi
        break;
      case 'customer.subscription.deleted':
        // Désabonnement
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erreur Webhook Stripe:', error);
    return NextResponse.json(
      { error: 'Webhook Error' },
      { status: 400 }
    );
  }
}
