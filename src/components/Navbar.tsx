'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, ChevronDown, MapPin, Menu, X, User, Package, LogOut, ShieldCheck, Tag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

interface Suggestion {
  asin: string;
  title: string;
  category: string;
  image: string;
  price?: number;
}

const CATEGORIES = [
  'All',
  'Electronics',
  'Books',
  'Kitchen',
  'Fashion',
  'Toys',
  'Sports',
];

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { totalItems, toggleCart } = useCartStore();
  const { user, fetchSession, clearUser } = useAuthStore();

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

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

  // Close suggestion panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
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

  return (
    <header className="sticky top-0 z-50">
      {/* Main Navbar */}
      <nav className="bg-amazon-dark text-white shadow-md">
        <div className="flex items-center justify-between gap-2 md:gap-4 px-3 md:px-6 py-2">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 text-white flex items-center gap-1 group">
            <div className="text-xl md:text-2xl font-black tracking-tight flex items-center">
              amazon<span className="text-amazon_orange">.clone</span>
            </div>
          </Link>

          {/* Deliver to */}
          <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0 cursor-pointer hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded">
            <MapPin size={16} className="text-gray-300 mt-0.5" />
            <div className="text-left">
              <p className="text-[11px] text-gray-400 font-medium leading-none">Deliver to</p>
              <p className="text-xs font-extrabold text-white">United States</p>
            </div>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="flex-1 relative flex items-stretch rounded-md overflow-hidden max-w-3xl">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-2 border-r border-gray-300 cursor-pointer focus:outline-none hidden sm:block"
              aria-label="Search category"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Input Form */}
            <form onSubmit={handleSearch} className="flex flex-1">
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                onFocus={() => query && setShowSuggestions(true)}
                placeholder="Search Amazon.clone"
                className="flex-1 text-gray-900 px-4 py-2 text-sm focus:outline-none"
                aria-label="Search products"
                autoComplete="off"
              />
              <button
                type="submit"
                className="bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue px-4 flex items-center justify-center transition"
                aria-label="Submit search"
              >
                <Search size={18} className="text-amazon_blue font-bold" />
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white text-gray-900 shadow-2xl rounded-b-md z-50 border border-gray-200 max-h-96 overflow-y-auto divide-y divide-gray-100">
                {isSearching && (
                  <div className="px-4 py-3 text-xs text-gray-500 animate-pulse">
                    Searching Amazon items...
                  </div>
                )}
                {!isSearching && suggestions.length === 0 && query && (
                  <div className="px-4 py-3 text-xs text-gray-500">
                    No suggestions found for "{query}"
                  </div>
                )}
                {suggestions.map((s) => (
                  <button
                    key={s.asin}
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/60 transition text-left text-xs"
                  >
                    <img
                      src={s.image}
                      alt={s.title}
                      className="w-8 h-8 object-contain flex-shrink-0 bg-gray-50 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{s.title}</p>
                      <p className="text-[10px] text-gray-500">in {s.category}</p>
                    </div>
                    {s.price && (
                      <span className="font-bold text-gray-900 flex-shrink-0">
                        ${s.price.toFixed(2)}
                      </span>
                    )}
                  </button>
                ))}
                {suggestions.length > 0 && (
                  <button
                    onClick={handleSearch}
                    className="w-full px-4 py-2.5 text-xs text-amazon_blue hover:bg-gray-50 border-t border-gray-100 text-center font-bold"
                  >
                    See all results for "{query}"
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Account Menu & Direct Links */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="text-left hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                aria-label="Account menu"
              >
                <div>
                  <p className="text-[11px] text-gray-300 leading-none">
                    Hello, {user?.name?.split(' ')[0] || 'Sign in'}
                  </p>
                  <p className="text-xs font-extrabold flex items-center gap-0.5 text-white">
                    Account & Lists <ChevronDown size={12} />
                  </p>
                </div>
              </button>

              {/* Account Dropdown Modal */}
              {showAccountMenu && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white text-gray-800 shadow-2xl rounded-md border border-gray-200 z-50 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 text-center">
                    {user ? (
                      <div>
                        <p className="text-sm font-extrabold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 mb-3 truncate">{user.email}</p>
                        <Link
                          href="/profile"
                          onClick={() => setShowAccountMenu(false)}
                          className="block w-full text-center bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold text-xs py-2 rounded shadow-sm"
                        >
                          Manage Account
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <Link
                          href="/auth/login"
                          onClick={() => setShowAccountMenu(false)}
                          className="block w-full text-center bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold text-xs py-2 rounded shadow-sm mb-2"
                        >
                          Sign in
                        </Link>
                        <span className="text-[11px] text-gray-500">
                          New customer?{' '}
                          <Link href="/auth/register" onClick={() => setShowAccountMenu(false)} className="text-amazon_blue font-bold underline">
                            Start here.
                          </Link>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 text-xs space-y-2">
                    <div className="font-bold text-gray-900 uppercase tracking-wider text-[10px] text-gray-500">
                      Your Account
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setShowAccountMenu(false)}
                      className="flex items-center gap-2 py-1.5 px-2 hover:bg-amber-50 rounded text-gray-700 font-medium"
                    >
                      <User size={14} className="text-amazon_blue" /> Your Profile & Addresses
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setShowAccountMenu(false)}
                      className="flex items-center gap-2 py-1.5 px-2 hover:bg-amber-50 rounded text-gray-700 font-medium"
                    >
                      <Package size={14} className="text-amazon_orange" /> Your Orders & Tracking
                    </Link>

                    {user && (
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-red-50 text-red-600 font-bold rounded text-left border-t border-gray-100 mt-2 pt-2"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Returns & Orders Link */}
            <Link
              href="/orders"
              className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded text-left hidden sm:block"
            >
              <p className="text-[11px] text-gray-300 leading-none">Returns</p>
              <p className="text-xs font-extrabold text-white">& Orders</p>
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={toggleCart}
              className="relative flex items-end gap-1 hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded cursor-pointer"
              aria-label={`Cart with ${cartCount} items`}
            >
              <div className="relative">
                <ShoppingCart size={28} className="text-white" />
                <span
                  className="absolute -top-1 left-2.5 min-w-[18px] h-[18px] bg-amazon_orange text-amazon_blue text-[11px] font-black rounded-full flex items-center justify-center px-1"
                >
                  {cartCount}
                </span>
              </div>
              <span className="text-xs font-extrabold pb-0.5 hidden md:block">Cart</span>
            </button>

          </div>
        </div>
      </nav>
    </header>
  );
}
