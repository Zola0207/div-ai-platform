import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://div-ai-platform.vercel.app').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'DiV.ai — Web sajtovi za male biznise',
    template: '%s — DiV.ai',
  },
  description: 'Izaberite gotov šablon, prilagodite sajt i primajte upite za svoj biznis. Zakazivanje, galerija i AI tekstovi za nekoliko minuta.',
  applicationName: 'DiV.ai',
  alternates: { canonical: '/' },
  keywords: ['sajt za biznis', 'zakazivanje termina', 'website Srbija', 'AI sajt', 'izrada sajtova'],
  openGraph: {
    type: 'website',
    locale: 'sr_RS',
    url: appUrl,
    siteName: 'DiV.ai',
    title: 'DiV.ai — Web sajtovi za male biznise',
    description: 'Izaberite delatnost, unesite podatke i objavite sajt sa zakazivanjem — isti dan.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DiV.ai — Web sajtovi za male biznise',
    description: 'Izaberite delatnost, unesite podatke i objavite sajt sa zakazivanjem — isti dan.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
