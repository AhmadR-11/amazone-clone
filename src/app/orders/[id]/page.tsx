'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Truck, ShieldCheck, MapPin, CreditCard, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = (params?.id as string) || '';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Error loading order detail:', err);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrderDetail();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-xs">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl text-center max-w-md border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-2 font-display">Order Not Found</h2>
          <p className="text-slate-500 text-xs mb-6">We couldn&apos;t locate details for order ID: {orderId}</p>
          <Link
            href="/orders"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-xs shadow-sm inline-block transition-colors"
          >
            Back to Order History
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back navigation */}
        <Link href="/orders" className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Order History
        </Link>

        {/* Order Header Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">Order Specification</h1>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                Placed on {formattedDate} | Order ID: <span className="font-mono text-slate-900 font-bold">{order._id}</span>
              </div>
            </div>
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="capitalize">{order.status || 'Confirmed'}</span>
            </div>
          </div>

          {/* Shipment Tracking Progress Bar */}
          <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Truck size={16} className="text-blue-600" /> Shipment Progress Tracker
            </h2>
            <div className="flex items-center justify-between relative py-2">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-0"></div>
              <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-slate-900 -z-0"></div>

              <div className="relative z-10 flex flex-col items-center bg-slate-50 px-3">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">✓</div>
                <span className="text-[11px] font-bold text-slate-900 mt-1.5">Confirmed</span>
              </div>
              <div className="relative z-10 flex flex-col items-center bg-slate-50 px-3">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 mt-1.5">In Transit</span>
              </div>
              <div className="relative z-10 flex flex-col items-center bg-slate-50 px-3">
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs">3</div>
                <span className="text-[11px] font-medium text-slate-400 mt-1.5">Delivered</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 pt-2">
            <div>
              <h3 className="font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" /> Delivery Address
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-900">{order.shippingAddress?.fullName}</div>
                <div>{order.shippingAddress?.street}</div>
                <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</div>
                <div>{order.shippingAddress?.country}</div>
                <div className="text-slate-500 pt-1">Phone: {order.shippingAddress?.phone}</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" /> Payment &amp; Total
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {(() => {
                      const pm = order.paymentMethod;
                      if (!pm) return 'Credit Card';
                      if (typeof pm === 'string') return pm.replace(/_/g, ' ');
                      if (typeof pm === 'object') {
                        if (pm.brand && pm.last4) return `${pm.brand} •••• ${pm.last4}`;
                        if (pm.type === 'cod') return 'Cash on Delivery';
                        if (pm.type === 'amazon_pay') return 'Digital Wallet';
                        if (pm.type) return String(pm.type).replace(/_/g, ' ');
                      }
                      return 'Credit Card';
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${order.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-emerald-700 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-extrabold text-sm text-slate-900 font-display">
                  <span>Total Paid:</span>
                  <span className="text-slate-900">
                    ${order.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items List Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 font-display">Items in this Order</h2>
          <div className="divide-y divide-slate-100">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-slate-50 p-2 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <img src={item.image || '/placeholder.png'} alt={item.title} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="text-xs">
                    <Link href={`/product/${item.asin}`} className="font-bold text-slate-900 hover:text-blue-600 line-clamp-2 transition-colors">
                      {item.title}
                    </Link>
                    <div className="text-slate-500 mt-1 font-medium">Quantity: {item.quantity} × ${item.price?.toFixed(2)}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    addItem({
                      asin: item.asin,
                      title: item.title,
                      image: item.image,
                      price: item.price,
                      quantity: 1,
                    });
                    toast.success('Added to bag');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reorder
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
