'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';

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
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('featured');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [minRating, setMinRating] = useState(0);
  const searchQuery = searchParams?.get('q') || '';

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
  }, [sort, selectedCategory, minRating]);

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 2000]);
    setMinRating(0);
    setSort('featured');
    setPage(1);
  };

  const hasFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < 2000 || minRating > 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-6">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Unified Executive Catalog Console (Combines Title, Categories, Filters, & Sort into One Compact Bar) */}
        <div className="bg-white rounded-[24px] p-5 mb-6 border border-slate-200/90 shadow-xs space-y-4">
          
          {/* Top Level: Title + Department Capsules + Sort Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Title & Items Counter */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 font-sans tracking-tight whitespace-nowrap">
                {searchQuery ? `Results for "${searchQuery}"` : (selectedCategory ? `${selectedCategory}` : 'All Products')}
              </h1>
              {!loading && (
                <span className="px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-black uppercase tracking-wider">
                  {total.toLocaleString()} Products
                </span>
              )}
            </div>

            {/* Department Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  !selectedCategory
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                All Departments
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs font-black text-slate-800 flex-shrink-0">
              <span className="text-slate-400 uppercase tracking-wider font-mono text-[10px]">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-slate-950 font-black focus:outline-none cursor-pointer text-xs"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-white text-slate-900 font-bold">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Level: Price & Rating Threshold Filters */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Price Range Pills */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono mr-1.5">
                  Price:
                </span>
                {[
                  [0, 2000, 'All'],
                  [0, 25, '<$25'],
                  [25, 50, '$25-$50'],
                  [50, 100, '$50-$100'],
                  [100, 200, '$100-$200'],
                  [200, 2000, '$200+'],
                ].map(([min, max, label]) => (
                  <button
                    key={label as string}
                    onClick={() => setPriceRange([min as number, max as number])}
                    className={`px-3 py-1 rounded-full font-extrabold transition-all cursor-pointer text-xs ${
                      priceRange[0] === min && priceRange[1] === max
                        ? 'bg-blue-50 text-blue-700 border border-blue-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Rating Pills */}
              <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono mr-1.5">
                  Rating:
                </span>
                {[
                  [0, 'All'],
                  [4, '4★+'],
                  [3, '3★+'],
                ].map(([r, label]) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(Number(r))}
                    className={`px-3 py-1 rounded-full font-extrabold transition-all cursor-pointer text-xs ${
                      minRating === r
                        ? 'bg-amber-50 text-amber-900 border border-amber-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Action */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-black uppercase tracking-wider underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

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
