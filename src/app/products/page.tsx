'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, X, Filter } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
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
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('featured');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [minRating, setMinRating] = useState(0);
  const searchQuery = searchParams.get('q') || '';

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

  // Reset page on filter change
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
    <div className="min-h-screen bg-[#eaeded]">
      <div className="max-w-[1480px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            {searchQuery ? (
              <h1 className="text-xl font-medium text-gray-800">
                {loading ? 'Searching...' : `${total.toLocaleString()} results for`}{' '}
                <span className="font-bold text-gray-900">&ldquo;{searchQuery}&rdquo;</span>
              </h1>
            ) : (
              <h1 className="text-xl font-bold text-gray-900">
                {selectedCategory || 'All Products'}{' '}
                {!loading && <span className="font-normal text-gray-600 text-base">({total.toLocaleString()} results)</span>}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 rounded text-sm"
            >
              <Filter size={14} /> Filters
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 rounded">
              <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm font-medium border-0 focus:outline-none bg-transparent"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } sm:block w-full sm:w-56 flex-shrink-0`}
          >
            <div className="bg-white rounded-md shadow-sm p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 text-sm">Filters</h2>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-amazon-teal hover:underline flex items-center gap-1"
                  >
                    <X size={10} /> Clear all
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-100">
                  Department
                </h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`block w-full text-left text-sm px-1 py-0.5 rounded ${
                      !selectedCategory ? 'font-bold text-gray-900' : 'text-amazon-teal hover:underline'
                    }`}
                  >
                    All Departments
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                      className={`block w-full text-left text-sm px-1 py-0.5 rounded ${
                        selectedCategory === cat
                          ? 'font-bold text-gray-900'
                          : 'text-amazon-teal hover:underline'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-100">
                  Price
                </h3>
                <div className="space-y-2">
                  {[
                    [0, 25, 'Under $25'],
                    [25, 50, '$25 to $50'],
                    [50, 100, '$50 to $100'],
                    [100, 200, '$100 to $200'],
                    [200, 2000, '$200 & Above'],
                  ].map(([min, max, label]) => (
                    <button
                      key={label as string}
                      onClick={() => setPriceRange([min as number, max as number])}
                      className={`block w-full text-left text-sm px-1 py-0.5 ${
                        priceRange[0] === min && priceRange[1] === max
                          ? 'font-bold text-gray-900'
                          : 'text-amazon-teal hover:underline'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-100">
                  Avg. Customer Review
                </h3>
                <div className="space-y-1.5">
                  {[4, 3, 2, 1].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(minRating === r ? 0 : r)}
                      className={`flex items-center gap-1 text-sm w-full ${
                        minRating === r ? 'font-bold' : 'text-amazon-teal hover:underline'
                      }`}
                    >
                      <span>{'⭐'.repeat(r)} & Up</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <ProductSkeleton count={24} />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-md p-12 text-center">
                <p className="text-xl font-semibold text-gray-700 mb-2">No products found</p>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="bg-amazon-yellow hover:bg-amazon-yellow-hover text-amazon-dark font-bold px-6 py-2 rounded-full text-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.asin} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3.5 py-2 rounded text-sm font-medium transition-colors ${
                            page === pageNum
                              ? 'bg-amazon-yellow text-amazon-dark border border-amazon-orange'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gray-500">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
