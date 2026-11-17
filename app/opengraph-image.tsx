import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'DiV.ai — web sajtovi i aplikacije za male biznise';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const font = await readFile(join(process.cwd(), 'assets/Geist-Regular.ttf'));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)',
          color: '#ffffff',
          fontFamily: 'Geist',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
            }}
          >
            Di
          </div>
          <div style={{ fontSize: 30, letterSpacing: -0.5 }}>DiV.ai</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 68, lineHeight: 1.1, letterSpacing: -2 }}>
            Sajt spreman za svaki biznis.
          </div>
          <div style={{ marginTop: 22, fontSize: 30, color: '#c7d2fe' }}>
            Zakazivanje, galerija, upiti i AI tekstovi — za nekoliko minuta.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, fontSize: 22, color: '#a5b4fc' }}>
          <span>div-ai-platform.vercel.app</span>
          <span>·</span>
          <span>mesečno održavanje</span>
          <span>·</span>
          <span>bez provizija</span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Geist', data: font, style: 'normal', weight: 400 }] },
  );
}
