'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Clock, CheckCircle2, Truck, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
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
    toast.success(`Re-added ${item.title.substring(0, 20)}... to bag`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-xs">Fetching your order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-display">Your Order History</h1>
          </div>
          <span className="text-xs text-slate-600 font-bold bg-slate-200/70 px-3 py-1 rounded-full whitespace-nowrap">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-8 sm:p-16 rounded-2xl text-center border border-slate-200/90 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1 font-display">No orders placed yet</h2>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
              Explore our luxury product catalog to place your first order with tracked shipping.
            </p>
            <Link
              href="/products"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-xs shadow-sm inline-flex items-center gap-2 transition-colors"
            >
              <span>Explore Products</span> <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div key={order._id} className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:border-slate-300 transition-all">
                  
                  {/* Order Header Bar */}
                  <div className="bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs text-slate-600">
                    <div>
                      <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Order Date</div>
                      <div className="font-extrabold text-slate-900 mt-0.5 truncate">{formattedDate}</div>
                    </div>
                    <div>
                      <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Total Amount</div>
                      <div className="font-extrabold text-slate-900 mt-0.5">
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Ship To</div>
                      <div className="font-extrabold text-slate-900 truncate mt-0.5" title={order.shippingAddress?.fullName}>
                        {order.shippingAddress?.fullName || 'Valued Customer'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400 truncate">Order #{order._id.substring(0, 8)}...</div>
                      <Link href={`/orders/${order._id}`} className="text-blue-600 font-bold hover:underline inline-flex items-center justify-end gap-0.5 mt-0.5">
                        View Details &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                      <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>Status: <strong className="capitalize text-slate-900">{order.status || 'Processing'}</strong></span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-medium">Standard Delivery: 2–3 Business Days</span>
                  </div>

                  {/* Items list */}
                  <div className="p-4 sm:p-6 divide-y divide-slate-100">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-lg bg-slate-50 p-2 border border-slate-200 flex items-center justify-center flex-shrink-0">
                            <img src={item.image || '/placeholder.png'} alt={item.title} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                          </div>
                          <div>
                            <Link href={`/product/${item.asin}`} className="font-bold text-xs text-slate-900 hover:text-blue-600 line-clamp-2 transition-colors">
                              {item.title}
                            </Link>
                            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                              Qty: {item.quantity} × ${item.price?.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => handleReorder(item)}
                            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Buy Again
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
