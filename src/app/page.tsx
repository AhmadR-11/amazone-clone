import React from 'react';
import Link from 'next/link';

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

  return (
    <div>
      {/* Purple Hero Banner */}
      <section className="hero-banner">
        <div className="carousel-arrow left">❮</div>
        <div className="hero-text">
          <h1>Kitchen essentials</h1>
          <p>Under $50</p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80"
          alt="Kitchen Essentials"
          className="hero-img"
        />
        <div className="carousel-arrow right">❯</div>
      </section>

      {/* 4-Tile Category Grid Section */}
      <section className="category-tiles-grid">
        {/* Tile 1: Get your game on */}
        <div className="tile-card">
          <h2>Get your game on</h2>
          <img
            src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80"
            alt="Gaming Controller"
            className="tile-hero-img"
          />
          <Link href="/products" className="tile-link">Shop gaming</Link>
        </div>

        {/* Tile 2: Shop Fashion for less */}
        <div className="tile-card">
          <h2>Shop Fashion for less</h2>
          <div className="tile-quad-grid">
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80" alt="Jeans" />
              <span>Jeans under $50</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80" alt="Tops" />
              <span>Tops under $25</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80" alt="Dresses" />
              <span>Dresses under $30</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80" alt="Shoes" />
              <span>Shoes under $50</span>
            </div>
          </div>
          <Link href="/products" className="tile-link">See all deals</Link>
        </div>

        {/* Tile 3: New home arrivals under $50 */}
        <div className="tile-card">
          <h2>New home arrivals under $50</h2>
          <div className="tile-quad-grid">
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80" alt="Kitchen & Dining" />
              <span>Kitchen & Dining</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80" alt="Home Improvement" />
              <span>Home Improvement</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80" alt="Décor" />
              <span>Décor</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&q=80" alt="Bedding & Bath" />
              <span>Bedding & Bath</span>
            </div>
          </div>
          <Link href="/products" className="tile-link">Shop the latest from Home</Link>
        </div>

        {/* Tile 4: Top categories in Kitchen appliances */}
        <div className="tile-card">
          <h2>Top categories in Kitchen appliances</h2>
          <div className="tile-quad-grid">
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=300&q=80" alt="Cooker" />
              <span>Cooker</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=300&q=80" alt="Coffee" />
              <span>Coffee</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=300&q=80" alt="Pots and Pans" />
              <span>Pots and Pans</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=300&q=80" alt="Kettles" />
              <span>Kettles</span>
            </div>
          </div>
          <Link href="/products" className="tile-link">Explore all products in Kitchen</Link>
        </div>

        {/* Tile 5: Wireless Tech */}
        <div className="tile-card">
          <h2>Wireless Tech</h2>
          <div className="tile-quad-grid">
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80" alt="Smartphones" />
              <span>Smartphones</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80" alt="Watches" />
              <span>Watches</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80" alt="Headphones" />
              <span>Headphones</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=300&q=80" alt="Tablets" />
              <span>Tablets</span>
            </div>
          </div>
          <Link href="/products" className="tile-link">Discover more</Link>
        </div>

        {/* Tile 6: Most-loved travel essentials */}
        <div className="tile-card">
          <h2>Most-loved travel essentials</h2>
          <div className="tile-quad-grid">
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80" alt="Backpacks" />
              <span>Backpacks</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1565026057447-b88d3df84ea3?auto=format&fit=crop&w=300&q=80" alt="Suitcases" />
              <span>Suitcases</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=80" alt="Accessories" />
              <span>Accessories</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80" alt="Handbags" />
              <span>Handbags</span>
            </div>
          </div>
          <Link href="/products" className="tile-link">Discover more</Link>
        </div>

        {/* Tile 7: Gear up to get fit */}
        <div className="tile-card">
          <h2>Gear up to get fit</h2>
          <div className="tile-quad-grid">
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300&q=80" alt="Clothing" />
              <span>Clothing</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=300&q=80" alt="Trackers" />
              <span>Trackers</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=300&q=80" alt="Equipment" />
              <span>Equipment</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=300&q=80" alt="Deals" />
              <span>Deals</span>
            </div>
          </div>
          <Link href="/products" className="tile-link">Discover more</Link>
        </div>

        {/* Tile 8: Level up your beauty routine */}
        <div className="tile-card">
          <h2>Level up your beauty routine</h2>
          <div className="tile-quad-grid">
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80" alt="Makeup" />
              <span>Makeup</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=300&q=80" alt="Brushes" />
              <span>Brushes</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=300&q=80" alt="Sponges" />
              <span>Sponges</span>
            </div>
            <div className="quad-item">
              <img src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=300&q=80" alt="Mirrors" />
              <span>Mirrors</span>
            </div>
          </div>
          <Link href="/products" className="tile-link">See more</Link>
        </div>
      </section>

      {/* Horizontal Carousel 1: Best Sellers in Toys & Games */}
      <section className="carousel-section">
        <div className="carousel-box">
          <h2>Best Sellers in Toys & Games</h2>
          <div className="product-row">
            {products.map((item: any) => (
              <Link href={`/products/${item._id}`} key={item._id} className="product-item-card">
                <img src={item.image} alt={item.title} />
                <span className="title">{item.title}</span>
                <span className="price">PKR {item.pricePKR.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal Carousel 2: International top sellers in Kitchen */}
      <section className="carousel-section">
        <div className="carousel-box">
          <h2>International top sellers in Kitchen</h2>
          <div className="product-row">
            {products.slice(0, 4).map((item: any) => (
              <Link href={`/products/${item._id}`} key={item._id} className="product-item-card">
                <img src={item.image} alt={item.title} />
                <span className="title">{item.title}</span>
                <span className="price">PKR {item.pricePKR.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendations Box */}
      <section className="recommendations-section">
        <h3>See personalized recommendations</h3>
        <Link href="/auth/login" className="yellow-signin-btn">
          Sign in
        </Link>
        <div className="rec-subtext">
          New customer? <Link href="/auth/register">Start here.</Link>
        </div>
      </section>
    </div>
  );
}
