import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe'; // Korišćenje relativne putanje umesto @/ da Vercel/Turbopack ne bi lomio build
import type Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const { tenantId, email } = await req.json() as { tenantId?: string; email?: string };

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'DiV.ai Mesečna Pretplata',
              description: 'Održavanje sajta, hosting i prijem upita',
            },
            unit_amount: 1900, // 19.00 EUR
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        tenantId: tenantId || 'bella-demo',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?payment=cancelled`,
    };
    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('Stripe Checkout Error:', err);
    const message = err instanceof Error ? err.message : 'Nepoznata greška pri kreiranju naplate.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
