'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export interface WishlistItem {
  asin: string;
  title: string;
  imageUrl?: string;
  price: number;
  category?: string;
  addedAt?: string;
}

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;

  fetchWishlist: () => Promise<void>;
  isInWishlist: (asin: string) => boolean;
  addToWishlist: (item: {
    asin: string;
    title: string;
    image?: string;
    imageUrl?: string;
    price?: number;
    category?: string;
  }) => Promise<{ success: boolean; requiresAuth?: boolean }>;
  removeFromWishlist: (asin: string) => Promise<{ success: boolean; requiresAuth?: boolean }>;
  toggleWishlist: (item: {
    asin: string;
    title: string;
    image?: string;
    imageUrl?: string;
    price?: number;
    category?: string;
  }) => Promise<{ success: boolean; added: boolean; requiresAuth?: boolean }>;
  clearWishlist: () => void;
  setItems: (items: WishlistItem[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/wishlist');
          if (res.ok) {
            const data = await res.json();
            set({ items: data.items || [] });
          } else if (res.status === 401) {
            set({ items: [] });
          }
        } catch {
          // Keep current state on network error
        } finally {
          set({ isLoading: false });
        }
      },

      isInWishlist: (asin: string) => {
        return get().items.some((i) => i.asin === asin);
      },

      setItems: (items: WishlistItem[]) => set({ items }),

      clearWishlist: () => set({ items: [] }),

      addToWishlist: async (item) => {
        const imageUrl = item.imageUrl || item.image || '';
        const price = item.price || 0;
        const asin = item.asin;
        const title = item.title;
        const category = item.category || '';

        // Optimistic update
        const existing = get().items.some((i) => i.asin === asin);
        if (!existing) {
          set((state) => ({
            items: [
              ...state.items,
              {
                asin,
                title,
                imageUrl,
                price,
                category,
                addedAt: new Date().toISOString(),
              },
            ],
          }));
        }

        try {
          const res = await fetch('/api/wishlist/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ asin, title, imageUrl, price, category }),
          });

          if (res.status === 401) {
            // Revert optimistic update
            set((state) => ({
              items: state.items.filter((i) => i.asin !== asin),
            }));
            toast.error('Please sign in to save items to your wishlist');
            return { success: false, requiresAuth: true };
          }

          if (res.ok) {
            const data = await res.json();
            if (data.items) {
              set({ items: data.items });
            }
            toast.success('Added to your Wishlist', {
              icon: '❤️',
              duration: 2500,
            });
            return { success: true };
          } else {
            set((state) => ({
              items: state.items.filter((i) => i.asin !== asin),
            }));
            toast.error('Failed to add to wishlist');
            return { success: false };
          }
        } catch {
          set((state) => ({
            items: state.items.filter((i) => i.asin !== asin),
          }));
          toast.error('Network error adding to wishlist');
          return { success: false };
        }
      },

      removeFromWishlist: async (asin: string) => {
        const prevItems = get().items;
        // Optimistic update
        set((state) => ({
          items: state.items.filter((i) => i.asin !== asin),
        }));

        try {
          const res = await fetch(`/api/wishlist/remove/${asin}`, {
            method: 'DELETE',
          });

          if (res.status === 401) {
            set({ items: prevItems });
            toast.error('Please sign in to manage your wishlist');
            return { success: false, requiresAuth: true };
          }

          if (res.ok) {
            const data = await res.json();
            if (data.items) {
              set({ items: data.items });
            }
            toast.success('Removed from your Wishlist', {
              duration: 2500,
            });
            return { success: true };
          } else {
            set({ items: prevItems });
            toast.error('Failed to remove from wishlist');
            return { success: false };
          }
        } catch {
          set({ items: prevItems });
          toast.error('Network error removing from wishlist');
          return { success: false };
        }
      },

      toggleWishlist: async (item) => {
        const isFav = get().isInWishlist(item.asin);
        if (isFav) {
          const res = await get().removeFromWishlist(item.asin);
          return { success: res.success, added: false, requiresAuth: res.requiresAuth };
        } else {
          const res = await get().addToWishlist(item);
          return { success: res.success, added: true, requiresAuth: res.requiresAuth };
        }
      },
    }),
    {
      name: 'amazon-clone-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
