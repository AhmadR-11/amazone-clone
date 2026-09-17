'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [cartSuccess, setCartSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setSelectedImage(data.product.image);
          if (data.product.colors && data.product.colors.length > 0) {
            setSelectedColor(data.product.colors[0].name);
          }
          if (data.product.sizes && data.product.sizes.length > 0) {
            setSelectedSize(data.product.sizes[1] || data.product.sizes[0]);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);

    // 1. Check user authentication
    const authRes = await fetch('/api/auth/me');
    const authData = await authRes.json();

    if (!authData.authenticated) {
      // User NOT logged in -> redirect to login page with return url
      router.push(`/auth/login?redirect=/products/${params.id}`);
      return;
    }

    // 2. User IS logged in -> Add to Cart in MongoDB
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: params.id,
          quantity,
          color: selectedColor,
          size: selectedSize,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', background: '#fff' }}>
        <h3>Loading Product Details...</h3>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', background: '#fff' }}>
        <h2>Product Not Found</h2>
        <Link href="/" style={{ color: '#007185', marginTop: '10px', display: 'inline-block' }}>
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        {product.category} &gt; {product.subcategory || 'Featured Items'}
      </div>

      <div className="product-detail-grid">
        {/* Thumbnails Gallery Column */}
        <div className="thumb-gallery">
          <img
            src={product.image}
            alt={product.title}
            className={`thumb-img ${selectedImage === product.image ? 'active' : ''}`}
            onClick={() => setSelectedImage(product.image)}
          />
          {product.thumbnails &&
            product.thumbnails.map((t: string, idx: number) => (
              <img
                key={idx}
                src={t}
                alt={`${product.title} ${idx}`}
                className={`thumb-img ${selectedImage === t ? 'active' : ''}`}
                onClick={() => setSelectedImage(t)}
              />
            ))}
        </div>

        {/* Main Image View Box */}
        <div className="main-image-box">
          <img src={selectedImage || product.image} alt={product.title} />
        </div>

        {/* Product Information Column */}
        <div className="product-main-info">
          <h1>{product.title}</h1>
          <div className="product-sub-store">Visit the {product.seller || 'Amazon Store'}</div>

          <div className="product-rating-row">
            <span>{product.rating}</span>
            <span className="stars-gold">★★★★★</span>
            <span style={{ color: '#007185' }}>({product.reviewsCount ? product.reviewsCount.toLocaleString() : '14,367'})</span>
          </div>

          {product.badge && (
            <div className="choice-badge">
              Amazon's <span>Choice</span>
            </div>
          )}

          {product.sustainabilityFeature && (
            <div style={{ fontSize: '13px', color: '#007600', margin: '8px 0', fontWeight: 600 }}>
              🌿 {product.sustainabilityFeature}
            </div>
          )}

          {product.boughtInPastMonth && (
            <div style={{ fontSize: '13px', fontWeight: 700, margin: '6px 0' }}>
              🔥 {product.boughtInPastMonth}
            </div>
          )}

          <div className="price-box">
            <span style={{ fontSize: '14px', verticalAlign: 'super' }}>PKR</span>
            <span className="price-pkr">{product.pricePKR.toLocaleString()}</span>
            {product.priceUSD && (
              <span style={{ fontSize: '12px', color: '#555', marginLeft: '6px' }}>
                (approx. ${product.priceUSD.toFixed(2)})
              </span>
            )}
            <div className="shipping-info">PKR 20,472.15 Shipping & Import Charges to Pakistan</div>
          </div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="swatch-selector">
              <h4>Color: <strong>{selectedColor}</strong></h4>
              <div className="swatch-grid">
                {product.colors.map((c: any) => (
                  <div
                    key={c.name}
                    className={`swatch-item ${selectedColor === c.name ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedColor(c.name);
                      if (c.image) setSelectedImage(c.image);
                    }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="swatch-selector">
              <h4>Size: <strong>{selectedSize}</strong></h4>
              <div className="swatch-grid">
                {product.sizes.map((s: string) => (
                  <div
                    key={s}
                    className={`swatch-item ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications Table */}
          {product.details && (
            <table className="specs-table">
              <tbody>
                {Object.entries(product.details).map(([key, value]) => (
                  <tr key={key}>
                    <td className="label">{key}</td>
                    <td>{value as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* About Bullet Points */}
          {product.aboutBulletPoints && (
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginTop: '16px' }}>About this item</h4>
              <ul className="bullets-list">
                {product.aboutBulletPoints.map((bp: string, idx: number) => (
                  <li key={idx}>{bp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Buy Box Column */}
        <div>
          <div className="buy-box">
            <div className="price">PKR {product.pricePKR.toLocaleString()}</div>
            <div className="in-stock-tag">In Stock</div>

            <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Quantity:</label>
            <select
              className="qty-select"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>

            {cartSuccess && (
              <div style={{ background: '#e7f4f5', color: '#007185', padding: '10px', borderRadius: '4px', fontSize: '13px', fontWeight: 700, marginBottom: '10px', textAlign: 'center' }}>
                ✓ Added to Cart!
              </div>
            )}

            <button className="yellow-btn-add" onClick={handleAddToCart} disabled={addingToCart}>
              {addingToCart ? 'Checking Auth...' : 'Add to cart'}
            </button>

            <button className="orange-btn-buy" onClick={handleAddToCart} disabled={addingToCart}>
              Buy Now
            </button>

            <div style={{ fontSize: '12px', color: '#555', marginTop: '14px', lineHeight: '1.5' }}>
              <div>Ships from <strong>{product.shipsFrom || 'Amazon'}</strong></div>
              <div>Sold by <strong>{product.seller || 'Amazon Direct'}</strong></div>
              <div>Returns <strong>30-day refund / replacement</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
