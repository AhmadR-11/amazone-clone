'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Check,
  Truck,
  RefreshCw,
  Shield,
  Heart,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function ProductDetailPage() {
  const params = useParams();
  const asin = params.asin as string;
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${asin}`);
        if (!res.ok) {
          router.push('/products');
          return;
        }
        const data = await res.json();
        setProduct(data.product);
        setRelated(data.related || []);
        if (data.product?.colors?.length) {
          setSelectedColor(data.product.colors[0].name);
        }
        if (data.product?.sizes?.length) {
          setSelectedSize(data.product.sizes[0]);
        }
        // Log view history
        fetch('/api/user/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'view',
            asin: data.product.asin,
            title: data.product.title,
            image: data.product.image,
            price: data.product.price,
            category: data.product.category,
          }),
        }).catch(() => {});
      } catch {
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    if (asin) fetchProduct();
  }, [asin, router]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(
      {
        asin: product.asin,
        title: product.title,
        image: product.image,
        price: product.price,
        color: selectedColor,
        size: selectedSize,
      },
      quantity
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
    openCart();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-[1480px] mx-auto px-4 py-8 animate-pulse">
        <div className="bg-white rounded-md p-6 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/5 h-96 bg-gray-200 rounded" />
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length ? product.images : [product.image];
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1480px] mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="text-xs text-amazon-teal mb-4 flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="text-gray-400">›</span>
          <Link href="/products" className="hover:underline">Products</Link>
          <span className="text-gray-400">›</span>
          <Link href={`/products?category=${product.category}`} className="hover:underline">
            {product.category}
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-600 line-clamp-1">{product.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Gallery */}
          <div className="lg:w-2/5">
            <div className="sticky top-20">
              {/* Main Image */}
              <div className="relative bg-gray-50 rounded-md overflow-hidden mb-3 flex items-center justify-center h-96">
                <img
                  src={images[activeImage]}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((i) => Math.max(0, i - 1))}
                      disabled={activeImage === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setActiveImage((i) => Math.min(images.length - 1, i + 1))}
                      disabled={activeImage === images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 disabled:opacity-30 transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-16 border-2 rounded overflow-hidden flex-shrink-0 transition-colors ${
                        activeImage === i ? 'border-amazon-orange-btn' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1">
            {/* Badge */}
            {product.badge && (
              <div className="inline-block text-xs font-bold text-white bg-amazon-orange-btn px-2 py-0.5 rounded mb-2">
                {product.badge}
              </div>
            )}

            <h1 className="text-xl font-medium text-gray-900 mb-1">{product.title}</h1>

            {product.brand && (
              <p className="text-sm text-amazon-teal mb-2">
                by{' '}
                <Link href={`/products?q=${product.brand}`} className="hover:underline">
                  {product.brand}
                </Link>
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.floor(product.rating)
                        ? 'fill-amazon-orange text-amazon-orange'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-amazon-teal hover:underline cursor-pointer">
                {product.rating} ({product.reviewCount?.toLocaleString()} ratings)
              </span>
            </div>

            <hr className="border-gray-200 mb-3" />

            {/* Price */}
            <div className="mb-4">
              {discount && (
                <div className="text-sm text-gray-500 mb-1">
                  List Price:{' '}
                  <span className="line-through">${product.originalPrice?.toFixed(2)}</span>
                  <span className="ml-2 text-red-600 font-semibold">Save {discount}%</span>
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  <sup className="text-lg">$</sup>
                  {Math.floor(product.price)}
                  <sup className="text-lg">{(product.price % 1).toFixed(2).slice(1)}</sup>
                </span>
                {product.isPrime && (
                  <span className="text-sm font-bold text-amazon-dark bg-amazon-yellow px-2 py-0.5 rounded">
                    prime
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                FREE Returns · FREE delivery{' '}
                <span className="font-bold">within 7 business days</span>
              </p>
            </div>

            {/* In Stock */}
            <div className={`text-lg font-medium mb-3 ${product.inStock ? 'text-amazon-green' : 'text-red-600'}`}>
              {product.inStock ? 'In Stock' : 'Currently unavailable'}
            </div>

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Color: <span className="font-normal">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((c: any) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      className={`w-8 h-8 rounded-full border-4 transition-all ${
                        selectedColor === c.name
                          ? 'border-amazon-teal scale-110'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Size: <span className="font-normal">{selectedSize}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s: string) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 border rounded text-sm font-medium transition-all ${
                        selectedSize === s
                          ? 'border-amazon-teal bg-amazon-teal/10 text-amazon-teal'
                          : 'border-gray-300 hover:border-amazon-orange-btn'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-semibold text-gray-800">Qty:</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-amazon-orange-btn"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* CTAs */}
            {product.inStock && (
              <div className="flex flex-col gap-3 max-w-sm">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-2.5 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    addedToCart
                      ? 'bg-green-500 text-white'
                      : 'bg-amazon-yellow hover:bg-amazon-yellow-hover text-amazon-dark'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check size={16} /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} /> Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full py-2.5 rounded-full font-bold text-sm bg-amazon-orange hover:bg-orange-400 text-amazon-dark transition-colors"
                >
                  Buy Now
                </button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-5 border border-gray-200 rounded-md p-4 space-y-2.5 max-w-sm text-sm">
              <div className="flex items-start gap-3">
                <Truck size={18} className="text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold">FREE Shipping</span>
                  <p className="text-xs text-gray-500">On orders over $25</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw size={18} className="text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold">Free Returns</span>
                  <p className="text-xs text-gray-500">Return within 30 days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold">Secure Payment</span>
                  <p className="text-xs text-gray-500">256-bit SSL encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features / Description */}
        {(product.features?.length > 0 || product.description) && (
          <div className="mt-8 bg-white border border-gray-200 rounded-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About this item</h2>
            {product.features?.length > 0 ? (
              <ul className="space-y-2">
                {product.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amazon-green font-bold mt-0.5">›</span>
                    {f}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
            )}
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-8 bg-white border border-gray-200 rounded-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Customers also viewed
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.slice(0, 8).map((p: any) => (
                <Link
                  key={p.asin}
                  href={`/product/${p.asin}`}
                  className="flex flex-col items-center text-center group p-3 rounded hover:shadow-md transition-shadow"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-28 object-contain mb-2 group-hover:scale-105 transition-transform"
                  />
                  <p className="text-xs text-amazon-teal group-hover:underline line-clamp-2 mb-1">{p.title}</p>
                  <p className="text-sm font-bold text-gray-900">${p.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
