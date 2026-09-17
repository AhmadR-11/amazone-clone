'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { Trash2, ShieldCheck, Clock, ArrowRight, ShoppingBag, Plus, Minus, Tag, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQty, removeItem, clearCart, syncFromServer, getTotalPrice, getTotalCount } = useCartStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    const initCart = async () => {
      try {
        await syncFromServer();
        const authRes = await fetch('/api/auth/me');
        if (authRes.ok) {
          const authData = await authRes.json();
          setSessionInfo(authData);
        }
      } catch (err) {
        console.error('Failed to load cart or session:', err);
      } finally {
        setLoading(false);
      }
    };
    initCart();
  }, [syncFromServer]);

  const totalPrice = getTotalPrice();
  const totalCount = getTotalCount();
  const freeShippingThreshold = 50; // $50 for free shipping
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);
  const progressPercent = Math.min(100, (totalPrice / freeShippingThreshold) * 100);

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-amazon_bg flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amazon_yellow border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amazon_blue font-medium text-sm">Loading your shopping cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon_bg py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Guest Session Notification Banner */}
        {sessionInfo?.isGuest && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-semibold">Guest Session Active</span> ({sessionInfo.sessionTimeRemaining || '30m remaining'}). Your items are stored temporarily.{' '}
                <Link href="/auth/login" className="text-amazon_blue font-bold underline hover:text-amazon_yellow">
                  Sign in to save permanently
                </Link>
              </div>
            </div>
            <span className="text-xs bg-white text-gray-600 px-2.5 py-1 rounded border border-amber-200 font-mono">
              Session ID: {sessionInfo.sessionKey?.substring(0, 14)}...
            </span>
          </div>
        )}

        {/* Header Title & Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-amazon_blue">Shopping Cart</h1>
          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all items from your cart?')) clearCart();
              }}
              className="text-xs text-red-600 hover:underline font-medium"
            >
              Clear all items
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">

            {/* Free Shipping Bar */}
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {amountToFreeShipping === 0
                    ? 'Your order qualifies for FREE Shipping!'
                    : `Add $${amountToFreeShipping.toFixed(2)} more of eligible items to get FREE Shipping`}
                </span>
                <span>{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-amazon_blue mb-2">Your Amazon Cart is empty</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                  Your Shopping Cart lives to serve. Give it purpose — fill it with books, electronics, videos, and more.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-semibold text-sm px-6 py-3 rounded-md shadow transition"
                >
                  Explore Products <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {items.map((item, idx) => {
                  const asin = item.asin || (item as any).productId?._id || (item as any).productId || `item-${idx}`;
                  const title = item.title || (item as any).productId?.title || 'Product';
                  const image = item.image || (item as any).productId?.image || '/placeholder.png';
                  const price = item.price || (item as any).productId?.price || 0;

                  return (
                    <div key={asin + idx} className="py-6 flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <Link href={`/product/${asin}`} className="w-28 h-28 flex-shrink-0 mx-auto sm:mx-0">
                        <img src={image} alt={title} className="w-full h-full object-contain hover:scale-105 transition" />
                      </Link>

                      {/* Product Metadata & Controls */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link
                            href={`/product/${asin}`}
                            className="font-medium text-amazon_blue hover:text-amazon_orange text-base line-clamp-2 mb-1"
                          >
                            {title}
                          </Link>
                          <div className="text-xs text-emerald-700 font-semibold mb-1">In Stock</div>
                          <div className="text-xs text-gray-500 mb-2">Eligible for FREE Shipping & FREE Returns</div>

                          {item.color && (
                            <div className="text-xs text-gray-600">Color: <span className="font-semibold text-gray-800">{item.color}</span></div>
                          )}
                          {item.size && (
                            <div className="text-xs text-gray-600">Size: <span className="font-semibold text-gray-800">{item.size}</span></div>
                          )}
                        </div>

                        {/* Actions & Quantity Selector */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 pt-2 text-xs text-gray-600">
                          <div className="flex items-center border border-gray-300 rounded-md bg-gray-50">
                            <button
                              onClick={() => updateQty(asin, Math.max(1, item.quantity - 1), item.color, item.size)}
                              className="px-2.5 py-1 hover:bg-gray-200 transition font-bold"
                              title="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-3 font-semibold text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(asin, item.quantity + 1, item.color, item.size)}
                              className="px-2.5 py-1 hover:bg-gray-200 transition font-bold"
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(asin, item.color, item.size)}
                            className="text-gray-500 hover:text-red-600 font-medium flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>

                          <span className="text-gray-300">|</span>

                          <button className="hover:text-amazon_blue transition">Save for later</button>
                        </div>
                      </div>

                      {/* Right Item Total Price */}
                      <div className="text-right sm:w-28 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                        <span className="sm:hidden text-xs text-gray-500">Price:</span>
                        <div className="text-lg font-bold text-gray-900">
                          ${(price * item.quantity).toFixed(2)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            (${price.toFixed(2)} each)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Order Summary & Checkout CTA */}
          {items.length > 0 && (
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm sticky top-20">
                <div className="text-xs text-emerald-700 font-medium mb-3 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> FREE Delivery on qualified items
                </div>

                <div className="border-t border-b border-gray-100 py-3 my-2">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm text-gray-600">Subtotal ({totalCount} items):</span>
                    <span className="text-xl font-extrabold text-gray-900">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Estimated Shipping:</span>
                    <span className="text-emerald-700 font-medium">{amountToFreeShipping === 0 ? 'FREE' : '$4.99'}</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-gray-700 my-3 cursor-pointer">
                  <input type="checkbox" className="rounded text-amazon_orange focus:ring-amazon_orange" />
                  This order contains a gift
                </label>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold py-3 rounded-md text-sm shadow transition flex items-center justify-center gap-2 mb-3"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 text-center pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 256-Bit SSL Encrypted Checkout
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
