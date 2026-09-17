'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, ChevronDown, MapPin, Menu, X } from 'lucide-react';
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
  'Home',
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
    if (q.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearching(true);
    try {
      const params = new URLSearchParams({ q, limit: '6' });
      if (cat !== 'All') params.set('category', cat);
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
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
    }, 300);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}&category=${selectedCategory !== 'All' ? selectedCategory : ''}`);
      // Log search history
      fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'search', query: query.trim(), category: selectedCategory !== 'All' ? selectedCategory : undefined }),
      }).catch(() => {});
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
      <nav className="bg-amazon-dark text-white">
        <div className="flex items-center gap-3 px-4 py-2">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 text-white">
            <div className="text-2xl font-black tracking-tight">
              amazon<span className="text-amazon-orange-btn">.clone</span>
            </div>
          </Link>

          {/* Deliver to */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0 cursor-pointer hover:outline hover:outline-1 hover:outline-white px-1 py-1 rounded">
            <MapPin size={14} className="text-gray-300 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Deliver to</p>
              <p className="text-sm font-bold">United States</p>
            </div>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="flex-1 relative flex items-stretch rounded overflow-hidden">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-2 border-r border-gray-300 cursor-pointer focus:outline-none hidden sm:block"
              aria-label="Search category"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Input */}
            <form onSubmit={handleSearch} className="flex flex-1">
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                onFocus={() => query && setShowSuggestions(true)}
                placeholder="Search Amazon.clone"
                className="flex-1 text-gray-900 px-4 py-2.5 text-sm focus:outline-none"
                aria-label="Search products"
                autoComplete="off"
              />
              <button
                type="submit"
                className="bg-amazon-orange-btn hover:bg-amazon-orange px-4 flex items-center justify-center transition-colors"
                aria-label="Submit search"
              >
                <Search size={20} className="text-gray-900" />
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white text-gray-900 shadow-2xl rounded-b-md z-50 border border-gray-200 max-h-96 overflow-y-auto animate-fade-in">
                {isSearching && (
                  <div className="px-4 py-3 text-sm text-gray-500 animate-pulse">
                    Searching...
                  </div>
                )}
                {!isSearching && suggestions.length === 0 && query && (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No suggestions for &ldquo;{query}&rdquo;
                  </div>
                )}
                {suggestions.map((s) => (
                  <button
                    key={s.asin}
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 transition-colors text-left"
                  >
                    <img
                      src={s.image}
                      alt={s.title}
                      className="w-8 h-8 object-contain flex-shrink-0 bg-gray-50"
                    />
                    <div>
                      <p className="text-sm text-gray-800 line-clamp-1">{s.title}</p>
                      <p className="text-xs text-gray-500">in {s.category}</p>
                    </div>
                    {s.price && (
                      <span className="ml-auto text-sm font-bold text-gray-800">
                        ${s.price.toFixed(2)}
                      </span>
                    )}
                  </button>
                ))}
                {suggestions.length > 0 && (
                  <button
                    onClick={handleSearch}
                    className="w-full px-4 py-2.5 text-sm text-amazon-teal hover:bg-gray-100 border-t border-gray-100 text-center font-medium"
                  >
                    See all results for &ldquo;{query}&rdquo;
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Account */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="text-left hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded flex items-center gap-1"
              aria-label="Account menu"
            >
              <div>
                <p className="text-xs text-gray-300">
                  Hello, {user?.name?.split(' ')[0] || 'Sign in'}
                </p>
                <p className="text-sm font-bold flex items-center gap-0.5">
                  Account & Lists <ChevronDown size={12} />
                </p>
              </div>
            </button>

            {/* Account Dropdown */}
            {showAccountMenu && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white text-gray-800 shadow-2xl rounded-md border border-gray-200 z-50 animate-fade-in overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  {user ? (
                    <div>
                      <p className="text-sm font-semibold mb-2">{user.name}</p>
                      <p className="text-xs text-gray-500 mb-3">{user.email}</p>
                      <Link
                        href="/profile"
                        onClick={() => setShowAccountMenu(false)}
                        className="block w-full text-center bg-amazon-yellow hover:bg-amazon-yellow-hover text-amazon-dark font-bold text-sm py-1.5 rounded-full"
                      >
                        Account
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={() => setShowAccountMenu(false)}
                      className="block w-full text-center bg-amazon-yellow hover:bg-amazon-yellow-hover text-amazon-dark font-bold text-sm py-1.5 rounded-full"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
                <div className="p-3 grid grid-cols-2 gap-1 text-xs">
                  <div>
                    <p className="font-bold mb-1.5 text-gray-900">Your Account</p>
                    <Link href="/profile" onClick={() => setShowAccountMenu(false)} className="block py-1 text-amazon-teal hover:underline">Your Account</Link>
                    <Link href="/orders" onClick={() => setShowAccountMenu(false)} className="block py-1 text-amazon-teal hover:underline">Your Orders</Link>
                    {user && (
                      <button
                        onClick={handleLogout}
                        className="block py-1 text-amazon-teal hover:underline w-full text-left"
                      >
                        Sign Out
                      </button>
                    )}
                    {!user && (
                      <Link href="/auth/register" onClick={() => setShowAccountMenu(false)} className="block py-1 text-amazon-teal hover:underline">
                        Create Account
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Orders */}
          <Link href="/orders" className="hidden md:block flex-shrink-0 hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded">
            <p className="text-xs text-gray-300">Returns</p>
            <p className="text-sm font-bold">& Orders</p>
          </Link>

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative flex-shrink-0 flex items-end gap-1 hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded"
            aria-label={`Cart with ${cartCount} items`}
          >
            <div className="relative">
              <ShoppingCart size={30} />
              <span
                className="absolute -top-1.5 left-3 min-w-5 h-5 bg-amazon-orange-btn text-amazon-dark text-xs font-black rounded-full flex items-center justify-center px-1"
                aria-live="polite"
              >
                {cartCount}
              </span>
            </div>
            <span className="text-sm font-bold pb-0.5 hidden sm:block">Cart</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
