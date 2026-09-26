'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Trash2, Tag, ArrowRight, Package, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

export default function WishlistPage() {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { items, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/auth/login?returnUrl=/wishlist');
          return;
        }
        await fetchWishlist();
      } catch {
        // stay on page
      } finally {
        setPageLoading(false);
      }
    };
    checkAuth();
  }, [router, fetchWishlist]);

  const removeItem = async (asin: string) => {
    await removeFromWishlist(asin);
  };

  const moveToCart = async (item: typeof items[0]) => {
    addItem({
      asin: item.asin,
      title: item.title,
      image: item.imageUrl || '',
      price: item.price,
      quantity: 1,
    });
    await removeFromWishlist(item.asin);
  };

  if (pageLoading) {
    return (
      <div className="min-h-[70vh] bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium text-xs">Loading your saved wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 md:px-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold mb-1">
              <Heart className="w-3.5 h-3.5 fill-rose-600" /> Saved Wishlist
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900 flex items-center gap-3">
              Your Personal Vault
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">{items.length} saved item{items.length !== 1 ? 's' : ''} saved for later</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-colors shadow-sm"
          >
            Explore Catalog <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center shadow-sm max-w-lg mx-auto my-8">
            <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold font-display text-slate-900 mb-1">Your wishlist is empty</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-xs mx-auto">
              Save products you like by clicking the heart icon on any product card.
            </p>
            <Link
              href="/products"
              className="bg-slate-900 hover:bg-slate-800 text-white inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-xs transition-colors shadow-sm"
            >
              Start Exploring <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.asin}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-300 group overflow-hidden flex flex-col justify-between"
              >
                {/* Image Box */}
                <Link href={`/product/${item.asin}`} className="block relative overflow-hidden h-48 bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Package className="w-10 h-10" />
                    </div>
                  )}
                </Link>

                {/* Info & Actions */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    {item.category && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-semibold mb-1 capitalize">
                        <Tag className="w-3 h-3 text-slate-400" /> {item.category}
                      </span>
                    )}
                    <Link
                      href={`/product/${item.asin}`}
                      className="font-bold text-slate-900 hover:text-blue-600 text-xs line-clamp-2 transition-colors block"
                    >
                      {item.title}
                    </Link>
                  </div>

                  <div>
                    <div className="text-lg font-bold font-display text-slate-900 mb-3">
                      ${item.price.toFixed(2)}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => moveToCart(item)}
                        className="bg-slate-900 hover:bg-slate-800 text-white flex-1 flex items-center justify-center gap-1.5 font-bold text-xs py-2 px-3 rounded-xl shadow-sm transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Move to Bag
                      </button>
                      <button
                        onClick={() => removeItem(item.asin)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

