'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  isGuest?: boolean;
  sessionTimeRemaining?: string;
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  isAuthenticated: () => boolean;
  fetchSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,

      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      isAuthenticated: () => {
        const { user } = get();
        return !!user && !user.isGuest;
      },

      fetchSession: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/me');
          const data = await res.json();
          if (data.user && !data.isGuest) {
            set({
              user: {
                userId: data.user.userId,
                name: data.user.name,
                email: data.user.email,
                isGuest: false,
                sessionTimeRemaining: data.sessionTimeRemaining,
              },
            });
          } else {
            set({ user: null });
          }
        } catch {
          set({ user: null });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'amazon-clone-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
