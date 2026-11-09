import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getApiAuth, isServerSupabaseConfigured } from '@/lib/api-auth';
import { PLAN_BY_ID, isPlanId } from '@/lib/plans';

type CheckoutBody = {
  plan?: string;
  siteId?: string;
};

function appUrl(req: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  return (configured || new URL(req.url).origin).replace(/\/$/, '');
}

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe nije povezan.' }, { status: 503 });
    }
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ error: 'Nalozi nisu povezani. Dodajte Supabase ključeve.' }, { status: 503 });
    }

    const auth = await getApiAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: 'Prijavite se da biste izabrali plan.' }, { status: 401 });
    }

    const body = (await req.json()) as CheckoutBody;
    if (!isPlanId(body.plan)) {
      return NextResponse.json({ error: 'Nepoznat plan.' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id, email, plan, subscription_status')
      .eq('id', auth.user.id)
      .maybeSingle();

    const hasActiveSubscription = Boolean(
      profile
        && profile.plan !== 'none'
        && ['active', 'trialing', 'past_due'].includes(profile.subscription_status),
    );
    if (hasActiveSubscription) {
      return NextResponse.json(
        { error: 'Već imate aktivnu pretplatu. Plan promenite kroz „Moj nalog“.' },
        { status: 409 },
      );
    }

    if (body.siteId) {
      const { data: site } = await admin
        .from('sites')
        .select('id')
        .eq('id', body.siteId)
        .eq('owner_id', auth.user.id)
        .maybeSingle();
      if (!site) {
        return NextResponse.json({ error: 'Sajt nije pronađen na vašem nalogu.' }, { status: 400 });
      }
    }

    const plan = PLAN_BY_ID[body.plan];
    const configuredPrice = process.env[plan.priceEnv];

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      configuredPrice
        ? { price: configuredPrice, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: plan.monthly * 100,
              recurring: { interval: 'month' },
              product_data: {
                name: `DiV.ai — ${plan.name}`,
                description: plan.tagline,
              },
            },
          },
    ];

    if (plan.setup) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: plan.setup * 100,
          product_data: {
            name: `DiV.ai — ${plan.name} (jednokratno)`,
            description: 'Dizajn, priprema i objava aplikacije',
          },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: profile?.stripe_customer_id || undefined,
      customer_email: profile?.stripe_customer_id
        ? undefined
        : (profile?.email || auth.user.email || undefined),
      client_reference_id: auth.user.id,
      line_items: lineItems,
      subscription_data: {
        metadata: {
          userId: auth.user.id,
          plan: plan.id,
        },
      },
      metadata: {
        userId: auth.user.id,
        plan: plan.id,
        siteId: body.siteId ?? '',
      },
      allow_promotion_codes: true,
      success_url: `${appUrl(req)}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl(req)}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('Stripe Checkout Error:', err);
    const message = err instanceof Error ? err.message : 'Nepoznata greška pri kreiranju naplate.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
