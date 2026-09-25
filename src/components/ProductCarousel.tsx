'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

interface Product {
  asin?: string;
  _id?: string;
  title: string;
  image: string;
  price?: number;
  pricePKR?: number;
  rating?: number;
  category?: string;
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
  categoryLink?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';

export default function ProductCarousel({ title, products, categoryLink }: ProductCarouselProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const { addItem } = useCartStore();

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

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="my-10 max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-8">
      <div className="liquid-glass-header p-6 sm:p-8 rounded-[28px] sm:rounded-[32px] transition-all duration-300 relative group">
        
        {/* Floating Liquid Glass Header with Integrated Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200/60 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-2.5 h-7 rounded-full bg-blue-600 shadow-xs flex-shrink-0" />
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight font-sans truncate">
              {title}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
            {categoryLink && (
              <Link
                href={categoryLink}
                className="px-4 py-1.5 rounded-full liquid-glass-pill text-xs font-extrabold text-blue-600 hover:text-blue-700 tracking-wide transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <span>Explore Collection</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            )}

            {/* Header Arrow Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full liquid-glass-pill text-slate-800 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full liquid-glass-pill text-slate-800 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container with Side Overlay Buttons */}
        <div className="relative group/carousel">
          {/* Side Overlay Arrow Left */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-950/85 hover:bg-blue-600 text-white shadow-xl backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Scroll products left"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Side Overlay Arrow Right */}
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-950/85 hover:bg-blue-600 text-white shadow-xl backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Scroll products right"
          >
            <ChevronRight size={20} />
          </button>

          {/* Liquid Glass Products Row Container */}
          <div
            ref={rowRef}
            className="flex items-stretch gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((item, idx) => {
              const id = item.asin || item._id || `item-${idx}`;
              const numPrice = item.price || (item.pricePKR ? item.pricePKR / 280 : 29.99);
              const displayPrice = `$${numPrice.toFixed(2)}`;
              const imgSrc = imgErrors[id] || !item.image ? FALLBACK_IMAGE : item.image;
              const ratingVal = (item.rating || 4.5).toFixed(1);

              return (
                <div
                  key={id + idx}
                  className="w-52 sm:w-64 snap-start flex-shrink-0 liquid-glass-pill rounded-[24px] p-4 border border-white/80 hover:border-blue-400/50 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group/card cursor-pointer"
                >
                  <Link href={`/product/${id}`} className="block flex-1 flex flex-col justify-between">
                    {/* Image Canvas */}
                    <div className="w-full h-44 mb-3.5 flex items-center justify-center p-3 bg-white/90 rounded-[18px] border border-slate-100 overflow-hidden relative shadow-inner group-hover/card:bg-white transition-colors">
                      <img
                        src={imgSrc}
                        alt={item.title}
                        onError={() => handleImageError(id)}
                        className="max-h-full max-w-full object-contain group-hover/card:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover/card:text-blue-600 line-clamp-2 mb-2 leading-snug transition-colors font-sans">
                        {item.title}
                      </h3>
                    </div>
                  </Link>

                  {/* Price & Cart Actions */}
                  <div className="pt-3 flex items-center justify-between mt-auto border-t border-slate-200/60">
                    <div className="flex flex-col">
                      <span className="text-sm sm:text-base font-black text-slate-950 font-sans tracking-tight">
                        {displayPrice}
                      </span>
                      <div className="flex items-center gap-1 text-amber-600 text-[10px] font-extrabold mt-0.5">
                        <Star size={11} className="fill-amber-400 text-amber-500" />
                        <span>{ratingVal}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem({
                          asin: id,
                          title: item.title,
                          price: numPrice,
                          image: imgSrc,
                          quantity: 1,
                        });
                      }}
                      className="p-2.5 rounded-full bg-slate-950 hover:bg-blue-600 text-white shadow-md hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
                      aria-label={`Add ${item.title} to cart`}
                    >
                      <ShoppingCart size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

