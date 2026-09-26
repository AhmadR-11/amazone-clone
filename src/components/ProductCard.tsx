'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

interface Product {
  asin: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isPrime: boolean;
  badge?: string;
  brand?: string;
  category?: string;
}

interface Props {
  product: Product;
  compact?: boolean;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';

export default function ProductCard({ product, compact = false }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const [imgError, setImgError] = useState(false);

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      asin: product.asin,
      title: product.title,
      image: imgError || !product.image ? FALLBACK_IMAGE : product.image,
      price: product.price,
    });
    openCart();
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist({
      asin: product.asin,
      title: product.title,
      image: imgError || !product.image ? FALLBACK_IMAGE : product.image,
      price: product.price,
      category: product.category,
    });
  };

  const isLiked = isInWishlist(product.asin);
  const imgSrc = imgError || !product.image ? FALLBACK_IMAGE : product.image;

  return (
    <Link href={`/product/${product.asin}`} className="group h-full flex">
      <div
        className={`w-full bg-white rounded-[26px] border border-slate-200/90 hover:border-blue-500/40 p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
          compact ? 'p-3.5' : 'p-5'
        }`}
      >
        <div>
          {/* Top Badges & Wishlist Trigger */}
          <div className="flex items-center justify-between gap-2 mb-3 min-h-[26px]">
            {product.badge ? (
              <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-700 border border-blue-400/20 px-3 py-1 rounded-full">
                {product.badge}
              </span>
            ) : discount ? (
              <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-700 border border-rose-400/20 px-3 py-1 rounded-full">
                -{discount}% OFF
              </span>
            ) : (
              <div />
            )}

            {!compact && (
              <button
                onClick={handleToggleWishlist}
                title={isLiked ? 'Saved to Wishlist' : 'Save to Wishlist'}
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  isLiked
                    ? 'text-rose-600 bg-rose-50 border border-rose-200'
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {isLiked ? 'Saved' : 'Save'}
              </button>
            )}
          </div>

          {/* Product Image Container */}
          <div
            className={`relative flex items-center justify-center bg-slate-50/70 rounded-[20px] p-4 border border-slate-100 mb-4 overflow-hidden group-hover:bg-slate-100/80 transition-colors duration-500 ${
              compact ? 'h-36' : 'h-52'
            }`}
          >
            <img
              src={imgSrc}
              alt={product.title}
              onError={() => setImgError(true)}
              className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          </div>

          {/* Brand Tag */}
          {product.brand && !compact && (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
              {product.brand}
            </p>
          )}

          {/* Title */}
          <h3
            className={`font-extrabold text-slate-950 leading-snug mb-2.5 group-hover:text-blue-600 transition-colors line-clamp-2 font-sans tracking-tight ${
              compact ? 'text-xs' : 'text-sm sm:text-[15px]'
            }`}
          >
            {product.title}
          </h3>

          {/* Clean Rating Badge - Zero Clutter */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-black px-2.5 py-0.5 rounded-full">
              <span>★</span>
              <span>{product.rating.toFixed(1)}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-bold">
              {product.reviewCount?.toLocaleString()} reviews
            </span>
          </div>
        </div>

        {/* Price & Primary Action Footer */}
        <div className="pt-3.5 border-t border-slate-100 mt-auto flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-950 font-sans tracking-tight">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through font-semibold">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Text-Based Executive Add to Cart Button (NO ICON SLOP) */}
          {!compact && product.inStock && (
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 rounded-full bg-slate-950 hover:bg-blue-600 text-white text-xs font-black tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-blue-500/25 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
              aria-label={`Add ${product.title} to cart`}
            >
              Add to Cart
            </button>
          )}

          {!product.inStock && (
            <span className="text-[10px] text-rose-600 font-black uppercase tracking-wider px-3 py-1 bg-rose-50 rounded-full border border-rose-200">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
