'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Product {
  asin?: string;
  _id?: string;
  title: string;
  image: string;
  price?: number;
  pricePKR?: number;
  rating?: number;
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
  categoryLink?: string;
}

export default function ProductCarousel({ title, products, categoryLink }: ProductCarouselProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="my-6 px-4 md:px-8">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative group">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
          {categoryLink && (
            <Link href={categoryLink} className="text-xs md:text-sm text-amazon_blue font-semibold hover:text-amazon_orange hover:underline">
              See more &gt;
            </Link>
          )}
        </div>

        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-200 focus:outline-none"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-200 focus:outline-none"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>

        {/* Products Row Container */}
        <div
          ref={rowRef}
          className="flex items-stretch gap-4 overflow-x-auto scrollbar-none py-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((item, idx) => {
            const id = item.asin || item._id || `item-${idx}`;
            const displayPrice = item.price ? `$${item.price.toFixed(2)}` : item.pricePKR ? `PKR ${item.pricePKR.toLocaleString()}` : '$29.99';

            return (
              <Link
                key={id + idx}
                href={`/product/${id}`}
                className="w-48 sm:w-56 flex-shrink-0 bg-white rounded-md p-3 border border-transparent hover:border-gray-200 hover:shadow-md transition flex flex-col justify-between group/card cursor-pointer"
              >
                <div className="w-full h-44 mb-3 flex items-center justify-center p-2 bg-gray-50 rounded overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain group-hover/card:scale-105 transition-transform duration-300"
                  />
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-amazon_blue hover:text-amazon_orange line-clamp-2 mb-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1 mb-1">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(item.rating || 4.5) ? 'fill-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">({item.rating || 4.5})</span>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-gray-900">
                    {displayPrice}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
