import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from '../components/ClientLayout';

export const metadata: Metadata = {
  title: 'MediQR — Sovereign Roadside Triage & Cryptographic Ledger',
  description: 'Zero-trust roadside emergency healthcare platform with air-gapped optical triage and blockchain consensus.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased overflow-x-hidden min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
