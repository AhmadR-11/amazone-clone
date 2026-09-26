'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, ShoppingCart, ChevronDown, MapPin, Bell,
  User, Package, LogOut, Heart, ShieldCheck, Sparkles, SlidersHorizontal,
  Menu, X, ChevronRight, Zap, Flame, Tag, Gift, BookOpen, ShoppingBag, Home, Trophy, LayoutGrid
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';

interface Suggestion {
  asin: string;
  title: string;
  category: string;
  image: string;
  price?: number;
}

const CATEGORIES = ['All', 'Electronics', 'Books', 'Kitchen', 'Fashion', 'Toys', 'Sports'];

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [mounted, setMounted] = useState(false);

  const { totalItems, toggleCart } = useCartStore();
  const { user, fetchSession, clearUser } = useAuthStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();

  const searchRef = useRef<HTMLDivElement>(null);
  const searchRefMobile = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user, fetchWishlist]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setUnreadNotifs(d.unreadCount || 0))
      .catch(() => {});
  }, [user]);

  const fetchSuggestions = useCallback(async (q: string, cat: string) => {
    if (q.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearching(true);
    try {
      const params = new URLSearchParams({ q: q.trim(), limit: '6' });
      if (cat !== 'All') params.set('category', cat);
      const res = await fetch(`/api/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val, selectedCategory);
    }, 250);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}${selectedCategory !== 'All' ? `&category=${selectedCategory}` : ''}`);
    } else {
      router.push('/products');
    }
  };

  const handleSuggestionClick = (s: Suggestion) => {
    setShowSuggestions(false);
    setQuery(s.title);
    router.push(`/product/${s.asin}`);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInSearch =
        (searchRef.current && searchRef.current.contains(target)) ||
        (searchRefMobile.current && searchRefMobile.current.contains(target));
      if (!clickedInSearch) {
        setShowSuggestions(false);
      }
      if (accountRef.current && !accountRef.current.contains(target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSideMenuOpen(false);
    };
    if (sideMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKey);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [sideMenuOpen]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    clearUser();
    setShowAccountMenu(false);
    router.push('/');
    router.refresh();
  };

  const cartCount = totalItems();
  const isAdmin = (user as any)?.role === 'admin';

  const renderSearchForm = (isMobile = false) => (
    <div
      ref={isMobile ? searchRefMobile : searchRef}
      className={`relative flex items-center ${
        isMobile ? 'flex sm:hidden w-full mt-2' : 'hidden sm:flex flex-1 max-w-2xl mx-4 lg:mx-6'
      }`}
    >
      <div className="relative w-full flex items-center rounded-full liquid-glass-search border border-slate-200/90 shadow-inner transition-all duration-200 p-1">
        {!isMobile && (
          <div className="relative hidden md:flex items-center flex-shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-200/50 hover:bg-slate-200/80 text-slate-800 text-xs font-bold pl-4 pr-7 py-2 rounded-l-full border-r border-slate-300/70 cursor-pointer focus:outline-none appearance-none transition-colors"
              aria-label="Search category"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-white text-slate-900 font-semibold">{c}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 text-slate-500 pointer-events-none" />
          </div>
        )}

        <form onSubmit={handleSearch} className="flex flex-1 items-center">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => query && setShowSuggestions(true)}
            placeholder="Search products, brands and tech..."
            className="flex-1 min-w-0 text-slate-900 font-medium bg-transparent px-3 sm:px-4 py-1.5 text-xs sm:text-sm focus:outline-none placeholder:text-slate-400 placeholder:font-normal w-full"
            aria-label="Search products"
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-slate-950 hover:bg-blue-600 rounded-full p-2.5 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-all duration-200 flex-shrink-0"
            aria-label="Submit search"
          >
            <Search size={14} />
          </button>
        </form>
      </div>

      {/* Autocomplete Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-900 shadow-2xl rounded-2xl z-50 border border-slate-200 max-h-80 overflow-y-auto divide-y divide-slate-100">
          {isSearching && (
            <div className="px-4 py-3 text-xs text-blue-600 animate-pulse flex items-center gap-2">
              <Sparkles size={14} /> Searching product catalog...
            </div>
          )}
          {!isSearching && suggestions.length === 0 && query && (
            <div className="px-4 py-3 text-xs text-slate-500">No matching results for &quot;{query}&quot;</div>
          )}
          {suggestions.map((s) => (
            <button
              key={s.asin}
              onClick={() => handleSuggestionClick(s)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left text-xs group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 p-1 flex items-center justify-center border border-slate-200">
                <img src={s.image} alt={s.title} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{s.title}</p>
                <p className="text-[10px] text-slate-500">Category: {s.category}</p>
              </div>
              {s.price && (
                <span className="font-bold text-slate-900 flex-shrink-0">
                  ${s.price.toFixed(2)}
                </span>
              )}
            </button>
          ))}
          {suggestions.length > 0 && (
            <button
              onClick={handleSearch}
              className="w-full px-4 py-3 text-xs text-blue-600 hover:bg-blue-50 text-center font-bold tracking-wide"
            >
              Explore all results for &quot;{query}&quot; &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all duration-300">
      <nav className="w-full px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all duration-300">
        <div className="flex items-center justify-between gap-2 md:gap-3 lg:gap-4">

          {/* Left Section: All Categories Menu Trigger + Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* All Categories Side Menu Trigger */}
            <button
              onClick={() => setSideMenuOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full liquid-glass-pill text-slate-900 font-extrabold text-xs hover:bg-slate-100 hover:text-blue-600 active:scale-95 transition-all cursor-pointer"
              aria-label="Open All Categories Menu"
            >
              <Menu size={16} className="text-slate-900" />
              <span className="hidden sm:inline font-bold">All Categories</span>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950 text-white flex items-center justify-center font-extrabold text-base sm:text-lg shadow-md group-hover:bg-blue-600 group-hover:scale-105 transition-all duration-300">
                L
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 font-sans leading-none">
                  LUXE<span className="text-blue-600">STORE</span>
                </span>
                <span className="text-[7.5px] sm:text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5 hidden xs:block">Premium Retail</span>
              </div>
            </Link>
          </div>

          {/* Deliver to Location Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs transition-all duration-200 cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <MapPin size={13} />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] text-slate-400 font-semibold">Deliver to</p>
              <p className="font-extrabold text-slate-800 text-xs">Global Express</p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          {renderSearchForm(false)}

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">

            {/* User Account Menu */}
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full liquid-glass-pill text-xs font-bold text-slate-800 transition-all duration-200"
                aria-label="Account menu"
              >
                <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center font-black text-xs shadow-xs overflow-hidden">
                  {mounted && (user as any)?.avatar ? (
                    <img src={(user as any).avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : mounted && user?.name ? (
                    user.name[0].toUpperCase()
                  ) : (
                    <User size={13} />
                  )}
                </div>
                <span className="hidden sm:inline-block max-w-[90px] truncate text-slate-800 font-bold">
                  {mounted && user?.name ? user.name.split(' ')[0] : 'Sign In'}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showAccountMenu && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl text-slate-900 shadow-2xl rounded-2xl z-50 overflow-hidden border border-slate-200/90 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 text-center">
                    {user ? (
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 mb-3 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-semibold mb-2">
                            <ShieldCheck size={12} /> Store Administrator
                          </span>
                        )}
                        <Link
                          href="/profile"
                          onClick={() => setShowAccountMenu(false)}
                          className="block w-full text-center bg-slate-900 hover:bg-blue-600 text-white text-xs py-2 rounded-xl shadow-xs font-semibold transition-colors"
                        >
                          Account Dashboard
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <Link
                          href="/auth/login"
                          onClick={() => setShowAccountMenu(false)}
                          className="block w-full text-center bg-slate-900 hover:bg-blue-600 text-white text-xs py-2 rounded-xl shadow-xs font-semibold mb-2 transition-colors"
                        >
                          Sign In to Account
                        </Link>
                        <span className="text-[11px] text-slate-500">
                          New client?{' '}
                          <Link href="/auth/register" onClick={() => setShowAccountMenu(false)} className="text-blue-600 font-bold hover:underline">
                            Register now
                          </Link>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-2 text-xs space-y-0.5">
                    <Link href="/profile" onClick={() => setShowAccountMenu(false)} className="flex items-center gap-2.5 py-2 px-3 hover:bg-slate-50 rounded-xl text-slate-700 font-medium transition-colors">
                      <User size={15} className="text-blue-600" /> My Profile
                    </Link>
                    <Link href="/profile#addresses" onClick={() => setShowAccountMenu(false)} className="flex items-center gap-2.5 py-2 px-3 hover:bg-slate-50 rounded-xl text-slate-700 font-medium transition-colors">
                      <MapPin size={15} className="text-emerald-600" /> Saved Addresses
                    </Link>
                    <Link href="/notifications" onClick={() => setShowAccountMenu(false)} className="flex items-center gap-2.5 py-2 px-3 hover:bg-slate-50 rounded-xl text-slate-700 font-medium transition-colors">
                      <Bell size={15} className="text-amber-500" /> Notifications
                      {unreadNotifs > 0 && (
                        <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadNotifs}</span>
                      )}
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setShowAccountMenu(false)} className="flex items-center gap-2.5 py-2 px-3 hover:bg-purple-50 rounded-xl text-purple-700 font-semibold border border-purple-100 mt-1">
                        <ShieldCheck size={15} className="text-purple-600" /> Admin Console
                      </Link>
                    )}
                    {user && (
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 py-2 px-3 hover:bg-rose-50 text-rose-600 font-semibold rounded-xl text-left border-t border-slate-100 mt-1 pt-2 transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Orders Link */}
            <Link
              href="/orders"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs font-bold text-slate-700 hover:text-slate-900 transition-all"
            >
              <Package size={14} className="text-slate-500" />
              <span>Orders</span>
            </Link>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative p-2 sm:p-2.5 rounded-full liquid-glass-pill text-slate-700 hover:text-rose-600 transition-all flex items-center justify-center"
              aria-label="Wishlist"
            >
              <Heart size={16} className={wishlistItems.length > 0 ? 'fill-rose-500 text-rose-500' : ''} />
              {mounted && wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-950 hover:bg-blue-600 text-white font-extrabold text-xs shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              aria-label={`Cart with ${cartCount} items`}
            >
              <div className="relative flex items-center">
                <ShoppingCart size={15} />
                <span
                  suppressHydrationWarning
                  className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] bg-amber-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-slate-950 shadow-xs"
                >
                  {mounted ? cartCount : 0}
                </span>
              </div>
              <span className="hidden sm:inline-block ml-1 tracking-wide font-extrabold">Cart</span>
            </button>

          </div>
        </div>

        {/* Mobile Full-Width Search Bar */}
        {renderSearchForm(true)}
      </nav>

      {/* Slide-out Categories Drawer (Side Menu rendered via Portal into body to bypass header containment) */}
      {mounted && sideMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex" role="dialog" aria-modal="true" aria-label="Catalog and Categories Menu">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSideMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sidebar */}
          <div className="relative w-[340px] sm:w-[380px] max-w-[85vw] bg-white text-slate-900 h-screen flex flex-col shadow-2xl z-10 border-r border-slate-200 animate-in slide-in-from-left duration-300 ease-out overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-4.5 bg-slate-950 text-white flex items-center justify-between flex-shrink-0 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
                  L
                </div>
                <div>
                  <div className="font-black text-sm sm:text-base tracking-tight font-sans text-white leading-none">
                    LUXE<span className="text-blue-400">STORE</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Catalog &amp; Navigation</span>
                </div>
              </div>
              <button
                onClick={() => setSideMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-800 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* User Greeting Bar */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200/80 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0 ring-2 ring-white shadow-xs">
                  {(user as any)?.avatar ? (
                    <img src={(user as any).avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : user?.name ? (
                    user.name[0].toUpperCase()
                  ) : (
                    <User size={15} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-950 truncate">
                    Hello, {user?.name ? user.name.split(' ')[0] : 'Guest'}
                  </p>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    {user ? 'LUXESTORE VIP Member' : 'Sign in to explore offers'}
                  </p>
                </div>
              </div>
              {user ? (
                <Link
                  href="/profile"
                  onClick={() => setSideMenuOpen(false)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex-shrink-0"
                >
                  Profile
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setSideMenuOpen(false)}
                  className="px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-bold hover:bg-blue-600 transition-colors flex-shrink-0 shadow-2xs"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Scrollable Menu Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 text-sm divide-y divide-slate-100 no-scrollbar">
              {/* Highlights & Flash Deals */}
              <div>
                <h3 className="font-black text-[10.5px] uppercase tracking-wider mb-2 text-slate-400 font-mono">
                  Highlights &amp; Offers
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/products?sort=rating"
                    onClick={() => setSideMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-amber-500/10 text-amber-950 font-bold transition-colors group text-xs sm:text-sm border border-transparent hover:border-amber-200"
                  >
                    <span className="flex items-center gap-2.5">
                      <Flame size={15} className="text-amber-600" />
                      <span>Hot Deals Today</span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 px-2 py-0.5 rounded-full">
                      Up to 50% Off
                    </span>
                  </Link>
                  <Link
                    href="/products?sort=price_asc"
                    onClick={() => setSideMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-emerald-500/10 text-emerald-950 font-bold transition-colors group text-xs sm:text-sm border border-transparent hover:border-emerald-200"
                  >
                    <span className="flex items-center gap-2.5">
                      <Tag size={15} className="text-emerald-600" />
                      <span>Flash Sales</span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-800 px-2 py-0.5 rounded-full">
                      Lightning
                    </span>
                  </Link>
                </div>
              </div>

              {/* Featured Departments */}
              <div className="pt-4">
                <h3 className="font-black text-[10.5px] uppercase tracking-wider mb-2 text-slate-400 font-mono">
                  Shop By Department
                </h3>
                <div className="space-y-1">
                  {[
                    { label: 'All Products', href: '/products', icon: LayoutGrid },
                    { label: 'Electronics & Gadgets', href: '/products?category=Electronics', icon: Zap },
                    { label: 'Home & Kitchen Essentials', href: '/products?category=Kitchen', icon: Home },
                    { label: 'Fashion & Luxury Apparel', href: '/products?category=Fashion', icon: ShoppingBag },
                    { label: 'Sports & Outdoor Fitness', href: '/products?category=Sports', icon: Trophy },
                    { label: 'Toys, Gaming & Hobbies', href: '/products?category=Toys', icon: Gift },
                    { label: 'Books & Literature', href: '/products?category=Books', icon: BookOpen },
                  ].map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setSideMenuOpen(false)}
                        className="flex items-center justify-between py-2 px-3 hover:bg-slate-100/80 rounded-xl text-slate-800 font-medium transition-colors group text-xs sm:text-sm"
                      >
                        <span className="flex items-center gap-2.5 group-hover:text-blue-600 transition-colors">
                          <ItemIcon size={15} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
                          <span>{item.label}</span>
                        </span>
                        <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Account & Orders */}
              <div className="pt-4">
                <h3 className="font-black text-[10.5px] uppercase tracking-wider mb-2 text-slate-400 font-mono">
                  Your Account &amp; Orders
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setSideMenuOpen(false)}
                    className="flex items-center gap-2.5 py-2 px-3 hover:bg-slate-100/80 rounded-xl text-slate-800 font-medium transition-colors text-xs sm:text-sm group"
                  >
                    <User size={15} className="text-blue-600" />
                    <span className="group-hover:text-blue-600">User Profile &amp; Settings</span>
                  </Link>
                  <Link
                    href="/profile#addresses"
                    onClick={() => setSideMenuOpen(false)}
                    className="flex items-center gap-2.5 py-2 px-3 hover:bg-slate-100/80 rounded-xl text-slate-800 font-medium transition-colors text-xs sm:text-sm group"
                  >
                    <MapPin size={15} className="text-emerald-600" />
                    <span className="group-hover:text-emerald-700">Saved Delivery Addresses</span>
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setSideMenuOpen(false)}
                    className="flex items-center gap-2.5 py-2 px-3 hover:bg-slate-100/80 rounded-xl text-slate-800 font-medium transition-colors text-xs sm:text-sm group"
                  >
                    <Package size={15} className="text-indigo-600" />
                    <span className="group-hover:text-indigo-700">Orders &amp; Shipment Tracking</span>
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setSideMenuOpen(false)}
                    className="flex items-center gap-2.5 py-2 px-3 hover:bg-slate-100/80 rounded-xl text-slate-800 font-medium transition-colors text-xs sm:text-sm group"
                  >
                    <Heart size={15} className="text-rose-500" />
                    <span className="group-hover:text-rose-600">Saved Wishlist Items</span>
                  </Link>
                  <Link
                    href="/notifications"
                    onClick={() => setSideMenuOpen(false)}
                    className="flex items-center gap-2.5 py-2 px-3 hover:bg-slate-100/80 rounded-xl text-slate-800 font-medium transition-colors text-xs sm:text-sm group"
                  >
                    <Bell size={15} className="text-amber-500" />
                    <span className="group-hover:text-amber-600">Notifications &amp; Alerts</span>
                  </Link>
                </div>
              </div>

              {/* Sign In / Sign Out */}
              <div className="pt-4 pb-2">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out of Account</span>
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setSideMenuOpen(false)}
                    className="block w-full py-2.5 px-4 bg-slate-950 hover:bg-blue-600 text-white text-center rounded-xl font-bold text-xs transition-colors shadow-xs"
                  >
                    Sign In to Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}

