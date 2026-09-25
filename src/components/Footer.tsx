'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUp, Send, ShieldCheck, Truck, Lock, RefreshCw } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 mt-20">
      
      {/* Subtle Trust Bar */}
      <div className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-blue-400" />
            <span>Express Insured Shipping Worldwide</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Lock size={14} className="text-emerald-400" />
            <span>256-Bit Bank-Grade SSL Encryption</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <RefreshCw size={14} className="text-amber-400" />
            <span>30-Day Hassle-Free Return Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-purple-400" />
            <span>100% Authentic Verified Products</span>
          </div>
        </div>
      </div>

      {/* Main Footer Layout */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Brand & Newsletter Column */}
        <div className="lg:col-span-5 space-y-5">
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
              L
            </div>
            <span className="text-lg font-black text-white tracking-tight font-sans">
              LUXE<span className="text-blue-400">STORE</span>
            </span>
          </Link>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-normal">
            Curated marketplace offering studio acoustics, designer apparel, high-performance computing, and smart living gear.
          </p>

          {/* Clean Pill Newsletter Form */}
          <div className="pt-2">
            <h4 className="font-bold text-slate-200 mb-2.5 text-xs">Stay Informed on Product Drops</h4>
            {subscribed ? (
              <p className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 p-3 rounded-full border border-emerald-800/80 max-w-md text-center">
                Subscribed successfully to drop alerts.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address..."
                  required
                  className="bg-slate-900/90 border border-slate-800 text-white flex-1 px-4 py-2.5 rounded-full text-xs focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="bg-white hover:bg-blue-600 text-slate-950 hover:text-white px-5 py-2.5 rounded-full font-extrabold flex items-center gap-1.5 text-xs transition-all duration-300 flex-shrink-0 shadow-md cursor-pointer active:scale-95"
                >
                  <Send size={12} />
                  <span>Join</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Navigation Link Columns */}
        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 pt-2">
          <div>
            <h4 className="font-bold text-slate-200 text-xs mb-3.5 uppercase tracking-wider font-sans">
              Departments
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/products?category=Electronics" className="hover:text-white transition-colors">Audio &amp; Studio</Link></li>
              <li><Link href="/products?category=Fashion" className="hover:text-white transition-colors">Couture Fashion</Link></li>
              <li><Link href="/products?category=Kitchen" className="hover:text-white transition-colors">Smart Home</Link></li>
              <li><Link href="/products?category=Toys" className="hover:text-white transition-colors">Gaming Consoles</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Flash Drop Sales</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 text-xs mb-3.5 uppercase tracking-wider font-sans">
              Account &amp; Vault
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/profile" className="hover:text-white transition-colors">My Account Profile</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Member Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 text-xs mb-3.5 uppercase tracking-wider font-sans">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/orders" className="hover:text-white transition-colors">Shipment Tracking</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Product Directory</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Help Center &amp; Returns</Link></li>
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom Legal & Back to Top Bar */}
      <div className="border-t border-slate-900 bg-slate-950 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>© 2026 LUXESTORE Inc. All rights reserved.</p>
          
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer text-xs"
          >
            <ArrowUp size={13} />
            <span>Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

