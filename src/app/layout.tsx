import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PreviOffice — Legal CRM & Social Security Practice Management',
  description: 'Specialized SaaS CRM for Social Security Lawyers and Law Offices.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
