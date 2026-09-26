import React from 'react';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import ProductCarousel from '@/components/ProductCarousel';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';
import { ArrowRight, Sparkles, Zap, ShieldCheck, Heart } from 'lucide-react';

async function getProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  const electronics = products.filter((p: any) => p.category === 'Electronics');
  const kitchen = products.filter((p: any) => p.category === 'Kitchen');
  const fashion = products.filter((p: any) => p.category === 'Fashion');

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16 text-slate-900">
      {/* Hero Banner Carousel */}
      <HeroCarousel products={products} />

      {/* Ultra-Premium Unified Bento Category Grid Section */}
      <section className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-8 mt-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-5">
          
          {/* Tile 1: Hero Featured Tile (Audio & Tech) - Spans 6 Columns */}
          <div className="lg:col-span-6 relative overflow-hidden rounded-[28px] bg-slate-950 text-white p-7 sm:p-9 flex flex-col justify-between group min-h-[360px] border border-white/10 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
              alt="Studio Audio"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 text-white border border-white/20 text-[11px] font-extrabold uppercase tracking-widest mb-3 backdrop-blur-md">
                <Zap size={13} className="text-blue-400" /> Studio Sound
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase leading-none font-sans">
                Studio Sound &amp; High-Fidelity Audio
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-md font-normal leading-relaxed">
                Precision spatial acoustics, active noise cancellation, and ergonomic studio gear.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <Link
                href="/products?category=Electronics"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-xl group/btn hover:scale-105 active:scale-95"
              >
                <span>Shop Audio Collection</span>
                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Tile 2: Luxury Couture & Apparel - Spans 3 Columns */}
          <div className="lg:col-span-3 relative overflow-hidden rounded-[28px] bg-slate-950 text-white p-7 flex flex-col justify-between group min-h-[360px] border border-white/10 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80"
              alt="Couture Apparel"
              className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 text-white border border-white/20 text-[11px] font-extrabold uppercase tracking-widest mb-3 backdrop-blur-md">
                <Sparkles size={13} className="text-amber-400" /> Couture
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight uppercase leading-tight font-sans">
                Apparel &amp; Footwear
              </h2>
              <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                Contemporary outerwear, structured denim &amp; footwear.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <Link
                href="/products?category=Fashion"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white text-white hover:text-slate-950 font-bold border border-white/30 backdrop-blur-md text-xs uppercase tracking-wider transition-all duration-300 group/btn"
              >
                <span>Discover Apparel</span>
                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Tile 3: Stacked Home & Gaming Tiles - Spans 3 Columns */}
          <div className="lg:col-span-3 flex flex-col gap-5 justify-between">
            {/* Tile 3A: Home & Kitchen */}
            <div className="flex-1 relative overflow-hidden rounded-[26px] bg-slate-950 text-white p-6 border border-white/10 shadow-lg group flex flex-col justify-between min-h-[170px]">
              <img
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80"
                alt="Home & Kitchen"
                className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
                  <ShieldCheck size={12} /> Living
                </div>
                <Link href="/products?category=Kitchen" className="text-white/70 hover:text-white transition-colors">
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="relative z-10 mt-3">
                <h3 className="text-base font-bold text-white tracking-tight">Home &amp; Kitchen</h3>
                <p className="text-[11px] text-slate-300 mt-0.5">Cookware &amp; automated appliances.</p>
              </div>
            </div>

            {/* Tile 3B: Gaming & VR */}
            <div className="flex-1 relative overflow-hidden rounded-[26px] bg-slate-950 text-white p-6 border border-white/10 shadow-lg group flex flex-col justify-between min-h-[170px]">
              <img
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"
                alt="Gaming"
                className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
                  <Heart size={12} /> Gaming
                </div>
                <Link href="/products?category=Toys" className="text-white/70 hover:text-white transition-colors">
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="relative z-10 mt-3">
                <h3 className="text-base font-bold text-white tracking-tight">Consoles &amp; Gaming</h3>
                <p className="text-[11px] text-slate-300 mt-0.5">High-refresh displays &amp; VR gear.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Horizontal Product Carousels */}
      <div className="max-w-7xl mx-auto space-y-6">
        <ProductCarousel
          title="Trending Electronics & Gadgets"
          products={electronics.length > 0 ? electronics : products}
          categoryLink="/products?category=Electronics"
        />

        <ProductCarousel
          title="Top Rated Home & Kitchen Collection"
          products={kitchen.length > 0 ? kitchen : products.slice(0, 10)}
          categoryLink="/products?category=Kitchen"
        />

        <ProductCarousel
          title="Popular Fashion & Apparel Deals"
          products={fashion.length > 0 ? fashion : products.slice(5, 15)}
          categoryLink="/products?category=Fashion"
        />
      </div>

      {/* Recommendations Box */}
      <PersonalizedRecommendations />
    </div>
  );
}

