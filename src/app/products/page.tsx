'use client';

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import { SlidersHorizontal, ChevronDown, Check, X, RotateCcw } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured Items' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Avg. Customer Review' },
  { value: 'reviews', label: 'Most Reviews' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([
    'Electronics',
    'Books',
    'Kitchen',
    'Fashion',
    'Toys',
    'Sports',
  ]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('featured');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [minRating, setMinRating] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const searchQuery = searchParams?.get('q') || '';

  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setIsFiltersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '24',
        sort,
      });
      if (selectedCategory) params.set('category', selectedCategory);
      if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
      if (priceRange[1] < 2000) params.set('maxPrice', String(priceRange[1]));
      if (minRating > 0) params.set('minRating', String(minRating));
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();

      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, sort, selectedCategory, priceRange, minRating, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [sort, selectedCategory, minRating, priceRange]);

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 2000]);
    setMinRating(0);
    setSort('featured');
    setPage(1);
  };

  const activeFilterCount =
    (priceRange[0] > 0 || priceRange[1] < 2000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (sort !== 'featured' ? 1 : 0);

  const hasFilters = activeFilterCount > 0 || selectedCategory;

  const PRICE_OPTIONS: [number, number, string][] = [
    [0, 2000, 'All Prices'],
    [0, 25, 'Under $25'],
    [25, 50, '$25 to $50'],
    [50, 100, '$50 to $100'],
    [100, 200, '$100 to $200'],
    [200, 2000, '$200 & Above'],
  ];

  const getPriceLabel = () => {
    const match = PRICE_OPTIONS.find(([min, max]) => priceRange[0] === min && priceRange[1] === max);
    return match ? match[2] : `$${priceRange[0]} - $${priceRange[1]}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-6">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Unified Executive Catalog Console (Single Sleek Row: Title + Quick Menu + Filters) */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 sm:px-4 mb-6 border border-slate-200/90 shadow-xs">
          
          <div className="flex items-center justify-between gap-2.5 sm:gap-4 w-full">
            
            {/* 1. Left: Title & Items Counter */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
              <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-950 font-sans tracking-tight whitespace-nowrap">
                {searchQuery ? `Results for "${searchQuery}"` : (selectedCategory ? selectedCategory : 'All Products')}
              </h1>
              {!loading && (
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                  {total.toLocaleString()} Products
                </span>
              )}
            </div>

            {/* 2. Middle: Quick Menu Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none touch-pan-x flex-1 min-w-0 py-0.5">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  !selectedCategory
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 3. Right: Filters Button Trigger & Dropdown */}
            <div ref={filtersRef} className="relative flex-shrink-0">
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-black transition-all cursor-pointer border ${
                  activeFilterCount > 0
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
                }`}
                aria-expanded={isFiltersOpen}
                aria-label="Open filter settings"
              >
                <SlidersHorizontal size={13} className={activeFilterCount > 0 ? 'text-blue-400' : 'text-slate-600'} />
                <span className="hidden xs:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown size={13} className={`transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Popover Filter Menu */}
              {isFiltersOpen && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] bg-white text-slate-900 shadow-2xl rounded-2xl border border-slate-200/90 z-50 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={14} className="text-blue-600" />
                      <span className="font-extrabold text-sm text-slate-900">Filter &amp; Sort Products</span>
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={11} /> Reset All
                      </button>
                    )}
                  </div>

                  {/* Section: Sort By (Cleanly housed inside Filters) */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block mb-2">
                      Sort By
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {SORT_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => setSort(o.value)}
                          className={`px-3 py-1.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                            sort === o.value
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate">{o.label}</span>
                          {sort === o.value && <Check size={12} className="text-blue-400 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section: Price Range */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block mb-2">
                      Price Range
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PRICE_OPTIONS.map(([min, max, label]) => {
                        const isSelected = priceRange[0] === min && priceRange[1] === max;
                        return (
                          <button
                            key={label}
                            onClick={() => setPriceRange([min, max])}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section: Rating */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block mb-2">
                      Customer Rating
                    </label>
                    <div className="flex gap-1.5">
                      {[
                        [0, 'All Ratings'],
                        [4, '4★ & up'],
                        [3, '3★ & up'],
                      ].map(([r, label]) => {
                        const isSelected = minRating === r;
                        return (
                          <button
                            key={r}
                            onClick={() => setMinRating(Number(r))}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {total} results found
                    </span>
                    <button
                      onClick={() => setIsFiltersOpen(false)}
                      className="bg-slate-950 hover:bg-blue-600 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Apply &amp; Close
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Active Filter Chips (if any active) */}
          {activeFilterCount > 0 && (
            <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold">Active Filters:</span>
              {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                  Price: {getPriceLabel()}
                  <button onClick={() => setPriceRange([0, 2000])} className="hover:text-blue-900 cursor-pointer" aria-label="Remove price filter">
                    <X size={12} />
                  </button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                  {minRating}★ &amp; up
                  <button onClick={() => setMinRating(0)} className="hover:text-amber-950 cursor-pointer" aria-label="Remove rating filter">
                    <X size={12} />
                  </button>
                </span>
              )}
              {sort !== 'featured' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold">
                  Sort: {SORT_OPTIONS.find(o => o.value === sort)?.label}
                  <button onClick={() => setSort('featured')} className="hover:text-slate-950 cursor-pointer" aria-label="Reset sort">
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-bold underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

        </div>

        {/* Products Showcase Grid (Now Placed Immediately High Up on Page) */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <ProductSkeleton count={12} />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-16 rounded-[32px] text-center border border-slate-200/90 shadow-sm max-w-2xl mx-auto my-12">
              <h3 className="text-xl font-black text-slate-950 mb-2 font-sans">No Products Found</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">
                We couldn&apos;t find any items matching your selected criteria. Try adjusting your filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 rounded-full bg-slate-950 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                {products.map((product) => (
                  <ProductCard key={product.asin} product={product} />
                ))}
              </div>

              {/* Minimal Executive Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-800 disabled:opacity-40 hover:border-slate-400 hover:text-blue-600 transition-all shadow-xs cursor-pointer"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-full text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                            page === pageNum
                              ? 'bg-slate-950 text-white shadow-md scale-105'
                              : 'bg-white border border-slate-200 text-slate-800 hover:border-slate-400'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-800 disabled:opacity-40 hover:border-slate-400 hover:text-blue-600 transition-all shadow-xs cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-slate-500 font-medium text-xs">Loading catalog directory...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
