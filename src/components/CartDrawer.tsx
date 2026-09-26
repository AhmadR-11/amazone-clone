'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalItems, totalPrice } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();

  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeCart();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, closeCart]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeCart]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const count = totalItems();
  const price = totalPrice();
  const freeShippingThreshold = 50;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - price);
  const progressPercent = Math.min(100, (price / freeShippingThreshold) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={closeCart}
      />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white/95 backdrop-blur-2xl shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border-l border-slate-200/80 text-slate-900 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Shopping bag drawer"
      >
        {/* Specular Edge Highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-950 text-white flex items-center justify-center font-black shadow-md">
              <ShoppingBag size={18} />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-950 font-sans tracking-tight">
                Shopping Bag
              </h2>
              {count > 0 && (
                <span suppressHydrationWarning className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={closeCart}
            className="p-2 rounded-full text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
            aria-label="Close cart drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator (Visible when cart has items) */}
        {count > 0 && (
          <div className="mx-5 mt-4 p-3.5 rounded-[20px] bg-slate-50/90 border border-slate-200/80 text-xs space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" />
                {amountToFreeShipping === 0
                  ? 'Order qualifies for FREE Delivery!'
                  : `Add $${amountToFreeShipping.toFixed(2)} more for FREE Delivery`}
              </span>
              <span className="font-mono text-blue-600 font-bold">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-slate-950 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Scrollable Cart Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                <ShoppingBag size={34} />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1 font-sans">
                Your bag is empty
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mb-6 font-normal leading-relaxed">
                Explore our curated luxury products, studio acoustics, and fashion apparel.
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                className="px-6 py-3 rounded-full bg-slate-950 hover:bg-blue-600 text-white font-extrabold text-xs tracking-wider transition-all duration-300 shadow-md hover:scale-105 active:scale-95"
              >
                Browse Products &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const itemKey = `${item.asin}-${item.color || ''}-${item.size || ''}-${idx}`;
                return (
                  <div
                    key={itemKey}
                    className="flex gap-4 p-4 bg-white rounded-[22px] border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group shadow-xs"
                  >
                    {/* Item Thumbnail */}
                    <Link
                      href={`/product/${item.asin}`}
                      onClick={closeCart}
                      className="w-20 h-20 rounded-[16px] bg-slate-50 p-2 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                      />
                    </Link>

                    {/* Item Info & Actions */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/product/${item.asin}`}
                          onClick={closeCart}
                          className="text-xs sm:text-sm font-extrabold text-slate-900 hover:text-blue-600 line-clamp-2 leading-snug transition-colors font-sans"
                        >
                          {item.title}
                        </Link>

                        {(item.color || item.size) && (
                          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                            {item.color && <span>Color: {item.color} </span>}
                            {item.size && <span>Size: {item.size}</span>}
                          </p>
                        )}
                      </div>

                      {/* Price & Quantity Controls Row */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                        <span className="text-base font-black text-slate-950 font-sans tracking-tight">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Quantity Capsule */}
                          <div className="flex items-center bg-slate-100/90 border border-slate-200/80 rounded-full px-2 py-0.5 gap-1.5">
                            <button
                              onClick={() =>
                                updateQty(item.asin, item.quantity - 1, item.color, item.size)
                              }
                              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-white active:scale-90 transition-all cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="px-1 text-xs font-black text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQty(item.asin, item.quantity + 1, item.color, item.size)
                              }
                              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-white active:scale-90 transition-all cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          {/* Delete Item Button */}
                          <button
                            onClick={() => removeItem(item.asin, item.color, item.size)}
                            className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer active:scale-90"
                            aria-label="Remove item from bag"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer Summary */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-5 bg-white space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">Subtotal ({count} items)</span>
              <span className="text-2xl font-black text-slate-950 font-sans tracking-tight">
                ${price.toFixed(2)}
              </span>
            </div>

            {!isAuthenticated() && (
              <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl font-medium">
                <Link href="/auth/login" onClick={closeCart} className="underline font-bold text-blue-600">
                  Sign in
                </Link>{' '}
                to sync your bag and save orders.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold py-3.5 rounded-full text-xs tracking-wider transition-all border border-slate-200/80 cursor-pointer"
              >
                View Full Bag
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full text-center bg-slate-950 hover:bg-blue-600 text-white font-black py-3.5 rounded-full text-xs uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1.5 pt-1 font-medium">
              <ShieldCheck size={13} className="text-emerald-600" /> 256-Bit SSL Encrypted Secure Checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
