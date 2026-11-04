import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe'; // Korišćenje relativne putanje umesto @/ da Vercel/Turbopack ne bi lomio build

export async function POST(req: Request) {
  try {
    const { tenantId, email } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
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
    } as any); // Zaobilazi stroge Stripe TypeScript provere na Vercelu

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}