import Stripe from 'stripe';

// Dodat rezervni string ('dummy_key') sprečava krah build-a ako Vercel još nema env varijablu
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
  apiVersion: '2023-10-16' as any,
  typescript: true,
});