import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '../../../lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isServerSupabaseConfigured } from '@/lib/api-auth';
import { PLANS, isPlanId } from '@/lib/plans';

function stripeId(value: { id: string } | string | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

// Plan se određuje po ceni iz Stripe portala (kad su ID-jevi u env),
// uz metadata kao rezervu za sesije kreirane inline cenama.
function planFromSubscription(subscription: Stripe.Subscription): string | null {
  const priceId = subscription.items?.data?.[0]?.price?.id;
  if (priceId) {
    for (const plan of PLANS) {
      if (process.env[plan.priceEnv] === priceId) return plan.id;
    }
  }
  const metadataPlan = subscription.metadata?.plan;
  return isPlanId(metadataPlan) ? metadataPlan : null;
}

async function updateProfile(
  field: 'id' | 'stripe_customer_id' | 'stripe_subscription_id',
  value: string,
  payload: Record<string, unknown>,
) {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('profiles')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq(field, value);

    if (error) {
      console.error(`Greška pri ažuriranju profila (${field}):`, error);
    }
  } catch (err) {
    console.error('Greška pri ažuriranju profila:', err);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature ?? '',
      process.env.STRIPE_WEBHOOK_SECRET || '',
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nepoznata greška potpisa.';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (!isServerSupabaseConfigured()) {
    console.warn(`Stripe webhook ${event.type}: Supabase nije povezan, preskačem upis.`);
    return NextResponse.json({ received: true, warning: 'Supabase not configured' });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId || session.client_reference_id;
      const metadataPlan = session.metadata?.plan;

      if (userId) {
        const payload: Record<string, unknown> = {
          subscription_status: session.subscription ? 'active' : 'paid',
          stripe_customer_id: stripeId(session.customer),
          stripe_subscription_id: stripeId(session.subscription),
        };
        if (isPlanId(metadataPlan)) payload.plan = metadataPlan;
        if (session.customer_details?.email) payload.email = session.customer_details.email;

        try {
          const admin = getSupabaseAdmin();
          const { error } = await admin
            .from('profiles')
            .upsert({ id: userId, ...payload }, { onConflict: 'id' });
          if (error) console.error('Greška pri aktivaciji pretplate:', error);
        } catch (err) {
          console.error('Greška pri aktivaciji pretplate:', err);
        }
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      const subscriptionPlan = planFromSubscription(subscription);

      const payload: Record<string, unknown> = {
        subscription_status: subscription.status,
        stripe_customer_id: stripeId(subscription.customer),
        stripe_subscription_id: subscription.id,
      };
      if (isPlanId(subscriptionPlan)) payload.plan = subscriptionPlan;

      if (userId) {
        await updateProfile('id', userId, payload);
      } else {
        const customerId = stripeId(subscription.customer);
        if (customerId) await updateProfile('stripe_customer_id', customerId, payload);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const payload = {
        subscription_status: 'canceled',
        stripe_subscription_id: subscription.id,
      };
      const userId = subscription.metadata?.userId;
      if (userId) {
        await updateProfile('id', userId, payload);
      } else {
        await updateProfile('stripe_subscription_id', subscription.id, payload);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = stripeId(invoice.customer);
      if (customerId) {
        await updateProfile('stripe_customer_id', customerId, { subscription_status: 'past_due' });
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null;
      };
      const customerId = stripeId(invoice.customer);
      const subscriptionId = stripeId(invoice.subscription ?? null);
      // Jednokratna naplata (npr. izrada aplikacije) ne menja status pretplate.
      if (customerId && subscriptionId) {
        await updateProfile('stripe_customer_id', customerId, { subscription_status: 'active' });
      }
      break;
    }

    default:
      console.log(`Nepoznat tip događaja: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
