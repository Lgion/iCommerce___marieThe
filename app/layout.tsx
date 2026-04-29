// import './globals.css';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import GlobalProvider from '@/utils/GlobalProvider';
import Header from '@/app/Header';
import Navbar from '@/app/Navbar';
import '@/assets/scss/main.scss';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'iCommerce',
  description: 'Plateforme e-commerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className={inter.className}>
          <Suspense fallback={null}>
            <GlobalProvider>
              <Header />
              <Navbar />
              {children}
            </GlobalProvider>
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
