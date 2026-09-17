'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  pricePKR?: number;
  bgGradient: string;
  textColor: string;
  image: string;
  linkUrl: string;
}

const defaultSlides: BannerSlide[] = [
  {
    id: 'slide-1',
    title: 'Kitchen Essentials',
    subtitle: 'High-quality cookware, drinkware & gadgets under $50',
    badge: 'Under $50',
    bgGradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    textColor: '#ffffff',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/products',
  },
  {
    id: 'slide-2',
    title: 'Bezente Assorted Rainbow Balloons',
    subtitle: '100 Pack 12-inch Natural Latex for Birthday & Celebrations',
    badge: "Amazon's Choice",
    pricePKR: 1937.45,
    bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    textColor: '#ffffff',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/products',
  },
  {
    id: 'slide-3',
    title: 'Owala FreeSip Insulated Bottle',
    subtitle: '24 oz Stainless Steel Dual-Sip Straw Water Bottle',
    badge: 'Top Pick',
    pricePKR: 8500.0,
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    textColor: '#ffffff',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/products',
  },
  {
    id: 'slide-4',
    title: 'Lenovo IdeaTab 11" 2.5K Bundle',
    subtitle: 'Includes Precision Pen & Folio Stand Case',
    badge: 'Deal of the Day',
    pricePKR: 68500.0,
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    textColor: '#ffffff',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/products',
  },
];

interface HeroCarouselProps {
  products?: any[];
}

export default function HeroCarousel({ products = [] }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Map backend products if available into slides
  const slides: BannerSlide[] =
    products.length > 0
      ? products.map((prod, idx) => ({
          id: prod._id || `prod-${idx}`,
          title: prod.title,
          subtitle: prod.description || `${prod.category} • PKR ${prod.pricePKR?.toLocaleString()}`,
          badge: prod.badge || prod.category,
          pricePKR: prod.pricePKR,
          bgGradient: defaultSlides[idx % defaultSlides.length].bgGradient,
          textColor: '#ffffff',
          image: prod.image,
          linkUrl: `/products/${prod._id}`,
        }))
      : defaultSlides;

  // Auto slide advance every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div
      className="hero-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ background: currentSlide.bgGradient }}
    >
      {/* Left Navigation Arrow */}
      <button
        onClick={handlePrev}
        className="carousel-nav-btn left-nav"
        aria-label="Previous Slide"
        title="Previous Product"
      >
        ❮
      </button>

      {/* Main Slide Link Body */}
      <Link href={currentSlide.linkUrl} className="hero-slide-content">
        <div className="hero-text-content">
          {currentSlide.badge && <span className="hero-badge">{currentSlide.badge}</span>}
          <h1 className="hero-title">{currentSlide.title}</h1>
          <p className="hero-subtitle">{currentSlide.subtitle}</p>
          {currentSlide.pricePKR && (
            <div className="hero-price-tag">
              PKR {currentSlide.pricePKR.toLocaleString()}
            </div>
          )}
          <span className="hero-shop-btn">Shop Now &gt;</span>
        </div>

        <div className="hero-image-box">
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            className="hero-img-interactive"
          />
        </div>
      </Link>

      {/* Right Navigation Arrow */}
      <button
        onClick={handleNext}
        className="carousel-nav-btn right-nav"
        aria-label="Next Slide"
        title="Next Product"
      >
        ❯
      </button>

      {/* Carousel Dots Indicators */}
      <div className="carousel-dots-row">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`dot-indicator ${idx === currentIndex ? 'active' : ''}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
