import { NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, interval } = body;

    // Si on n'a pas de clé Stripe configurée, on renvoie une URL "mock"
    if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'mock_key') {
      console.log(`[Stripe Mock] Création d'une session checkout mock pour le plan ${planId} (${interval})`);
      
      // On simule une URL de redirection (par exemple, retour direct au success)
      const mockCheckoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?checkout=success&plan=${planId}`;
      
      return NextResponse.json({ url: mockCheckoutUrl });
    }

    // TODO: Implémentation réelle de Stripe
    // 1. Initialiser le client Stripe avec la clé secrète
    // 2. Créer une checkout session
    // 3. Retourner l'URL de la session
    
    return NextResponse.json({ error: 'Stripe n\'est pas encore complètement configuré.' }, { status: 501 });

  } catch (error) {
    console.error('Erreur lors de la création de la session checkout:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
