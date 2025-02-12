import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Chicago Tree Request Map',
  description: 'Easily request trees in Chicago.',
  metadataBase: new URL('https://planttreesinchicago.com'),
  openGraph: {
    title: 'Chicago Tree Request Map',
    description: 'Easily request trees in Chicago.',
    url: 'https://planttreesinchicago.com',
    siteName: 'Chicago Tree Request Map',
    type: 'website',
    images: [
      {
        url: 'https://opengraph.b-cdn.net/production/images/7ec9f265-d424-4885-b587-8b7bacd45e38.png?token=v7-7xn4hfjNAtyjZbVKbI52XGvtoc9l6ShRsbH57EAw&height=794&width=1200&expires=33275323599',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chicago Tree Request Map',
    description: 'Easily request trees in Chicago.',
    images: [
      'https://opengraph.b-cdn.net/production/images/7ec9f265-d424-4885-b587-8b7bacd45e38.png?token=v7-7xn4hfjNAtyjZbVKbI52XGvtoc9l6ShRsbH57EAw&height=794&width=1200&expires=33275323599',
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon.ico" />
        {/* Google tag (gtag.js) */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-7D3T8VDD0Y" />
        <Script id="google-analytics">
          {`
            if (window.location.hostname === 'planttreesinchicago.com') {
              console.log('Starting GA');
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7D3T8VDD0Y');
            }
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster position="top-left" richColors />
        {children}
      </body>
    </html>
  );
}
