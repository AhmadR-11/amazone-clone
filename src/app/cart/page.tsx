'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { Trash2, ShieldCheck, Clock, ArrowRight, ShoppingBag, Plus, Minus, Tag, CheckCircle2, Sparkles } from 'lucide-react';
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
  const freeShippingThreshold = 50;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);
  const progressPercent = Math.min(100, (totalPrice / freeShippingThreshold) * 100);

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      toast.error('Your shopping bag is empty');
      return;
    }
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-xs">Loading shopping bag...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Guest Session Notification Banner */}
        {sessionInfo?.isGuest && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-5 py-3.5 rounded-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-bold">Guest Session Active</span> ({sessionInfo.sessionTimeRemaining || '30m remaining'}). Items stored temporarily.{' '}
                <Link href="/auth/login" className="text-blue-600 font-bold underline hover:text-blue-700">
                  Sign in to save cart permanently
                </Link>
              </div>
            </div>
            <span className="text-[10px] bg-amber-100/80 text-amber-900 px-2.5 py-1 rounded-md font-mono font-medium">
              Session: {sessionInfo.sessionKey?.substring(0, 14)}...
            </span>
          </div>
        )}

        {/* Header Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">Shopping Bag</h1>
            <span className="text-xs font-bold text-slate-500 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
              {totalCount} {totalCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all items from your bag?')) clearCart();
              }}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Clear Bag
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-3 space-y-6">

            {/* Free Shipping Progress Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {amountToFreeShipping === 0
                    ? 'Order qualifies for FREE Worldwide Delivery!'
                    : `Add $${amountToFreeShipping.toFixed(2)} more for FREE Delivery`}
                </span>
                <span className="text-slate-600 font-mono">{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                <div
                  className="bg-slate-900 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="bg-white p-16 rounded-2xl text-center border border-slate-200/90 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                  <ShoppingBag className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1 font-display">Your shopping bag is empty</h2>
                <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                  Explore our curated luxury products, fashion wear, and electronics catalog.
                </p>
                <Link
                  href="/products"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm inline-flex items-center gap-2 transition-colors"
                >
                  <span>Explore Catalog</span> <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, idx) => {
                  const asin = item.asin || (item as any).productId?._id || (item as any).productId || `item-${idx}`;
                  const title = item.title || (item as any).productId?.title || 'Product';
                  const image = item.image || (item as any).productId?.image || '/placeholder.png';
                  const price = item.price || (item as any).productId?.price || 0;

                  return (
                    <div key={asin + idx} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-5 items-center sm:items-stretch hover:border-slate-300 transition-all">
                      
                      {/* Product Thumbnail */}
                      <Link href={`/product/${asin}`} className="w-24 h-24 flex-shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-center overflow-hidden">
                        <img src={image} alt={title} className="max-h-full max-w-full object-contain mix-blend-multiply hover:scale-105 transition-transform" />
                      </Link>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between w-full">
                        <div>
                          <Link
                            href={`/product/${asin}`}
                            className="font-bold text-slate-900 hover:text-blue-600 text-sm line-clamp-2 mb-1 transition-colors"
                          >
                            {title}
                          </Link>
                          <div className="text-[11px] text-emerald-700 font-semibold mb-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> In Stock &amp; Ready to Ship
                          </div>

                          {(item.color || item.size) && (
                            <div className="text-[11px] text-slate-500">
                              {item.color && <span>Color: <strong className="text-slate-800">{item.color}</strong> </span>}
                              {item.size && <span>Size: <strong className="text-slate-800">{item.size}</strong></span>}
                            </div>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQty(asin, Math.max(1, item.quantity - 1), item.color, item.size)}
                              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="px-3 font-bold text-slate-900 text-xs">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(asin, item.quantity + 1, item.color, item.size)}
                              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition font-bold text-xs"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(asin, item.color, item.size)}
                            className="text-xs text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="text-right sm:w-32 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        <span className="sm:hidden text-xs text-slate-500">Price:</span>
                        <div className="text-lg font-extrabold text-slate-900 font-display">
                          ${(price * item.quantity).toFixed(2)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-slate-400 font-normal">
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

          {/* Right Column: Order Summary & Checkout */}
          {items.length > 0 && (
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 sticky top-24 space-y-4 shadow-sm">
                <h3 className="font-bold text-slate-900 text-base font-display">Order Summary</h3>

                <div className="space-y-2.5 text-xs text-slate-600 border-t border-b border-slate-100 py-4 font-medium">
                  <div className="flex justify-between items-center">
                    <span>Subtotal ({totalCount} items):</span>
                    <span className="font-bold text-slate-900 text-sm">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping:</span>
                    <span className="text-emerald-700 font-semibold">{amountToFreeShipping === 0 ? 'FREE' : '$4.99'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm font-extrabold text-slate-900">
                  <span>Total Amount:</span>
                  <span className="text-xl font-bold text-slate-900 font-display">
                    ${(totalPrice + (amountToFreeShipping === 0 ? 0 : 4.99)).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center pt-1 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 256-Bit Encrypted Checkout
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
