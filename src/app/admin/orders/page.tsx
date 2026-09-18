'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  userId: { name: string; email: string };
  pricing?: { total: number };
  total?: number;
  status: string;
  placedAt: string;
}

const STATUSES = ['all', 'placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-orange-100 text-orange-700',
  out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<Record<string, string>>({});

  const loadOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter !== 'all') params.set('status', statusFilter);
    const res = await fetch(`/api/admin/orders?${params}`);
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.pages || 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) { router.push('/auth/login'); return; }
      const d = await authRes.json();
      if (d.user?.role !== 'admin') { router.push('/'); return; }
      loadOrders();
    };
    checkAdmin();
  }, [page, statusFilter]);

  const updateStatus = async (orderId: string) => {
    const status = newStatus[orderId];
    if (!status) return;
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success('Order status updated');
        loadOrders();
      } else {
        toast.error('Failed to update status');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-amazon_blue flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-amazon_blue">Order Management</h1>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition ${
                statusFilter === s
                  ? 'bg-amazon_blue text-white border-amazon_blue'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-amazon_blue hover:text-amazon_blue'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order #', 'Customer', 'Total', 'Current Status', 'Date', 'Update Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-amazon_blue">
                        <Link href={`/orders/${order._id}`} className="hover:underline">
                          {order.orderNumber || order._id.toString().slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800 text-xs">{order.userId?.name}</div>
                        <div className="text-xs text-gray-400">{order.userId?.email}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        ${(order.pricing?.total ?? order.total ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(order.placedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={newStatus[order._id] || order.status}
                            onChange={(e) => setNewStatus((prev) => ({ ...prev, [order._id]: e.target.value }))}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amazon_blue"
                          >
                            {['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => (
                              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => updateStatus(order._id)}
                            disabled={updatingId === order._id}
                            className="p-1.5 bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue rounded transition disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${updatingId === order._id ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:border-amazon_blue disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:border-amazon_blue disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
