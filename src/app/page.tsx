import React from 'react';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import ProductCarousel from '@/components/ProductCarousel';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';

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
    <div className="min-h-screen bg-amazon_bg pb-12">
      {/* Interactive Hero Banner Carousel */}
      <HeroCarousel products={products} />

      {/* 4-Tile Category Grid Section */}
      <section className="category-tiles-grid max-w-7xl mx-auto px-4 md:px-8">
        {/* Tile 1: Get your game on */}
        <div className="tile-card">
          <h2>Get your game on</h2>
          <Link href="/products?category=Toys">
            <img
              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80"
              alt="Gaming Controller"
              className="tile-hero-img clickable-img cursor-pointer hover:opacity-95 transition"
            />
          </Link>
          <Link href="/products?category=Toys" className="tile-link">Shop gaming &gt;</Link>
        </div>

        {/* Tile 2: Shop Fashion for less */}
        <div className="tile-card">
          <h2>Shop Fashion for less</h2>
          <div className="tile-quad-grid">
            <Link href="/products?category=Fashion" className="quad-item">
              <img src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80" alt="Jeans" />
              <span>Jeans under $50</span>
            </Link>
            <Link href="/products?category=Fashion" className="quad-item">
              <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80" alt="Tops" />
              <span>Tops under $25</span>
            </Link>
            <Link href="/products?category=Fashion" className="quad-item">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80" alt="Dresses" />
              <span>Dresses under $30</span>
            </Link>
            <Link href="/products?category=Fashion" className="quad-item">
              <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80" alt="Shoes" />
              <span>Shoes under $50</span>
            </Link>
          </div>
          <Link href="/products?category=Fashion" className="tile-link">See all deals &gt;</Link>
        </div>

        {/* Tile 3: New home arrivals under $50 */}
        <div className="tile-card">
          <h2>New home arrivals under $50</h2>
          <div className="tile-quad-grid">
            <Link href="/products?category=Kitchen" className="quad-item">
              <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80" alt="Kitchen & Dining" />
              <span>Kitchen & Dining</span>
            </Link>
            <Link href="/products?category=Kitchen" className="quad-item">
              <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80" alt="Home Improvement" />
              <span>Home Improvement</span>
            </Link>
            <Link href="/products?category=Kitchen" className="quad-item">
              <img src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80" alt="Décor" />
              <span>Décor</span>
            </Link>
            <Link href="/products?category=Kitchen" className="quad-item">
              <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&q=80" alt="Bedding & Bath" />
              <span>Bedding & Bath</span>
            </Link>
          </div>
          <Link href="/products?category=Kitchen" className="tile-link">Shop Home &gt;</Link>
        </div>

        {/* Tile 4: Wireless Tech */}
        <div className="tile-card">
          <h2>Wireless Tech</h2>
          <div className="tile-quad-grid">
            <Link href="/products?category=Electronics" className="quad-item">
              <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80" alt="Smartphones" />
              <span>Smartphones</span>
            </Link>
            <Link href="/products?category=Electronics" className="quad-item">
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80" alt="Watches" />
              <span>Watches</span>
            </Link>
            <Link href="/products?category=Electronics" className="quad-item">
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80" alt="Headphones" />
              <span>Headphones</span>
            </Link>
            <Link href="/products?category=Electronics" className="quad-item">
              <img src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=300&q=80" alt="Tablets" />
              <span>Tablets</span>
            </Link>
          </div>
          <Link href="/products?category=Electronics" className="tile-link">Discover Tech &gt;</Link>
        </div>
      </section>

      {/* Interactive Horizontal Product Carousels with Left/Right Arrows */}
      <div className="max-w-7xl mx-auto">
        <ProductCarousel
          title="Best Sellers in Electronics"
          products={electronics.length > 0 ? electronics : products}
          categoryLink="/products?category=Electronics"
        />

        <ProductCarousel
          title="Top Products in Kitchen & Home"
          products={kitchen.length > 0 ? kitchen : products.slice(0, 10)}
          categoryLink="/products?category=Kitchen"
        />

        <ProductCarousel
          title="Popular Fashion Deals"
          products={fashion.length > 0 ? fashion : products.slice(5, 15)}
          categoryLink="/products?category=Fashion"
        />
      </div>

      {/* Recommendations Box */}
      <PersonalizedRecommendations />
    </div>
  );
}
