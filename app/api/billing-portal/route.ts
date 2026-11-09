import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getApiAuth, isServerSupabaseConfigured } from '@/lib/api-auth';

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
      return NextResponse.json({ error: 'Nalozi nisu povezani.' }, { status: 503 });
    }

    const auth = await getApiAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: 'Prijavite se da biste upravljali pretplatom.' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', auth.user.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'Još nemate aktivnu pretplatu.' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl(req)}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('Stripe Billing Portal Error:', err);
    const message = err instanceof Error ? err.message : 'Nepoznata greška pri otvaranju portala.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
