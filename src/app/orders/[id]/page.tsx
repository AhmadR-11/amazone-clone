'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Truck, ShieldCheck, MapPin, CreditCard, ArrowLeft, RefreshCw } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
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
      <div className="min-h-[70vh] bg-amazon_bg flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amazon_yellow border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amazon_blue font-medium text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-amazon_bg flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">We couldn't locate details for this order ID.</p>
          <Link
            href="/orders"
            className="bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold px-6 py-2.5 rounded-md inline-block text-sm"
          >
            Back to Orders
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
    <div className="min-h-screen bg-amazon_bg py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back navigation */}
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs text-amazon_blue hover:underline font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        {/* Order Header Box */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <h1 className="text-xl font-extrabold text-amazon_blue">Order Details</h1>
              <div className="text-xs text-gray-500 mt-1">
                Ordered on {formattedDate} | Order #<span className="font-mono">{order._id}</span>
              </div>
            </div>
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="capitalize">{order.status || 'Confirmed'}</span>
            </div>
          </div>

          {/* Shipment Tracking Bar */}
          <div className="my-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Shipment Progress</h2>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0"></div>
              <div className="absolute top-1/2 left-0 w-1/2 h-1 bg-emerald-500 -z-0"></div>

              <div className="relative z-10 flex flex-col items-center bg-white px-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">✓</div>
                <span className="text-xs font-semibold text-gray-800 mt-1">Ordered</span>
              </div>
              <div className="relative z-10 flex flex-col items-center bg-white px-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-gray-800 mt-1">Shipped</span>
              </div>
              <div className="relative z-10 flex flex-col items-center bg-white px-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-xs">3</div>
                <span className="text-xs font-semibold text-gray-500 mt-1">Out for Delivery</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 pt-2">
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-amazon_orange" /> Shipping Address
              </h3>
              <div className="bg-gray-50 p-3 rounded border border-gray-100 space-y-1">
                <div className="font-bold text-gray-800">{order.shippingAddress?.fullName}</div>
                <div>{order.shippingAddress?.street}</div>
                <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</div>
                <div>{order.shippingAddress?.country}</div>
                <div>Phone: {order.shippingAddress?.phone}</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-1">
                <CreditCard className="w-4 h-4 text-amazon_blue" /> Payment Summary
              </h3>
              <div className="bg-gray-50 p-3 rounded border border-gray-100 space-y-1.5">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-semibold text-gray-800 capitalize">{order.paymentMethod?.replace('_', ' ') || 'Credit Card'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items Total:</span>
                  <span>${order.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-emerald-700 font-medium">FREE</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 font-bold text-sm text-gray-900">
                  <span>Grand Total:</span>
                  <span>${order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items List Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Items in this Order</h2>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={item.image || '/placeholder.png'} alt={item.title} className="w-16 h-16 object-contain" />
                  <div className="text-xs">
                    <Link href={`/product/${item.asin}`} className="font-semibold text-amazon_blue hover:text-amazon_orange line-clamp-2">
                      {item.title}
                    </Link>
                    <div className="text-gray-500 mt-1">Quantity: {item.quantity} × ${item.price?.toFixed(2)}</div>
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
                    toast.success('Added to cart');
                  }}
                  className="bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold px-3 py-1.5 rounded text-xs transition flex items-center gap-1"
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
