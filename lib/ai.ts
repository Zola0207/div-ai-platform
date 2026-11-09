export type AiService = {
  name: string;
  description: string;
  price: string;
};

export type AiFaq = {
  question: string;
  answer: string;
};

export type AiSiteContent = {
  tagline: string;
  description: string;
  services: AiService[];
  faq: AiFaq[];
  seoTitle: string;
  seoDescription: string;
};

export type AiInput = {
  businessName: string;
  businessType: string;
  bookingType: string;
};

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

function fallbackServices(businessType: string): AiService[] {
  const label = businessType || 'Usluga';
  return [
    { name: `${label} — osnovni paket`, description: 'Kratak opis onoga što ulazi u osnovnu uslugu.', price: 'po dogovoru' },
    { name: `${label} — standard`, description: 'Proširena usluga za klijente kojima treba više.', price: 'po dogovoru' },
    { name: 'Konsultacija', description: 'Razgovor o potrebama pre početka saradnje.', price: 'besplatno' },
  ];
}

function fallbackFaq(businessName: string): AiFaq[] {
  return [
    { question: 'Kako mogu da zakažem termin?', answer: `Najlakše kroz formu na sajtu ${businessName}, ili nas pozovite telefonom.` },
    { question: 'Koje je radno vreme?', answer: 'Radnim danima od 09 do 17 časova, subotom do 14.' },
    { question: 'Da li je potrebna najava?', answer: 'Preporučujemo da se najavite unapred kako bismo vas primili bez čekanja.' },
  ];
}

function normalize(raw: unknown, input: AiInput): AiSiteContent | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;

  const services = Array.isArray(value.services)
    ? value.services
        .map((item) => {
          const service = (item ?? {}) as Record<string, unknown>;
          const name = text(service.name, 60);
          if (!name) return null;
          return {
            name,
            description: text(service.description, 160),
            price: text(service.price, 40) || 'po dogovoru',
          };
        })
        .filter((item): item is AiService => item !== null)
        .slice(0, 3)
    : [];

  const faq = Array.isArray(value.faq)
    ? value.faq
        .map((item) => {
          const entry = (item ?? {}) as Record<string, unknown>;
          const question = text(entry.question, 120);
          const answer = text(entry.answer, 300);
          if (!question || !answer) return null;
          return { question, answer };
        })
        .filter((item): item is AiFaq => item !== null)
        .slice(0, 3)
    : [];

  const tagline = text(value.tagline, 70);
  const description = text(value.description, 320);

  if (!tagline || !description) return null;

  while (services.length < 3) services.push(fallbackServices(input.businessType)[services.length]);
  while (faq.length < 3) faq.push(fallbackFaq(input.businessName)[faq.length]);

  return {
    tagline,
    description,
    services,
    faq,
    seoTitle: text(value.seoTitle, 70) || `${input.businessName} — ${input.businessType || 'usluge'}`,
    seoDescription: text(value.seoDescription, 170) || description.slice(0, 155),
  };
}

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    tagline: { type: 'STRING' },
    description: { type: 'STRING' },
    services: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          description: { type: 'STRING' },
          price: { type: 'STRING' },
        },
        required: ['name', 'description', 'price'],
      },
    },
    faq: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          question: { type: 'STRING' },
          answer: { type: 'STRING' },
        },
        required: ['question', 'answer'],
      },
    },
    seoTitle: { type: 'STRING' },
    seoDescription: { type: 'STRING' },
  },
  required: ['tagline', 'description', 'services', 'faq', 'seoTitle', 'seoDescription'],
};

function buildPrompt(input: AiInput): string {
  return [
    'Ti si iskusan copywriter za male biznise u Srbiji.',
    'Napiši sadržaj za sajt na srpskom jeziku (latinica).',
    '',
    `Naziv biznisa: ${input.businessName}`,
    `Delatnost: ${input.businessType || 'nije navedena'}`,
    `Način prijema klijenata: ${input.bookingType}`,
    '',
    'Pravila:',
    '- ton: profesionalan i topao, bez preteranih obećanja i bez izmišljenih nagrada',
    '- tagline: najviše 60 znakova',
    '- description: 2-3 rečenice, najviše 300 znakova',
    '- services: tačno 3 usluge koje su realne za tu delatnost, cena u formatu "od 1.500 RSD" ili "po dogovoru"',
    '- faq: tačno 3 pitanja sa kratkim odgovorima',
    '- seoTitle: najviše 60 znakova',
    '- seoDescription: najviše 155 znakova',
    '- ne izmišljaj adresu, telefon, email ni imena zaposlenih',
    '- vrati isključivo JSON po zadatoj šemi, bez komentara',
  ].join('\n');
}

export async function generateSiteContent(input: AiInput): Promise<AiSiteContent> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI nije povezan. Dodajte GEMINI_API_KEY u okruženje.');
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const response = await fetch(`${ENDPOINT}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(input) }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    if (response.status === 429) {
      throw new Error('AI kvota je trenutno potrošena. Pokušajte ponovo za nekoliko minuta.');
    }
    if (response.status === 404) {
      throw new Error(`Model "${model}" nije dostupan. Postavite GEMINI_MODEL na ispravan naziv.`);
    }
    throw new Error(`AI servis je vratio grešku ${response.status}.${detail ? '' : ''}`);
  }

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    throw new Error('AI nije vratio sadržaj. Pokušajte ponovo.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('AI je vratio neispravan odgovor. Pokušajte ponovo.');
  }

  const content = normalize(parsed, input);
  if (!content) {
    throw new Error('AI odgovor nije imao potrebne podatke. Pokušajte ponovo.');
  }
  return content;
}
