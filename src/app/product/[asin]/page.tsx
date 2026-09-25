'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Check,
  Truck,
  RefreshCw,
  Shield,
  Heart,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

export default function ProductDetailPage() {
  const params = useParams();
  const asin = (params?.asin as string) || '';
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const { addItem, openCart } = useCartStore();
  const { isInWishlist, toggleWishlist, fetchWishlist } = useWishlistStore();

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

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

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

  const handleToggleWishlist = async () => {
    if (!product || wishlistLoading) return;
    setWishlistLoading(true);
    const result = await toggleWishlist({
      asin: product.asin,
      title: product.title,
      image: product.image,
      price: product.price,
      category: product.category,
    });
    if (result.requiresAuth) {
      router.push(`/auth/login?returnUrl=/product/${product.asin}`);
    }
    setWishlistLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse bg-[#f8fafc]">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/5 h-96 bg-slate-100 rounded-xl skeleton-shimmer" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-slate-100 rounded w-3/4 skeleton-shimmer" />
            <div className="h-4 bg-slate-100 rounded w-1/2 skeleton-shimmer" />
            <div className="h-10 bg-slate-100 rounded w-1/3 skeleton-shimmer" />
            <div className="h-12 bg-slate-100 rounded-xl skeleton-shimmer" />
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

  const isLiked = isInWishlist(product.asin);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="text-slate-400">&rsaquo;</span>
          <Link href="/products" className="hover:text-blue-600 transition-colors">Catalog</Link>
          <span className="text-slate-400">&rsaquo;</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-blue-600 transition-colors capitalize">
            {product.category}
          </Link>
          <span className="text-slate-400">&rsaquo;</span>
          <span className="text-slate-900 line-clamp-1 font-semibold">{product.title}</span>
        </nav>

        {/* Main Product Card Grid */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row gap-10">
          
          {/* Image Gallery Column */}
          <div className="lg:w-2/5">
            <div className="sticky top-24 space-y-4">
              
              {/* Primary Image Container */}
              <div className="relative bg-slate-50 rounded-xl overflow-hidden border border-slate-200/80 flex items-center justify-center h-80 sm:h-96 p-6">
                <img
                  src={images[activeImage]}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain mix-blend-multiply transition-all duration-300"
                />

                {/* Floating Wishlist Heart Button */}
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  title={isLiked ? 'Remove from Wish List' : 'Add to Wish List'}
                  className={`absolute top-3 right-3 p-2.5 rounded-full border shadow-sm transition-all duration-200 ${
                    isLiked
                      ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-rose-100'
                      : 'bg-white text-slate-400 border-slate-200 hover:text-rose-500 hover:border-rose-200'
                  }`}
                >
                  <Heart size={18} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((i) => Math.max(0, i - 1))}
                      disabled={activeImage === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md border border-slate-200 hover:bg-white text-slate-800 disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setActiveImage((i) => Math.min(images.length - 1, i + 1))}
                      disabled={activeImage === images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md border border-slate-200 hover:bg-white text-slate-800 disabled:opacity-30"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Selector */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-16 rounded-lg bg-slate-50 p-1.5 border-2 transition-all flex-shrink-0 ${
                        activeImage === i ? 'border-blue-600 shadow-sm scale-105' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details & Purchase Form */}
          <div className="flex-1 space-y-6">
            
            {/* Header Title & Badges */}
            <div>
              {product.badge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white mb-3">
                  <Sparkles size={13} className="text-amber-400" /> {product.badge}
                </span>
              )}

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight font-display">
                {product.title}
              </h1>

              {product.brand && (
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Brand: <Link href={`/products?q=${product.brand}`} className="hover:underline text-blue-600 font-semibold">{product.brand}</Link>
                </p>
              )}
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-800 font-bold ml-1">{product.rating}</span>
              <span className="text-xs text-slate-400 font-normal">({product.reviewCount?.toLocaleString()} reviews)</span>
            </div>

            <div className="border-t border-slate-100 pt-5">
              
              {/* Price Box */}
              <div className="mb-5">
                {discount && (
                  <div className="text-xs text-slate-400 mb-1 font-medium">
                    List Price: <span className="line-through">${product.originalPrice?.toFixed(2)}</span>
                    <span className="ml-2 text-rose-600 font-bold">Save {discount}%</span>
                  </div>
                )}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.isPrime && (
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-md">
                      Express Delivery
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Inclusive of all taxes · Free standard delivery on orders over $50
                </p>
              </div>

              {/* Stock Status */}
              <div className={`text-xs font-bold mb-4 flex items-center gap-1.5 ${product.inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
                <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {product.inStock ? 'In Stock & Ready to Dispatch' : 'Currently Out of Stock'}
              </div>

              {/* Color Swatches */}
              {product.colors?.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-bold text-slate-700">
                    Color: <span className="text-slate-900">{selectedColor}</span>
                  </p>
                  <div className="flex gap-2.5 flex-wrap">
                    {product.colors.map((c: any) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        title={c.name}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === c.name ? 'border-slate-900 scale-110 shadow-sm ring-2 ring-slate-400/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Swatches */}
              {product.sizes?.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-bold text-slate-700">
                    Size: <span className="text-slate-900">{selectedSize}</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((s: string) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3.5 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                          selectedSize === s
                            ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Select */}
              <div className="flex items-center gap-3 mb-6">
                <label className="text-xs font-bold text-slate-700">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 max-w-md pt-2">
                {product.inStock && (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                        addedToCart
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                          : 'bg-slate-950 hover:bg-blue-600 text-white shadow-slate-950/20'
                      }`}
                    >
                      {addedToCart ? (
                        <>
                          <Check size={16} /> Added to Shopping Bag!
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} /> Add to Bag
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="w-full py-4 rounded-full font-black text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white transition-all duration-300 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <span>Buy Now with 1-Click</span>
                      <ArrowRight size={15} />
                    </button>
                  </>
                )}

                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`w-full py-3.5 rounded-full font-extrabold text-xs border transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-xs ${
                    isLiked
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-slate-200/90 liquid-glass-pill text-slate-800 hover:text-rose-600'
                  }`}
                >
                  <Heart size={15} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
                  {isLiked ? 'Remove from Saved Wishlist' : 'Add to Wishlist'}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 border border-slate-200/80 rounded-xl p-4 space-y-3 bg-slate-50/50 text-xs">
                <div className="flex items-center gap-3 text-slate-700">
                  <Truck size={18} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Fast &amp; Tracked Shipping</span>
                    <p className="text-[11px] text-slate-500">Delivered securely with real-time status</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <RefreshCw size={18} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold">30-Day Effortless Returns</span>
                    <p className="text-[11px] text-slate-500">Hassle-free replacement or refund</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Features & Specifications */}
        {(product.features?.length > 0 || product.description) && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-display">Product Overview &amp; Details</h2>
            {product.features?.length > 0 ? (
              <ul className="space-y-2.5 text-xs text-slate-600 font-normal">
                {product.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-blue-600 font-bold mt-0.5">&bull;</span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{product.description}</p>
            )}
          </div>
        )}

        {/* Related Products Grid */}
        {related.length > 0 && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 font-display">Recommended For You</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {related.slice(0, 6).map((p: any) => (
                <Link
                  key={p.asin}
                  href={`/product/${p.asin}`}
                  className="bg-white p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all text-center flex flex-col justify-between group"
                >
                  <div className="w-full h-28 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 line-clamp-2 mb-1 transition-colors">{p.title}</p>
                  <p className="text-xs font-bold text-slate-900">${p.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
