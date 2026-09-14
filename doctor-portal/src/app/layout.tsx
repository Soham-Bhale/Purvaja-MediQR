import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from '../components/ClientLayout';

export const metadata: Metadata = {
  title: 'MediQR Enterprise - Distributed Healthcare Archive & Ledger',
  description: 'Enterprise-grade, distributed, tamper-proof healthcare archive with zero-PII blockchain ledger.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
