'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronRight, Tag, Gift, HelpCircle, Film } from 'lucide-react';

export default function SubNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Secondary Amazon SubNav Bar (Dark Slate Navy #232f3e) */}
      <nav className="bg-[#232f3e] text-white text-xs font-semibold py-1.5 px-4 flex items-center gap-4 overflow-x-auto border-t border-gray-700/60 shadow-md">
        {/* All Hamburger Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-1.5 hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded font-bold text-sm text-white flex-shrink-0 transition"
        >
          <Menu size={18} className="text-white" />
          <span>All</span>
        </button>

        {/* SubNav Direct Category Links */}
        <div className="flex items-center gap-3 font-semibold text-xs whitespace-nowrap text-white">
          <Link
            href="/products?category=Electronics"
            className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded flex items-center gap-1.5 transition text-white"
          >
            <Film className="w-3.5 h-3.5 text-[#ffd814]" /> Prime Video
          </Link>
          <Link
            href="/products?sort=price_asc"
            className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded flex items-center gap-1.5 transition text-white"
          >
            <Tag className="w-3.5 h-3.5 text-emerald-400" /> Coupons & Deals
          </Link>
          <Link
            href="/products?sort=rating"
            className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded transition text-white"
          >
            Today's Deals
          </Link>
          <Link
            href="/products?category=Fashion"
            className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded transition text-white"
          >
            Fashion
          </Link>
          <Link
            href="/products?category=Kitchen"
            className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded transition text-white"
          >
            Home & Kitchen
          </Link>
          <Link
            href="/products?category=Toys"
            className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded flex items-center gap-1.5 transition text-white"
          >
            <Gift className="w-3.5 h-3.5 text-amber-400" /> Gift Cards & Toys
          </Link>
          <Link
            href="/orders"
            className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded transition text-white"
          >
            Registry & Orders
          </Link>
          <Link
            href="/profile"
            className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded flex items-center gap-1.5 transition text-white"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-300" /> Customer Service
          </Link>
        </div>
      </nav>

      {/* Slide-out Categories Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer Sidebar */}
          <div className="relative w-80 max-w-[85vw] bg-white text-gray-900 h-full flex flex-col shadow-2xl z-10 animate-slide-in">
            {/* Header */}
            <div className="bg-[#131921] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-base">
                <Menu size={20} className="text-[#ffd814]" /> Browse Amazon
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 hover:bg-gray-700 rounded text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm divide-y divide-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2 text-[#ffa41c]">
                  Trending & Categories
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 hover:bg-amber-50 rounded text-gray-800 font-medium"
                  >
                    All Products <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                  <Link
                    href="/products?category=Electronics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 hover:bg-amber-50 rounded text-gray-800 font-medium"
                  >
                    Electronics <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                  <Link
                    href="/products?category=Kitchen"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 hover:bg-amber-50 rounded text-gray-800 font-medium"
                  >
                    Home & Kitchen <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                  <Link
                    href="/products?category=Fashion"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 hover:bg-amber-50 rounded text-gray-800 font-medium"
                  >
                    Fashion & Clothing <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                  <Link
                    href="/products?category=Toys"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 hover:bg-amber-50 rounded text-gray-800 font-medium"
                  >
                    Toys & Games <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                  <Link
                    href="/products?category=Books"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 hover:bg-amber-50 rounded text-gray-800 font-medium"
                  >
                    Books & Media <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2 text-[#007185]">
                  Help & Settings
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 px-3 hover:bg-amber-50 rounded text-gray-800 font-medium"
                  >
                    Your Account
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 px-3 hover:bg-amber-50 rounded text-gray-800 font-medium"
                  >
                    Your Orders & Tracking
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 px-3 hover:bg-amber-50 rounded text-gray-800 font-medium"
                  >
                    Shopping Cart
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
