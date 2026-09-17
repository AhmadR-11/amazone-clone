import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import SubNav from '@/components/SubNav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books & More',
  description: 'Free shipping on millions of items. Get the best of Shopping and Entertainment with Prime.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body id="top">
        <Navbar />
        <SubNav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
