import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/i18n-context';

export const metadata: Metadata = {
  title: 'PreviOffice — Legal Practice SaaS & Social Security Management',
  description: 'Specialized SaaS CRM for Social Security Lawyers and Law Offices.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased bg-[#F8FAFC]">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
