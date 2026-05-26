import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import type { Metadata } from 'next';
import { Bricolage_Grotesque, Inter_Tight } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
//@ts-ignore
import './globals.css';

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: '--font-bricolage-grotesque',
  subsets: ['latin'],
  display: 'swap',
});

const siteDescription = 'Empowering Educators with AI Intelligence';

/** Absolute URLs for OG/Twitter require a real site origin in production. */
function getMetadataBase(): URL {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) {
    return new URL(fromEnv.endsWith('/') ? fromEnv.slice(0, -1) : fromEnv);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL('http://localhost:3000');
}

/** Social preview image — R2 public URL (edge-cached) so crawlers don’t hit the app for the asset. */
const OG_IMAGE_URL =
  'https://res.cloudinary.com/ds2yghhsw/image/upload/v1779532554/ChatGPT_Image_May_23_2026_11_27_04_AM_hcvyvz.png';

const ogImage = {
  url: OG_IMAGE_URL,
  width: 1560,
  height: 956,
  type: 'image/png',
  alt: 'Lumina | AI Teacher Productivity Assistant',
} as const;

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: 'Lumina',
  title: {
    default: 'Lumina | AI Teacher Productivity Assistant',
    template: '%s · Lumina',
  },
  description: siteDescription,
  keywords: [
    'Lumina',
    'AI Teacher Assistant',
    'chatbot',
    'educational technology',
    'teacher productivity',
    'automated payments',
  ],
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  manifest: '/favicon/site.webmanifest',
  openGraph: {
    title: 'Lumina · AI Teacher Productivity Assistant',
    description: siteDescription,
    siteName: 'Lumina',
    images: [ogImage],
    type: 'website',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumina · AI Teacher Productivity Assistant',
    description: siteDescription,
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className='bg-background text-on-surface font-body-base'>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster position='top-right' />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
