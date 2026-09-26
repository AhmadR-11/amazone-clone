'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

interface Suggestion {
  asin: string;
  title: string;
  category: string;
  image: string;
  price?: number;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  category?: string;
}

export default function SearchAutocomplete({
  placeholder = 'Search Amazon...',
  className = '',
  category = 'All',
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ q: q.trim(), limit: '5' });
      if (category && category !== 'All') params.append('category', category);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Autocomplete fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 250);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}${category !== 'All' ? `&category=${category}` : ''}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amazon_orange"
        />
        <button
          type="submit"
          className="bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue px-5 py-2.5 rounded-r-md transition flex items-center justify-center border border-l-0 border-amazon_yellow"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-amazon_blue" />
          ) : (
            <Search className="w-4 h-4 text-amazon_blue font-bold" />
          )}
        </button>
      </form>

      {/* Dropdown Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-xl z-50 max-h-80 overflow-y-auto divide-y divide-gray-100">
          {suggestions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-500">No matching products found</div>
          ) : (
            suggestions.map((item) => (
              <div
                key={item.asin}
                onClick={() => {
                  setShowSuggestions(false);
                  router.push(`/product/${item.asin}`);
                }}
                className="px-4 py-2.5 hover:bg-amber-50 cursor-pointer flex items-center justify-between gap-3 text-xs transition"
              >
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.title} className="w-8 h-8 object-contain" />
                  <div className="line-clamp-1 font-medium text-gray-800">{item.title}</div>
                </div>
                {item.price && (
                  <span className="font-bold text-gray-900 flex-shrink-0">${item.price.toFixed(2)}</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
