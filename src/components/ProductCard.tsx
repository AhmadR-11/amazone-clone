'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

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

export default function ProductCard({ product, compact = false }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      asin: product.asin,
      title: product.title,
      image: product.image,
      price: product.price,
    });
    openCart();
  };

  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(product.rating);
    const half = !filled && i < product.rating;
    return { filled, half };
  });

  return (
    <Link href={`/product/${product.asin}`} className="group">
      <div
        className={`bg-white rounded-md border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col overflow-hidden h-full ${
          compact ? 'p-3' : 'p-4'
        }`}
      >
        {/* Badge */}
        {product.badge && (
          <div className="text-xs font-semibold text-white bg-amazon-orange-btn px-2 py-0.5 rounded w-fit mb-2">
            {product.badge}
          </div>
        )}

        {/* Image */}
        <div
          className={`relative flex items-center justify-center overflow-hidden bg-gray-50 rounded ${
            compact ? 'h-36 mb-2' : 'h-48 mb-3'
          }`}
        >
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          {discount && (
            <div className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              -{discount}%
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          className={`text-amazon-teal font-medium leading-snug mb-1 group-hover:underline line-clamp-2 flex-1 ${
            compact ? 'text-xs' : 'text-sm'
          }`}
        >
          {product.title}
        </h3>

        {/* Brand */}
        {product.brand && !compact && (
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        )}

        {/* Stars */}
        <div className="flex items-center gap-1 mb-1">
          <div className="flex">
            {stars.map((star, i) => (
              <Star
                key={i}
                size={12}
                className={
                  star.filled || star.half
                    ? 'fill-amazon-orange text-amazon-orange'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>
          <span className="text-xs text-amazon-teal hover:underline">
            {product.reviewCount.toLocaleString()}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`font-bold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Prime Badge */}
        {product.isPrime && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs font-bold text-amazon-dark bg-amazon-yellow px-1 rounded">
              prime
            </span>
            <span className="text-xs text-gray-600">FREE Delivery</span>
          </div>
        )}

        {/* Add to Cart */}
        {!compact && product.inStock && (
          <button
            onClick={handleAddToCart}
            className="w-full mt-auto bg-amazon-yellow hover:bg-amazon-yellow-hover text-amazon-dark font-semibold text-sm py-1.5 px-3 rounded-full transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={14} />
            Add to Cart
          </button>
        )}

        {!product.inStock && (
          <p className="text-xs text-red-600 font-semibold mt-auto">
            Currently unavailable
          </p>
        )}
      </div>
    </Link>
  );
}
