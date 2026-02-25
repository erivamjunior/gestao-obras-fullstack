import '@aws-amplify/ui-react/styles.css';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestão de Obras',
  description: 'Plataforma fullstack com AWS Amplify Gen 2 para gestão de obras.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
