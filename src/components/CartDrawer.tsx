'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalItems, totalPrice } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeCart();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, closeCart]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeCart]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-amazon-dark text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <h2 className="text-lg font-bold">
              Shopping Cart
              {totalItems() > 0 && (
                <span suppressHydrationWarning className="ml-2 text-sm text-amazon-yellow">
                  ({totalItems()} {totalItems() === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-20">
              <ShoppingCart size={64} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Discover thousands of products
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                className="bg-amazon-yellow hover:bg-amazon-yellow-hover text-amazon-dark font-semibold px-6 py-2 rounded-full text-sm transition-colors"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={`${item.asin}-${item.color}-${item.size}-${idx}`}
                  className="flex gap-3 pb-4 border-b border-gray-100 last:border-0"
                >
                  {/* Image */}
                  <Link
                    href={`/product/${item.asin}`}
                    onClick={closeCart}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 object-contain bg-gray-50 rounded border"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.asin}`}
                      onClick={closeCart}
                      className="text-sm text-amazon-teal hover:underline line-clamp-2 font-medium"
                    >
                      {item.title}
                    </Link>

                    {item.color && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Color: {item.color}
                      </p>
                    )}
                    {item.size && (
                      <p className="text-xs text-gray-500">Size: {item.size}</p>
                    )}

                    <p className="text-sm font-bold text-gray-900 mt-1">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Qty Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                        <button
                          onClick={() =>
                            updateQty(item.asin, item.quantity - 1, item.color, item.size)
                          }
                          className="px-2 py-1 hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium border-x border-gray-300 bg-gray-50">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQty(item.asin, item.quantity + 1, item.color, item.size)
                          }
                          className="px-2 py-1 hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.asin, item.color, item.size)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-5 py-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-gray-800">
                Subtotal ({totalItems()} items):
              </span>
              <span className="text-xl font-bold text-gray-900">
                ${totalPrice().toFixed(2)}
              </span>
            </div>

            {!isAuthenticated() && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded mb-3">
                ⚠️{' '}
                <Link href="/auth/login" onClick={closeCart} className="underline font-semibold">
                  Sign in
                </Link>{' '}
                to save your cart and checkout
              </p>
            )}

            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full text-center bg-amazon-yellow hover:bg-amazon-yellow-hover text-amazon-dark font-bold py-2.5 rounded-full mb-2 transition-colors text-sm"
            >
              View Cart
            </Link>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center bg-amazon-orange hover:bg-orange-400 text-amazon-dark font-bold py-2.5 rounded-full transition-colors text-sm"
            >
              Proceed to Checkout
            </Link>

            <p className="text-xs text-center text-gray-500 mt-3 flex items-center justify-center gap-1">
              🔒 Secure Checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
