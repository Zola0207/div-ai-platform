export type PlanId = 'site' | 'app' | 'mobile';

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number;
  setup?: number;
  siteLimit: number;
  priceEnv: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
};

export const PLANS: Plan[] = [
  {
    id: 'site',
    name: 'Sajt',
    tagline: 'Profesionalno prisustvo bez brige.',
    monthly: 19,
    siteLimit: 1,
    priceEnv: 'STRIPE_PRICE_SITE',
    features: [
      'Gotov sajt po meri delatnosti',
      'Forma za upite i pozive',
      'Hosting, domena i SSL',
      'SEO osnove i mobilni prikaz',
      'Do 1 izmene mesečno',
      'Email podrška',
    ],
  },
  {
    id: 'app',
    name: 'Web aplikacija',
    tagline: 'Zakazivanje i upiti na jednom mestu.',
    monthly: 49,
    siteLimit: 3,
    priceEnv: 'STRIPE_PRICE_APP',
    highlighted: true,
    badge: 'Najpopularnije',
    features: [
      'Sve iz plana Sajt',
      'Kalendar dostupnosti i slobodni termini',
      'Panel upita i zakazivanja',
      'Galerija, recenzije i FAQ',
      'Do 3 sajta na nalogu',
      'Prioritetna podrška',
    ],
  },
  {
    id: 'mobile',
    name: 'Mobilna aplikacija',
    tagline: 'Vaš biznis u App Store-u i Play prodavnici.',
    monthly: 149,
    setup: 999,
    siteLimit: 10,
    priceEnv: 'STRIPE_PRICE_MOBILE',
    badge: 'Premium',
    features: [
      'Sve iz plana Web aplikacija',
      'Nativna iOS i Android aplikacija',
      'Push obaveštenja klijentima',
      'Objava u App Store i Google Play',
      'Dizajn i tehnička priprema uključeni',
      'Do 10 sajtova na nalogu',
    ],
  },
];

export const PLAN_BY_ID: Record<PlanId, Plan> = PLANS.reduce((acc, plan) => {
  acc[plan.id] = plan;
  return acc;
}, {} as Record<PlanId, Plan>);

export function isPlanId(value: unknown): value is PlanId {
  return value === 'site' || value === 'app' || value === 'mobile';
}

export function planName(value?: string | null): string {
  if (isPlanId(value)) return PLAN_BY_ID[value].name;
  return 'Probni period';
}

export function siteLimitForPlan(value?: string | null): number {
  if (isPlanId(value)) return PLAN_BY_ID[value].siteLimit;
  return 1;
}
