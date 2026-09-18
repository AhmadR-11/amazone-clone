'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import { Search, Filter, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-amazon_bg py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Search Title & Summary Bar */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div>
            <span className="text-gray-500">Results for </span>
            <span className="font-extrabold text-amazon_orange text-base md:text-lg">"{query || 'All Products'}"</span>
            {category && category !== 'All' && (
              <span className="text-gray-600 font-semibold"> in {category}</span>
            )}
          </div>
          <span className="text-gray-500 font-medium">1-{products.length} of over {totalCount} results</span>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <ProductSkeleton count={8} />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-800 mb-1">No results matching "{query}"</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Check your spelling or try searching with more generic keywords.
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
      <div className="min-h-[70vh] bg-amazon_bg flex items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-amazon_yellow border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
