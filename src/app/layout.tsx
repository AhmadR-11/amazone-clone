import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import SubNav from '@/components/SubNav';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: {
    default: 'Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books & More',
    template: '%s | Amazon.clone',
  },
  description:
    'Free shipping on millions of items. Get the best of Shopping and Entertainment with Prime. Enjoy exclusive deals, fast delivery, and a huge selection.',
  keywords: ['amazon', 'online shopping', 'electronics', 'books', 'deals', 'prime'],
  openGraph: {
    title: 'Amazon.clone - Online Shopping',
    description: 'Shop millions of products with free Prime shipping.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body id="top" className="bg-[#f8fafc] text-slate-900 min-h-screen flex flex-col w-full overflow-x-hidden antialiased">
        <Navbar />
        <SubNav />
        <main className="flex-1">{children}</main>
        <Footer />

        {/* Global Cart Drawer */}
        <CartDrawer />

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#131921',
              color: '#ffffff',
              fontSize: '14px',
              borderRadius: '8px',
              maxWidth: '380px',
            },
            success: {
              iconTheme: { primary: '#ffd814', secondary: '#131921' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
