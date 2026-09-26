'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, Gift, Zap, Flame } from 'lucide-react';

export default function SubNav() {
  return (
    <div className="w-full bg-slate-50/95 border-b border-slate-200/80 backdrop-blur-sm transition-all duration-300">
      <nav className="w-full px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-start md:justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap touch-pan-x">
        {/* Category Pill Badges Centered */}
        <Link
          href="/products?sort=rating"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 transition-all duration-200 flex-shrink-0 font-bold text-xs"
        >
          <Flame size={14} className="text-amber-600" /> Hot Deals
        </Link>
        <Link
          href="/products?category=Electronics"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-slate-800 hover:text-blue-600 transition-all duration-200 flex-shrink-0 font-bold text-xs"
        >
          <Zap size={14} className="text-blue-600" /> Electronics
        </Link>
        <Link
          href="/products?category=Fashion"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-slate-800 hover:text-blue-600 transition-all duration-200 flex-shrink-0 font-bold text-xs"
        >
          Fashion &amp; Apparel
        </Link>
        <Link
          href="/products?category=Kitchen"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-slate-800 hover:text-blue-600 transition-all duration-200 flex-shrink-0 font-bold text-xs"
        >
          Home &amp; Kitchen
        </Link>
        <Link
          href="/products?category=Toys"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-slate-800 hover:text-blue-600 transition-all duration-200 flex-shrink-0 font-bold text-xs"
        >
          <Gift size={14} className="text-purple-600" /> Gaming &amp; Toys
        </Link>
        <Link
          href="/products?sort=price_asc"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-900 transition-all duration-200 flex-shrink-0 font-bold text-xs"
        >
          <Tag size={14} className="text-emerald-600" /> Flash Sales
        </Link>
        <Link
          href="/orders"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-slate-800 hover:text-blue-600 transition-all duration-200 flex-shrink-0 font-bold text-xs"
        >
          Track Order
        </Link>
      </nav>
    </div>
  );
}
