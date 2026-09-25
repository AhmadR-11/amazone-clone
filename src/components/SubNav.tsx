'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronRight, Tag, Gift, HelpCircle, Film, Sparkles, Zap, Flame } from 'lucide-react';

export default function SubNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Secondary Liquid Glass SubNav Bar */}
      <div className="max-w-[1440px] mx-auto mt-2 px-2 sm:px-4 lg:px-8">
        <nav className="liquid-glass-header rounded-[22px] sm:rounded-[24px] py-1.5 px-3 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
          {/* All Hamburger Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-slate-900 font-extrabold text-xs flex-shrink-0 hover:scale-105 transition-all duration-200"
          >
            <Menu size={15} />
            <span>All Categories</span>
          </button>

          {/* Category Pill Badges */}
          <div className="flex items-center gap-2 font-bold text-xs whitespace-nowrap">
            <Link
              href="/products?sort=rating"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 transition-all duration-200"
            >
              <Flame size={14} className="text-amber-600" /> Hot Deals
            </Link>
            <Link
              href="/products?category=Electronics"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-slate-800 hover:text-blue-600 transition-all duration-200"
            >
              <Zap size={14} className="text-blue-600" /> Electronics
            </Link>
            <Link
              href="/products?category=Fashion"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-slate-800 hover:text-blue-600 transition-all duration-200"
            >
              Fashion &amp; Apparel
            </Link>
            <Link
              href="/products?category=Kitchen"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-slate-800 hover:text-blue-600 transition-all duration-200"
            >
              Home &amp; Kitchen
            </Link>
            <Link
              href="/products?category=Toys"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-slate-800 hover:text-blue-600 transition-all duration-200"
            >
              <Gift size={14} className="text-purple-600" /> Gaming &amp; Toys
            </Link>
            <Link
              href="/products?sort=price_asc"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-900 transition-all duration-200"
            >
              <Tag size={14} className="text-emerald-600" /> Flash Sales
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-slate-800 hover:text-blue-600 transition-all duration-200"
            >
              Track Order
            </Link>
          </div>
        </nav>
      </div>

      {/* Slide-out Categories Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer Sidebar */}
          <div className="relative w-80 max-w-[85vw] bg-white text-slate-900 h-full flex flex-col shadow-2xl z-10 border-r border-slate-200">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base font-sans">
                <Sparkles size={18} className="text-blue-400" /> Explore Catalog
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm divide-y divide-slate-100">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider mb-3 text-slate-400">
                  Featured Departments
                </h3>
                <div className="space-y-1">
                  {[
                    { label: 'All Products', href: '/products' },
                    { label: 'Electronics & Gadgets', href: '/products?category=Electronics' },
                    { label: 'Home & Kitchen Essentials', href: '/products?category=Kitchen' },
                    { label: 'Fashion & Luxury Wear', href: '/products?category=Fashion' },
                    { label: 'Toys, Gaming & Hobbies', href: '/products?category=Toys' },
                    { label: 'Books & Digital Media', href: '/products?category=Books' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 rounded-xl text-slate-800 font-medium transition-colors group"
                    >
                      <span className="group-hover:text-blue-600 transition-colors">{item.label}</span>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-bold text-xs uppercase tracking-wider mb-3 text-slate-400">
                  Account Quick Access
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-3 hover:bg-slate-50 rounded-xl text-slate-800 font-medium transition-colors"
                  >
                    User Dashboard &amp; Settings
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-3 hover:bg-slate-50 rounded-xl text-slate-800 font-medium transition-colors"
                  >
                    Orders &amp; Tracking History
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-3 hover:bg-slate-50 rounded-xl text-slate-800 font-medium transition-colors"
                  >
                    Saved Wishlist Items
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

