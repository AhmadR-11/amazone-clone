'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import { Search, Sparkles, SlidersHorizontal, Layers } from 'lucide-react';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const category = searchParams?.get('category') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (category && category !== 'All') params.append('category', category);

        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setTotalCount(data.total || data.products?.length || 0);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, category]);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 md:px-8 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Search Header Bar */}
        <div className="bg-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>Search Results</span>
                {category && category !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full text-[11px] border border-slate-200 font-bold capitalize">
                    <Layers className="w-3 h-3" /> {category}
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 mt-0.5">
                &quot;<span>{query || 'All Collections'}</span>&quot;
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium self-end sm:self-center">
            <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Showing <strong className="text-slate-900">{products.length}</strong> of <strong className="text-slate-900">{totalCount}</strong> items
            </span>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <ProductSkeleton count={8} />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center max-w-xl mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold font-display text-slate-900 mb-1">No items found matching &quot;{query}&quot;</h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Try adjusting your query or browsing our popular product categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.asin} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}

