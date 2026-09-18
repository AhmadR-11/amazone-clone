'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Trash2, Tag, ArrowRight, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/useCartStore';

interface WishlistItem {
  _id: string;
  asin: string;
  title: string;
  imageUrl: string;
  price: number;
  category: string;
  addedAt: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/auth/login?returnUrl=/wishlist');
          return;
        }
        setIsLoggedIn(true);
        const res = await fetch('/api/wishlist');
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch {
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const removeItem = async (asin: string) => {
    try {
      const res = await fetch(`/api/wishlist/remove/${asin}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        toast.success('Removed from wishlist');
      }
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const moveToCart = async (item: WishlistItem) => {
    addItem({
      asin: item.asin,
      title: item.title,
      image: item.imageUrl,
      price: item.price,
      quantity: 1,
    });
    toast.success('Added to cart!');
    await removeItem(item.asin);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-amazon_bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amazon_yellow border-t-transparent rounded-full animate-spin" />
          <p className="text-amazon_blue font-medium text-sm">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon_bg py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-amazon_blue flex items-center gap-2">
              <Heart className="w-7 h-7 text-red-500 fill-red-500" />
              Your Wishlist
            </h1>
            <p className="text-sm text-gray-500 mt-1">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <Link
            href="/products"
            className="text-sm text-amazon_blue hover:text-amazon_orange flex items-center gap-1 font-medium"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-amazon_blue mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Save items you love by clicking the heart icon on any product. They&apos;ll appear here for easy access.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold px-6 py-3 rounded-md text-sm shadow transition"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.asin}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition group overflow-hidden"
              >
                {/* Image */}
                <Link href={`/product/${item.asin}`} className="block relative overflow-hidden h-48 bg-gray-50 border-b border-gray-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="p-4">
                  <Link
                    href={`/product/${item.asin}`}
                    className="font-medium text-amazon_blue hover:text-amazon_orange text-sm line-clamp-2 mb-1"
                  >
                    {item.title}
                  </Link>
                  {item.category && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Tag className="w-3 h-3" />
                      {item.category}
                    </span>
                  )}
                  <div className="text-lg font-bold text-gray-900 mb-3">
                    ${item.price.toFixed(2)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveToCart(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold text-xs py-2 px-3 rounded-md transition shadow-sm"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeItem(item.asin)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
