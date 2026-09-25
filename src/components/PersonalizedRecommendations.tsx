'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Sparkles, Zap, Flame, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function PersonalizedRecommendations() {
  const { items, totalItems, toggleCart } = useCartStore();
  const itemCount = totalItems();

  return (
    <section className="max-w-[1440px] mx-auto my-12 px-2 sm:px-4 lg:px-8">
      <div className="liquid-glass-header p-6 sm:p-9 rounded-[28px] sm:rounded-[32px] shadow-xl relative overflow-hidden transition-all duration-300">
        
        {/* Main Grid: Cart History (Left) + Personalization & Shortcuts (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Cart History Vault */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center font-black shadow-md flex-shrink-0">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 font-sans tracking-tight flex items-center gap-2">
                    <span>Cart History Vault</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 text-[11px] font-extrabold">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Items queued in your current shopping session.</p>
                </div>
              </div>

              {itemCount > 0 && (
                <button
                  onClick={toggleCart}
                  className="px-4 py-2 rounded-full bg-slate-950 hover:bg-blue-600 text-white font-extrabold text-xs tracking-wider transition-all duration-300 shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
                >
                  <span>Checkout</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

            {/* Cart Items Strip or Empty State */}
            {itemCount > 0 ? (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                {items.map((cartItem) => (
                  <div
                    key={cartItem.asin}
                    className="w-48 flex-shrink-0 liquid-glass-pill rounded-[20px] p-3 border border-white/90 flex items-center gap-3 shadow-xs"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-100 flex-shrink-0">
                      <img src={cartItem.image} alt={cartItem.title} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{cartItem.title}</h4>
                      <p className="text-[11px] font-black text-blue-600 mt-0.5">${cartItem.price.toFixed(2)}</p>
                      <span className="text-[10px] text-slate-400 font-bold">Qty: {cartItem.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-[20px] bg-white/40 border border-slate-200/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-slate-400" />
                  <p className="text-xs text-slate-600 font-medium">Your cart vault is currently empty. Items added to cart will appear here.</p>
                </div>
                <Link
                  href="/products"
                  className="px-4 py-1.5 rounded-full liquid-glass-pill text-xs font-bold text-blue-600 hover:text-blue-700 whitespace-nowrap"
                >
                  Browse Items &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Vertical Divider for Desktop */}
          <div className="hidden lg:block w-px h-full bg-slate-200/60 mx-auto" />

          {/* Right Column: Personalization & Recommended Shortcuts */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 border border-blue-400/20 text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles size={13} className="text-blue-600" /> Personalization Engine
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-sans tracking-tight">
                Tailored Collections &amp; Quick Access
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Explore tailored departments curated based on your current browsing session.
              </p>
            </div>

            {/* Quick Department Shortcuts */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                href="/products?category=Electronics"
                className="px-3.5 py-2 rounded-full liquid-glass-pill text-xs font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Zap size={13} className="text-blue-600" /> Audio Studio
              </Link>
              <Link
                href="/products?category=Fashion"
                className="px-3.5 py-2 rounded-full liquid-glass-pill text-xs font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Flame size={13} className="text-amber-600" /> Couture Fashion
              </Link>
              <Link
                href="/products?category=Kitchen"
                className="px-3.5 py-2 rounded-full liquid-glass-pill text-xs font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1.5 shadow-xs transition-all"
              >
                <ShieldCheck size={13} className="text-emerald-600" /> Smart Living
              </Link>
              <Link
                href="/products"
                className="px-4 py-2 rounded-full bg-slate-950 hover:bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              >
                Catalog &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
