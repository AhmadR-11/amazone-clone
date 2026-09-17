'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';

export interface CartItem {
  asin: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isSyncing: boolean;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Partial<CartItem> & { asin: string; title: string; image: string; price: number }, qty?: number) => void;
  removeItem: (asin: string, color?: string, size?: string) => void;
  updateQty: (asin: string, qty: number, color?: string, size?: string) => void;
  clearCart: () => void;
  syncFromServer: (serverItems?: CartItem[]) => Promise<void>;

  // Computed
  totalItems: () => number;
  totalPrice: () => number;
  getTotalCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isSyncing: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (item, qty = 1) => {
        const itemQty = item.quantity || qty;
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.asin === item.asin &&
              i.color === item.color &&
              i.size === item.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.asin === item.asin &&
                i.color === item.color &&
                i.size === item.size
                  ? { ...i, quantity: i.quantity + itemQty }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                asin: item.asin,
                title: item.title,
                image: item.image,
                price: item.price,
                quantity: itemQty,
                color: item.color,
                size: item.size,
              },
            ],
          };
        });
        toast.success(`${item.title.slice(0, 30)}... added to cart`, {
          icon: '🛒',
          duration: 2500,
        });
        // Also persist to server (fire and forget)
        fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...item, quantity: itemQty }),
        }).catch(() => {});
      },

      removeItem: (asin, color, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.asin === asin &&
                (color ? i.color === color : true) &&
                (size ? i.size === size : true)
              )
          ),
        }));
        toast.success('Item removed from cart', { icon: '🗑️', duration: 2000 });
        // Persist to server
        const params = new URLSearchParams({ asin });
        if (color) params.append('color', color);
        if (size) params.append('size', size);
        fetch(`/api/cart/remove/${asin}?${params.toString()}`, {
          method: 'DELETE',
        }).catch(() => {});
      },

      updateQty: (asin, qty, color, size) => {
        if (qty <= 0) {
          get().removeItem(asin, color, size);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.asin === asin &&
            (color ? i.color === color : true) &&
            (size ? i.size === size : true)
              ? { ...i, quantity: qty }
              : i
          ),
        }));
        // Persist to server
        fetch('/api/cart/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asin, quantity: qty, color, size }),
        }).catch(() => {});
      },

      clearCart: () => {
        set({ items: [] });
        fetch('/api/cart', { method: 'DELETE' }).catch(() => {});
      },

      syncFromServer: async (serverItems?: CartItem[]) => {
        if (serverItems) {
          set({ items: serverItems, isSyncing: false });
          return;
        }
        try {
          set({ isSyncing: true });
          const res = await fetch('/api/cart');
          if (res.ok) {
            const data = await res.json();
            if (data.cart?.items) {
              set({ items: data.cart.items });
            }
          }
        } catch (err) {
          console.error('Error syncing cart:', err);
        } finally {
          set({ isSyncing: false });
        }
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'amazon-clone-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
