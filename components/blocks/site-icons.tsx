import type { CSSProperties, ReactNode } from 'react';

// Crtež ikonica umesto emodžija. Emodžiji se renderuju različito na svakom
// sistemu (Windows, Android, iOS), pa sajt deluje nedovršeno. Ove ikone su
// monohromatske, nasleđuju boju teksta i jednake su na svim uređajima.
export type SiteIconName =
  | 'scissors' | 'sparkles' | 'eye' | 'leaf' | 'pen' | 'paw'
  | 'wrench' | 'car' | 'disc' | 'key' | 'truck'
  | 'cutlery' | 'coffee' | 'bed' | 'pot' | 'pizza'
  | 'tooth' | 'activity' | 'chat' | 'salad'
  | 'dumbbell' | 'lotus' | 'shield' | 'music'
  | 'book' | 'laptop' | 'smile'
  | 'roller' | 'bolt' | 'droplet' | 'spray' | 'snowflake' | 'hammer' | 'box'
  | 'calculator' | 'scale' | 'building' | 'chart' | 'camera'
  | 'flower' | 'shirt' | 'gem' | 'bag' | 'briefcase'
  | 'phone' | 'mapPin' | 'clock' | 'calendar' | 'mail' | 'arrowRight' | 'check' | 'home';

const ICONS: Record<SiteIconName, ReactNode> = {
  scissors: (
    <>
      <circle cx="6" cy="6.5" r="2.6" />
      <circle cx="6" cy="17.5" r="2.6" />
      <path d="M20 4 8.2 14.6" />
      <path d="M14.4 14.4 20 20" />
      <path d="M8.2 9.4 12 12.6" />
    </>
  ),
  sparkles: (
    <>
      <path d="M11 3.5l1.7 4.6 4.6 1.7-4.6 1.7L11 16.1 9.3 11.5 4.7 9.8l4.6-1.7z" />
      <path d="M17.8 14.4l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9z" />
    </>
  ),
  eye: (
    <>
      <path d="M2.6 12S6.2 5.8 12 5.8 21.4 12 21.4 12 17.8 18.2 12 18.2 2.6 12 2.6 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4c0 9-5.4 14.2-12 14.2H4.8C4.8 9.2 10 4 20 4z" />
      <path d="M4 20c2.8-5.8 7-8.2 12-9.2" />
    </>
  ),
  pen: (
    <>
      <path d="M16.6 3.4l4 4L8 20H4v-4z" />
      <path d="M13.6 6.4l4 4" />
    </>
  ),
  paw: (
    <>
      <ellipse cx="6.6" cy="9.4" rx="1.7" ry="2.1" />
      <ellipse cx="11" cy="7.4" rx="1.7" ry="2.1" />
      <ellipse cx="15.6" cy="8.4" rx="1.7" ry="2.1" />
      <ellipse cx="18.6" cy="12" rx="1.5" ry="1.9" />
      <path d="M12.6 12.4c2.7 0 4.9 2.1 4.9 4.3 0 1.9-1.6 2.9-3.4 2.9-.9 0-1.1-.4-1.9-.4s-1 .4-1.9.4c-1.8 0-3.4-1-3.4-2.9 0-2.2 2.2-4.3 4.9-4.3z" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  car: (
    <>
      <path d="M3.5 16.5v-3.4L5.6 8h12.8l2.1 5.1v3.4" />
      <path d="M3.5 13.2h17" />
      <path d="M5.6 8h12.8" />
      <circle cx="7.4" cy="17.4" r="1.6" />
      <circle cx="16.6" cy="17.4" r="1.6" />
    </>
  ),
  disc: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3.6v3.4M12 17v3.4M3.6 12h3.4M17 12h3.4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4" />
      <path d="M11 11l9 9" />
      <path d="M17.2 17.2l2-2" />
      <path d="M14.6 14.6l2-2" />
    </>
  ),
  truck: (
    <>
      <rect x="2.5" y="7" width="11" height="9" rx="1.2" />
      <path d="M13.5 10h3.8l3.2 3v3h-7" />
      <circle cx="7" cy="17.8" r="1.7" />
      <circle cx="17" cy="17.8" r="1.7" />
    </>
  ),
  cutlery: (
    <>
      <path d="M7 3v7.2a2 2 0 0 0 4 0V3" />
      <path d="M9 10.4V21" />
      <path d="M16.4 3c-1.3 1.8-1.9 3.6-1.9 5.4 0 1.4.9 2.1 1.9 2.1s1.9-.7 1.9-2.1c0-1.8-.6-3.6-1.9-5.4z" />
      <path d="M16.4 10.5V21" />
    </>
  ),
  coffee: (
    <>
      <path d="M4 8.4h11.4v6.4a4.8 4.8 0 0 1-4.8 4.8H8.8A4.8 4.8 0 0 1 4 14.8z" />
      <path d="M15.4 9.6h1.9a2.4 2.4 0 0 1 0 4.8h-1.9" />
      <path d="M7.2 3v2.2M11 3v2.2" />
    </>
  ),
  bed: (
    <>
      <path d="M3 20V6.5" />
      <path d="M3 12.4h13.2a4.8 4.8 0 0 1 4.8 4.8V20" />
      <path d="M3 20h18" />
      <circle cx="7.4" cy="9.2" r="1.8" />
    </>
  ),
  pot: (
    <>
      <path d="M4 10.2h16v3.2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z" />
      <path d="M2 10.2h20" />
      <path d="M8.4 6.4c0-1 .9-1.2.9-2.2M12.2 6.4c0-1 .9-1.2.9-2.2M16 6.4c0-1 .9-1.2.9-2.2" />
    </>
  ),
  pizza: (
    <>
      <path d="M12 3.4 21 20.6H3z" />
      <circle cx="10.4" cy="12.4" r="1.1" />
      <circle cx="14" cy="16.4" r="1.1" />
      <circle cx="12.4" cy="8.4" r=".9" />
    </>
  ),
  tooth: (
    <path d="M12 5.2c-2-1.6-5-1.5-6.5.6-1.5 2-1 5.4-.5 7.9.5 2.5.6 5.7 2.2 5.7 1.5 0 1.3-2.8 2-4.4.5-1.1 1.6-1.1 2.1 0 .7 1.6.5 4.4 2 4.4 1.6 0 1.7-3.2 2.2-5.7.5-2.5 1-5.9-.5-7.9-1.5-2.1-4.5-2.2-6.5-.6z" />
  ),
  activity: <path d="M2.5 12h3.9l2.1-5.4 4.3 10.8 2.2-5.4h6.5" />,
  chat: (
    <>
      <path d="M20.6 11.4a8.6 8.6 0 0 1-12.8 7.5L3 20.4l1.4-4.6A8.6 8.6 0 1 1 20.6 11.4z" />
      <path d="M8.6 11.6h.1M12 11.6h.1M15.4 11.6h.1" />
    </>
  ),
  salad: (
    <>
      <path d="M4.2 12.4h15.6" />
      <path d="M5 12.4a7 7 0 0 1 14 0" />
      <path d="M8.4 20.2h7.2" />
      <path d="M12 5.4c1.8-1.8 4.4-1 4.4 1.2 0 .9-.4 1.7-1 2.2" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M3.4 9.4v5.2M6.8 7v10M17.2 7v10M20.6 9.4v5.2" />
      <path d="M6.8 12h10.4" />
    </>
  ),
  lotus: (
    <>
      <circle cx="12" cy="4.8" r="2" />
      <path d="M12 7.2v5.4" />
      <path d="M5 10.4l7 2 7-2" />
      <path d="M12 12.6 8 20M12 12.6 16 20" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.2 20 6v6c0 4.9-3.4 7.9-8 8.8-4.6-.9-8-3.9-8-8.8V6z" />
      <path d="M8.6 12.2 11 14.6l4.6-4.8" />
    </>
  ),
  music: (
    <>
      <circle cx="6.6" cy="17.4" r="2.4" />
      <circle cx="17.4" cy="15.4" r="2.4" />
      <path d="M9 17.4V6l10.8-2v11.4" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.2A2.2 2.2 0 0 1 6.2 3H20v18H6.2A2.2 2.2 0 0 1 4 18.8z" />
      <path d="M4 17.2h16" />
    </>
  ),
  laptop: (
    <>
      <rect x="4.2" y="5" width="15.6" height="10.6" rx="1.6" />
      <path d="M2.4 19.6h19.2" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M8.4 14.4c1.4 1.6 5.8 1.6 7.2 0" />
      <path d="M9.2 10h.1M14.8 10h.1" />
    </>
  ),
  roller: (
    <>
      <rect x="3" y="4.4" width="10.4" height="4.4" rx="1.2" />
      <path d="M13.4 6.6h5.2a1.8 1.8 0 0 1 1.8 1.8v2.4a1.8 1.8 0 0 1-1.8 1.8h-6.2" />
      <path d="M11.2 12.6v2.2h1.8v5.6h-3.6v-5.6h1.8" />
    </>
  ),
  bolt: <path d="M13.4 2.4 4.4 13.8h6.4l-.8 7.8 9-11.4h-6.4z" />,
  droplet: <path d="M12 3.2s6 6.4 6 10.4a6 6 0 0 1-12 0c0-4 6-10.4 6-10.4z" />,
  spray: (
    <>
      <rect x="7" y="9.4" width="8" height="11.2" rx="2.2" />
      <path d="M9.4 9.4V6.2h3.2v3.2" />
      <path d="M16.4 5h2.2M16.4 8.2h3M16.4 11.4h2.2" />
    </>
  ),
  snowflake: (
    <>
      <path d="M12 2.6v18.8M4 7.2l16 9.6M20 7.2 4 16.8" />
      <path d="M12 6.2 9.8 4M12 6.2 14.2 4M12 17.8 9.8 20M12 17.8l2.2 2.2" />
    </>
  ),
  hammer: (
    <>
      <path d="M14.2 3.4 20.6 9.8l-2.8 2.8-6.4-6.4z" />
      <path d="M11.4 5.8 3.6 13.6a2 2 0 0 0 0 2.8l1.4 1.4a2 2 0 0 0 2.8 0l7.8-7.8" />
    </>
  ),
  box: (
    <>
      <path d="M3.4 7.8 12 3.2l8.6 4.6L12 12.4z" />
      <path d="M3.4 7.8v8.4L12 20.8l8.6-4.6V7.8" />
      <path d="M12 12.4v8.4" />
    </>
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8.2 7h7.6" />
      <path d="M8.4 11.2h.1M12 11.2h.1M15.6 11.2h.1M8.4 14.8h.1M12 14.8h.1M15.6 14.8h.1M8.4 18.2h.1M12 18.2h.1M15.6 18.2h.1" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3.4v17.2" />
      <path d="M6.6 7.4h10.8" />
      <path d="M6.6 7.4 4 13a2.9 2.9 0 0 0 5.8 0z" />
      <path d="M17.4 7.4 14.8 13a2.9 2.9 0 0 0 5.8 0z" />
      <path d="M8.4 20.6h7.2" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.2" />
      <path d="M9.2 7h1M13.8 7h1M9.2 10.6h1M13.8 10.6h1M9.2 14.2h1M13.8 14.2h1" />
      <path d="M10 21v-3.4h4V21" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="M8 16v-3.6M12 16V9M16 16v-5.4" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.2" />
      <circle cx="12" cy="13.4" r="3.6" />
      <path d="M8.2 7 9.8 4h4.4L15.8 7" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="8.8" r="2.2" />
      <ellipse cx="12" cy="4.6" rx="1.7" ry="2" />
      <ellipse cx="12" cy="13" rx="1.7" ry="2" />
      <ellipse cx="8.4" cy="8.8" rx="2" ry="1.7" />
      <ellipse cx="15.6" cy="8.8" rx="2" ry="1.7" />
      <path d="M12 13v8" />
      <path d="M12 17.4c1.8 0 2.6-1 2.6-1s-.8-1.6-2.6-1.6-2.6 1.6-2.6 1.6 1 1 2.6 1z" />
    </>
  ),
  shirt: <path d="M8.4 3.2 12 6.2l3.6-3 4.4 4-3 3v10.6H7V10.2l-3-3z" />,
  gem: (
    <>
      <path d="M6.2 3h11.6L22 9 12 21 2 9z" />
      <path d="M2 9h20" />
      <path d="M9 3 8 9l4 12 4-12-1-6" />
    </>
  ),
  bag: (
    <>
      <path d="M4 8h16l-1.4 12.2H5.4z" />
      <path d="M8.6 8V6.2a3.4 3.4 0 0 1 6.8 0V8" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.4" width="18" height="12.6" rx="2" />
      <path d="M8.6 7.4V5.6A1.6 1.6 0 0 1 10.2 4h3.6a1.6 1.6 0 0 1 1.6 1.6v1.8" />
      <path d="M3 12.8h18" />
    </>
  ),
  phone: (
    <path d="M6.4 3.2h3.2l1.9 4.7-2.2 1.5a10.6 10.6 0 0 0 5.4 5.4l1.5-2.2 4.7 1.9v3.2a2 2 0 0 1-2 2A16.6 16.6 0 0 1 4.4 5.2a2 2 0 0 1 2-2z" />
  ),
  mapPin: (
    <>
      <path d="M12 21.2s7.2-6.2 7.2-11.2a7.2 7.2 0 0 0-14.4 0c0 5 7.2 11.2 7.2 11.2z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5.2" width="18" height="15.8" rx="2.2" />
      <path d="M8 3v4.4M16 3v4.4M3 10.2h18" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.2" width="18" height="13.6" rx="2.2" />
      <path d="M3.6 6.8 12 12.8l8.4-6" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4 12h15.6" />
      <path d="M13.8 6 19.8 12l-6 6" />
    </>
  ),
  check: <path d="M4.4 12.4 9.2 17.2 19.8 6.4" />,
  home: (
    <>
      <path d="M3.6 11 12 4l8.4 7" />
      <path d="M6 9.6V20h12V9.6" />
      <path d="M10 20v-5.4h4V20" />
    </>
  ),
};

export function SiteIcon({ name, className = 'h-4 w-4', strokeWidth = 1.7, style }: { name: SiteIconName; className?: string; strokeWidth?: number; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}

// Delatnost → ikonica. Prvo gledamo konkretan šablon (salon, zubar, stolar…),
// pa tek onda širu kategoriju, da bi ista kategorija imala raznolike ikone.
const TEMPLATE_ICONS: Record<string, SiteIconName> = {
  salon: 'scissors',
  'beauty-salon': 'sparkles',
  nails: 'sparkles',
  lashes: 'eye',
  massage: 'leaf',
  tattoo: 'pen',
  'pet-grooming': 'paw',

  mechanic: 'wrench',
  'car-wash': 'car',
  tire: 'disc',
  'car-rent': 'key',
  towing: 'truck',

  restaurant: 'cutlery',
  cafe: 'coffee',
  hotel: 'bed',
  catering: 'pot',
  pizzeria: 'pizza',

  dentist: 'tooth',
  physio: 'activity',
  vet: 'paw',
  psychology: 'chat',
  nutrition: 'salad',

  gym: 'dumbbell',
  pt: 'dumbbell',
  yoga: 'lotus',
  dance: 'music',
  martial: 'shield',

  language: 'book',
  'music-school': 'music',
  tutoring: 'book',
  'it-academy': 'laptop',
  kindergarten: 'smile',

  painter: 'roller',
  electrician: 'bolt',
  plumber: 'droplet',
  cleaning: 'spray',
  'ac-service': 'snowflake',
  carpenter: 'hammer',
  moving: 'box',

  accounting: 'calculator',
  lawyer: 'scale',
  realestate: 'building',
  marketing: 'chart',
  'photo-studio': 'camera',

  florist: 'flower',
  clothes: 'shirt',
  bookstore: 'book',
  jewelry: 'gem',

  custom: 'sparkles',
};

const CATEGORY_ICONS: Record<string, SiteIconName> = {
  beauty: 'sparkles',
  auto: 'wrench',
  hospitality: 'cutlery',
  health: 'activity',
  fitness: 'dumbbell',
  education: 'book',
  home: 'hammer',
  professional: 'briefcase',
  retail: 'bag',
  other: 'sparkles',
};

export function siteIconFor(draft: { templateId?: string; categoryId?: string }): SiteIconName {
  const byTemplate = TEMPLATE_ICONS[draft.templateId ?? ''];
  if (byTemplate) return byTemplate;
  return CATEGORY_ICONS[draft.categoryId ?? ''] ?? 'sparkles';
}

export function categoryIcon(id: string): SiteIconName {
  return CATEGORY_ICONS[id] ?? 'sparkles';
}
