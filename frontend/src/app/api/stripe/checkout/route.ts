import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_dummy_build_key';

// Plan IDs → Stripe Price IDs
const PLAN_PRICES: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro:     process.env.STRIPE_PRICE_PRO,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, interval } = body as { planId: string; interval: 'month' | 'year' };

    if (!planId) {
      return NextResponse.json({ error: 'planId requis' }, { status: 400 });
    }

    // Mode mock si clé Stripe absente
    if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'mock_key') {
      console.log(`[Stripe Mock] Session checkout mock pour le plan ${planId} (${interval})`);
      const mockCheckoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?checkout=success&plan=${planId}`;
      return NextResponse.json({ url: mockCheckoutUrl });
    }

    const priceId = PLAN_PRICES[planId];
    if (!priceId) {
      return NextResponse.json(
        { error: `Plan invalide ou non configuré: ${planId}` },
        { status: 400 }
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as any,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
      metadata: { planId },
    });

    return NextResponse.json({ url: session.url, id: session.id });

  } catch (error) {
    console.error('[Stripe Checkout] Erreur lors de la création de la session:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
