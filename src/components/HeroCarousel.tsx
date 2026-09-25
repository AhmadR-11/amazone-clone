'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Flame, ShieldCheck, Zap } from 'lucide-react';

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  price?: number;
  image: string;
  linkUrl: string;
  primaryCtaText: string;
  secondaryCtaText: string;
}

const defaultSlides: BannerSlide[] = [
  {
    id: 'slide-1',
    title: 'DESIGNED FOR LONG SUMMER DAYS, WARM NIGHTS & ENDLESS SUN',
    subtitle: 'Discover a refined collection of breathable essentials made to move with you from coastal mornings to late evening escapes.',
    badge: 'LUXURY ESSENTIALS',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
    linkUrl: '/products?category=Fashion',
    primaryCtaText: 'Shop Collection',
    secondaryCtaText: 'Most Wanted',
  },
  {
    id: 'slide-2',
    title: 'HIGH-FIDELITY AUDIO & PURE STUDIO SOUND',
    subtitle: 'Immerse yourself in precision spatial sound engineered with active noise cancellation and ergonomic glass finish.',
    badge: 'STUDIO ACOUSTICS',
    price: 299.00,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1920&q=80',
    linkUrl: '/products?category=Electronics',
    primaryCtaText: 'Explore Audio',
    secondaryCtaText: 'Best Sellers',
  },
  {
    id: 'slide-3',
    title: 'AUTOMATED HOME ESSENTIALS & MODERN LIVING',
    subtitle: 'Sleek stainless steel designs and smart appliances engineered to bring comfort and elegance to contemporary spaces.',
    badge: 'HOME ARCHITECTURE',
    price: 189.50,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1920&q=80',
    linkUrl: '/products?category=Kitchen',
    primaryCtaText: 'Discover Home',
    secondaryCtaText: 'Featured Items',
  },
  {
    id: 'slide-4',
    title: 'RETINA OLED DISPLAY & PRO COMPUTING',
    subtitle: 'Power demanding creative workloads with high-performance processors and color-accurate OLED displays.',
    badge: 'PRO WORKSTATIONS',
    price: 899.00,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1920&q=80',
    linkUrl: '/products?category=Electronics',
    primaryCtaText: 'Shop Tech',
    secondaryCtaText: 'Limited Stock',
  },
];

interface HeroCarouselProps {
  products?: any[];
}

export default function HeroCarousel({ products = [] }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const slides: BannerSlide[] =
    products.length > 0
      ? products.slice(0, 5).map((prod, idx) => ({
          id: prod._id || `prod-${idx}`,
          title: prod.title ? prod.title.toUpperCase() : defaultSlides[idx % defaultSlides.length].title,
          subtitle: prod.description || defaultSlides[idx % defaultSlides.length].subtitle,
          badge: prod.badge || prod.category || 'FEATURED',
          price: prod.price || prod.pricePKR,
          image: prod.image || defaultSlides[idx % defaultSlides.length].image,
          linkUrl: `/product/${prod.asin || prod._id}`,
          primaryCtaText: 'Shop Collection',
          secondaryCtaText: 'Most Wanted',
        }))
      : defaultSlides;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div
      className="relative w-full max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-8 pt-3 pb-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-[500px] sm:h-[580px] lg:h-[640px] w-full overflow-hidden rounded-[32px] sm:rounded-[40px] shadow-2xl bg-slate-950 border border-white/20 transition-all duration-700">
        
        {/* Continuous Background Image Slider with Smooth Crossfade */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'
            }`}
            style={{ transitionProperty: 'opacity, transform' }}
          >
            {/* High Resolution Hero Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-linear"
            />
            {/* Cinematic Gradient Overlays for Sunlight & Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />
            <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/80" />
          </div>
        ))}

        {/* Left Arrow Button */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white text-white hover:text-slate-950 border border-white/20 backdrop-blur-xl shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white text-white hover:text-slate-950 border border-white/20 backdrop-blur-xl shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label="Next Slide"
        >
          <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Overlay Content */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 sm:px-12 lg:px-24 max-w-5xl mx-auto">
          
          {/* Badge */}
          {currentSlide.badge && (
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-md animate-in fade-in duration-500">
              <Sparkles size={14} className="text-amber-400" />
              <span>{currentSlide.badge}</span>
            </div>
          )}

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight font-sans tracking-tight drop-shadow-lg uppercase max-w-4xl">
            {currentSlide.title}
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-6 text-xs sm:text-base text-slate-200 font-normal max-w-2xl leading-relaxed drop-shadow-md">
            {currentSlide.subtitle}
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href={currentSlide.linkUrl}
              className="px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-white/15 hover:bg-white text-white hover:text-slate-950 font-bold border border-white/40 backdrop-blur-md transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 group"
            >
              <span>{currentSlide.primaryCtaText}</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href={currentSlide.linkUrl}
              className="px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-white text-slate-950 hover:bg-blue-600 hover:text-white font-extrabold transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 text-xs sm:text-sm uppercase tracking-wider"
            >
              {currentSlide.secondaryCtaText}
            </Link>
          </div>

        </div>

        {/* Carousel Indicators Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/15">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-white shadow-md' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

