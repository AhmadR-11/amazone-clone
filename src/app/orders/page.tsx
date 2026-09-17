'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Clock, CheckCircle2, Truck, RefreshCw, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

interface OrderItem {
  asin: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: any;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleReorder = (item: OrderItem) => {
    addItem({
      asin: item.asin,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: 1,
    });
    toast.success(`Re-added ${item.title.substring(0, 20)}... to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-amazon_bg flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amazon_yellow border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amazon_blue font-medium text-sm">Fetching your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon_bg py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-amazon_blue">Your Orders</h1>
          <span className="text-xs text-gray-500 font-medium">{orders.length} orders placed</span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders placed yet</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Looks like you haven't made any orders yet. Discover items, electronics, and daily essentials on Amazon.
            </p>
            <Link
              href="/products"
              className="bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold px-6 py-2.5 rounded-md inline-block text-sm transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <div key={order._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  {/* Order Header Card Bar */}
                  <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-gray-600">
                    <div>
                      <div className="font-semibold uppercase tracking-wider text-gray-500">Order Placed</div>
                      <div className="font-bold text-gray-800 mt-0.5">{formattedDate}</div>
                    </div>
                    <div>
                      <div className="font-semibold uppercase tracking-wider text-gray-500">Total</div>
                      <div className="font-bold text-gray-900 mt-0.5">${order.totalAmount?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                      <div className="font-semibold uppercase tracking-wider text-gray-500">Ship To</div>
                      <div className="font-bold text-amazon_blue truncate mt-0.5" title={order.shippingAddress?.fullName}>
                        {order.shippingAddress?.fullName || 'Valued Customer'}
                      </div>
                    </div>
                    <div className="text-right sm:text-right">
                      <div className="font-semibold uppercase tracking-wider text-gray-500">Order # {order._id.substring(0, 10)}...</div>
                      <Link href={`/orders/${order._id}`} className="text-amazon_blue font-bold hover:underline flex items-center justify-end gap-0.5 mt-0.5">
                        View order details <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Status: <strong className="capitalize">{order.status || 'Processing'}</strong></span>
                    </div>
                    <span className="text-gray-500">Expected Delivery: Within 2-3 Business Days</span>
                  </div>

                  {/* Items list */}
                  <div className="p-6 divide-y divide-gray-100">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img src={item.image || '/placeholder.png'} alt={item.title} className="w-16 h-16 object-contain rounded border border-gray-100" />
                          <div>
                            <Link href={`/product/${item.asin}`} className="font-medium text-sm text-amazon_blue hover:text-amazon_orange line-clamp-2">
                              {item.title}
                            </Link>
                            <div className="text-xs text-gray-500 mt-1">
                              Qty: {item.quantity} × ${item.price?.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => handleReorder(item)}
                            className="w-full sm:w-auto bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold px-4 py-1.5 rounded text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Buy it again
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
