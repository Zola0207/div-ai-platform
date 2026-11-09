export type LeadEmail = {
  clientName: string;
  phone: string;
  service: string;
  date: string;
  time: string;
};

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value: string): string {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  const months = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
  return `${day}. ${months[month - 1]} ${year}.`;
}

export async function sendNewLeadEmail({
  to,
  businessName,
  lead,
}: {
  to: string;
  businessName: string;
  lead: LeadEmail;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.RESEND_FROM || 'DiV.ai <onboarding@resend.dev>';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
  const when = [formatDate(lead.date), lead.time].filter(Boolean).join(' u ');

  const rows: [string, string][] = [
    ['Klijent', lead.clientName],
    ['Telefon', lead.phone],
    ['Usluga', lead.service],
    ['Termin', when],
  ];

  const rowsHtml = rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:90px">${escapeHtml(label)}</td><td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600">${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#4f46e5;font-weight:700;margin:0 0 8px">Novi upit</p>
      <h1 style="font-size:20px;color:#0f172a;margin:0 0 4px">${escapeHtml(businessName)}</h1>
      <p style="font-size:14px;color:#475569;margin:0 0 16px">Stigao je novi zahtev preko vašeg sajta.</p>
      <table style="width:100%;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;padding:8px 0">${rowsHtml}</table>
      <a href="${escapeHtml(appUrl)}" style="display:inline-block;margin-top:20px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:12px 18px;border-radius:10px">Otvori panel</a>
      <p style="font-size:11px;color:#94a3b8;margin-top:24px">Poslato automatski sa DiV.ai. Odgovorite klijentu direktno na broj telefona.</p>
    </div>
  `;

  const text = [
    `Novi upit — ${businessName}`,
    '',
    ...rows.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`),
    '',
    appUrl ? `Panel: ${appUrl}` : '',
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Novi upit: ${lead.clientName}${lead.service ? ` — ${lead.service}` : ''}`,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error(`Resend greška ${response.status}: ${detail.slice(0, 300)}`);
    return false;
  }

  return true;
}
