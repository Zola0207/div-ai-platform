import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

// Kreira se tek pri obradi događaja, da bi build radio i bez serverskih tajni.
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Nedostaju Supabase serverske promenljive okruženja.');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  let event: Stripe.Event;

  try {
    // Verifikacija da je zahtev zaista poslao Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nepoznata greška potpisa.';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Obrada specifičnih Stripe događaja
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // Izvlačimo tenantId koji smo prosledili kroz metadata prilikom kreiranja sesije
      const tenantId = session.metadata?.tenantId;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      if (tenantId) {
        const supabaseAdmin = getSupabaseAdmin();
        // Ažuriranje statusa u Supabase bazi
        const { error } = await supabaseAdmin
          .from('tenants') // Prilagodi naziv tabele tvojoj šemi (npr. 'users', 'profiles', 'tenants')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', tenantId);

        if (error) {
          console.error('Greška pri ažuriranju Supabase baze:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;
      const supabaseAdmin = getSupabaseAdmin();

      // Kada korisnik otkaže pretplatu ili istekne
      const { error } = await supabaseAdmin
        .from('tenants')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);

      if (error) {
        console.error('Greška pri ažuriranju otkazane pretplate:', error);
      }
      break;
    }

    default:
      console.log(`Nepoznat tip događaja: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
