'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { User, Package, ArrowRight } from 'lucide-react';

export default function PersonalizedRecommendations() {
  const { user, fetchSession } = useAuthStore();

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  if (user) {
    return (
      <section className="recommendations-section max-w-7xl mx-auto my-8 bg-white p-8 rounded-lg border border-gray-200 text-center shadow-sm">
        <div className="w-12 h-12 bg-amber-100 text-amazon_orange rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-extrabold text-amazon_blue mb-1">
          Welcome back, {user.name}!
        </h3>
        <p className="text-xs text-gray-600 mb-4 max-w-md mx-auto">
          Explore your recent orders, personalized product recommendations, and saved delivery addresses.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold px-6 py-2 rounded-md text-sm transition inline-flex items-center gap-1.5 shadow-sm"
          >
            Explore Today&apos;s Deals <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/orders"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-5 py-2 rounded-md text-sm transition inline-flex items-center gap-1.5 border border-gray-300"
          >
            <Package className="w-4 h-4 text-amazon_orange" /> Your Orders
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="recommendations-section max-w-7xl mx-auto my-8 bg-white p-8 rounded-lg border border-gray-200 text-center shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-2">See personalized recommendations</h3>
      <Link
        href="/auth/login"
        className="bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-extrabold px-12 py-2 rounded-md text-sm transition inline-block shadow-sm my-2"
      >
        Sign in
      </Link>
      <div className="text-xs text-gray-600 mt-2">
        New customer?{' '}
        <Link href="/auth/register" className="text-amazon_blue hover:text-amazon_orange hover:underline font-semibold">
          Start here.
        </Link>
      </div>
    </section>
  );
}
