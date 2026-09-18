'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, ShoppingCart, ChevronDown, MapPin, Bell,
  User, Package, LogOut, Heart, ShieldCheck, Tag
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
  const [isSearching, setIsSearching] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  // Prevents hydration mismatch — Zustand persists to localStorage,
  // so server renders 0/null while client has real values.
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

  // Fetch wishlist when user is available
  useEffect(() => {
    if (user) fetchWishlist();
  }, [user, fetchWishlist]);

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setUnreadNotifs(d.unreadCount || 0))
      .catch(() => {});
  }, [user]);

  // Debounced search autocomplete
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

  // Close dropdowns on outside click
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
      className={`relative flex items-stretch rounded-md overflow-hidden shadow-sm ${
        isMobile ? 'flex sm:hidden w-full mt-1 mb-1' : 'hidden sm:flex flex-1 max-w-3xl mx-2'
      }`}
    >
      {!isMobile && (
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#f3f3f3] hover:bg-[#e6e6e6] text-gray-900 text-xs font-semibold px-3 py-2 border-r border-gray-300 cursor-pointer focus:outline-none hidden md:block"
          aria-label="Search category"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      <form onSubmit={handleSearch} className="flex flex-1">
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder="Search Amazon.clone"
          className="flex-1 text-gray-900 bg-white px-3 sm:px-4 py-2 text-sm focus:outline-none w-full"
          aria-label="Search products"
          autoComplete="off"
        />
        <button
          type="submit"
          className="bg-[#febd69] hover:bg-[#f3a847] text-[#111111] px-4 flex items-center justify-center transition border-l border-amber-300 min-w-[44px]"
          aria-label="Submit search"
        >
          <Search size={20} />
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white text-gray-900 shadow-2xl rounded-b-md z-50 border border-gray-200 max-h-80 overflow-y-auto divide-y divide-gray-100">
          {isSearching && (
            <div className="px-4 py-3 text-xs text-gray-500 animate-pulse">Searching...</div>
          )}
          {!isSearching && suggestions.length === 0 && query && (
            <div className="px-4 py-3 text-xs text-gray-500">No suggestions for &quot;{query}&quot;</div>
          )}
          {suggestions.map((s) => (
            <button
              key={s.asin}
              onClick={() => handleSuggestionClick(s)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 transition text-left text-xs"
            >
              <img src={s.image} alt={s.title} className="w-8 h-8 object-contain flex-shrink-0 bg-gray-50 rounded" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{s.title}</p>
                <p className="text-[10px] text-gray-500">in {s.category}</p>
              </div>
              {s.price && <span className="font-bold text-gray-900 flex-shrink-0">${s.price.toFixed(2)}</span>}
            </button>
          ))}
          {suggestions.length > 0 && (
            <button
              onClick={handleSearch}
              className="w-full px-4 py-2.5 text-xs text-[#007185] hover:bg-gray-50 border-t border-gray-100 text-center font-bold"
            >
              See all results for &quot;{query}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50">
      {/* Main Navbar */}
      <nav className="bg-[#131921] text-white shadow-md">
        <div className="flex flex-col px-3 md:px-6 py-2">
          <div className="flex items-center justify-between gap-2 md:gap-3">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="text-xl md:text-2xl font-black tracking-tight text-white">
                amazon<span className="text-[#ff9900]">.clone</span>
              </div>
            </Link>

            {/* Deliver to */}
            <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0 hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded cursor-pointer">
              <MapPin size={16} className="text-gray-300 mt-0.5" />
              <div>
                <p className="text-[11px] text-gray-400 font-medium leading-none">Deliver to</p>
                <p className="text-xs font-extrabold text-white">United States</p>
              </div>
            </div>

            {/* Desktop Search Bar */}
            {renderSearchForm(false)}

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

            {/* Account Dropdown */}
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="text-left hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                aria-label="Account menu"
              >
                <div>
                  <p className="text-[11px] text-gray-300 leading-none">
                    Hello, {mounted ? (user?.name?.split(' ')[0] || 'Sign in') : 'Sign in'}
                  </p>
                  <p className="text-xs font-extrabold flex items-center gap-0.5 text-white">
                    Account &amp; Lists <ChevronDown size={12} />
                  </p>
                </div>
              </button>

              {showAccountMenu && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white text-gray-800 shadow-2xl rounded-md border border-gray-200 z-50 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 text-center">
                    {user ? (
                      <div>
                        <p className="text-sm font-extrabold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 mb-3 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold mb-2">
                            <ShieldCheck size={11} /> Admin
                          </span>
                        )}
                        <Link
                          href="/profile"
                          onClick={() => setShowAccountMenu(false)}
                          className="block w-full text-center bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold text-xs py-2 rounded shadow-sm"
                        >
                          Manage Account
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <Link
                          href="/auth/login"
                          onClick={() => setShowAccountMenu(false)}
                          className="block w-full text-center bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold text-xs py-2 rounded shadow-sm mb-2"
                        >
                          Sign in
                        </Link>
                        <span className="text-[11px] text-gray-500">
                          New customer?{' '}
                          <Link href="/auth/register" onClick={() => setShowAccountMenu(false)} className="text-[#007185] font-bold underline">
                            Start here.
                          </Link>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 text-xs space-y-1">
                    <div className="font-bold uppercase tracking-wider text-[10px] text-gray-500 mb-2">Your Account</div>
                    <Link href="/profile" onClick={() => setShowAccountMenu(false)} className="flex items-center gap-2 py-1.5 px-2 hover:bg-amber-50 rounded text-gray-700 font-medium">
                      <User size={14} className="text-[#007185]" /> Profile &amp; Addresses
                    </Link>
                    <Link href="/orders" onClick={() => setShowAccountMenu(false)} className="flex items-center gap-2 py-1.5 px-2 hover:bg-amber-50 rounded text-gray-700 font-medium">
                      <Package size={14} className="text-[#ffa41c]" /> Your Orders
                    </Link>
                    <Link href="/wishlist" onClick={() => setShowAccountMenu(false)} className="flex items-center gap-2 py-1.5 px-2 hover:bg-amber-50 rounded text-gray-700 font-medium">
                      <Heart size={14} className="text-red-500" /> Wishlist
                    </Link>
                    <Link href="/notifications" onClick={() => setShowAccountMenu(false)} className="flex items-center gap-2 py-1.5 px-2 hover:bg-amber-50 rounded text-gray-700 font-medium">
                      <Bell size={14} className="text-blue-500" /> Notifications
                      {unreadNotifs > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotifs}</span>
                      )}
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setShowAccountMenu(false)} className="flex items-center gap-2 py-1.5 px-2 hover:bg-purple-50 rounded text-purple-700 font-semibold">
                        <ShieldCheck size={14} /> Admin Panel
                      </Link>
                    )}
                    {user && (
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-red-50 text-red-600 font-bold rounded text-left border-t border-gray-100 mt-2 pt-3"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Returns & Orders */}
            <Link
              href="/orders"
              className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded text-left hidden sm:block"
            >
              <p className="text-[11px] text-gray-300 leading-none">Returns</p>
              <p className="text-xs font-extrabold text-white">&amp; Orders</p>
            </Link>

            {/* Bell icon (visible when logged in) */}
            {mounted && user && (
              <Link
                href="/notifications"
                className="relative hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded hidden md:flex items-center"
                aria-label="Notifications"
              >
                <Bell size={24} className="text-white" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-0.5 right-0.5 min-w-[18px] h-[18px] bg-[#f08804] text-[#111] text-[10px] font-black rounded-full flex items-center justify-center px-1">
                    {unreadNotifs > 9 ? '9+' : unreadNotifs}
                  </span>
                )}
              </Link>
            )}

            {/* Wishlist heart (visible when logged in) */}
            {mounted && user && (
              <Link
                href="/wishlist"
                className="relative hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded hidden md:flex items-center"
                aria-label={`Wishlist with ${wishlistItems.length} items`}
              >
                <Heart size={24} className={wishlistItems.length > 0 ? 'text-white fill-red-400' : 'text-white'} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                    {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative flex items-end gap-1 hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded cursor-pointer"
              aria-label={`Cart with ${cartCount} items`}
            >
              <div className="relative">
                <ShoppingCart size={28} className="text-white" />
                <span
                  suppressHydrationWarning
                  className="absolute -top-1.5 left-2.5 min-w-[20px] h-[20px] bg-[#f08804] text-[#111] text-[11px] font-black rounded-full flex items-center justify-center px-1 shadow-sm"
                >
                  {mounted ? cartCount : 0}
                </span>
              </div>
              <span className="text-xs font-extrabold pb-0.5 hidden md:block text-white">Cart</span>
            </button>

          </div>
          </div>
          {/* Mobile Full-Width Search Bar */}
          {renderSearchForm(true)}
        </div>
      </nav>
    </header>
  );
}
