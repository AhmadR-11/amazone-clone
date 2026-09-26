'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SubNav from '@/components/SubNav';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <SubNav />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
