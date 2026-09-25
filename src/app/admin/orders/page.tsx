'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
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
  placed: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  processing: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  shipped: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  out_for_delivery: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  delivered: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  cancelled: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
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
    <div className="min-h-screen bg-[#0b0f19] py-8 px-4 md:px-8 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-white">Order Management</h1>
            <p className="text-sm text-slate-400 mt-1">Review orders, update fulfillment statuses, and manage deliveries</p>
          </div>
          <span className="bg-slate-900 border border-slate-800 text-slate-400 text-xs px-3.5 py-1.5 rounded-full font-mono self-start sm:self-center">
            Total Pages: {totalPages}
          </span>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                statusFilter === s
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 border-b border-slate-800/80">
                <tr>
                  {['Order #', 'Customer', 'Total', 'Current Status', 'Date', 'Update Status'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-slate-800 rounded-lg animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-sm">
                      No orders matching filter &quot;{statusFilter}&quot;
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-cyan-400">
                        <Link href={`/orders/${order._id}`} className="hover:underline">
                          {order.orderNumber || order._id.toString().slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-200 text-xs">{order.userId?.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{order.userId?.email}</div>
                      </td>
                      <td className="px-5 py-4 font-bold text-white font-display">
                        ${(order.pricing?.total ?? order.total ?? 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusColors[order.status] || 'bg-slate-800 text-slate-400'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs font-mono whitespace-nowrap">
                        {new Date(order.placedAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={newStatus[order._id] || order.status}
                            onChange={(e) => setNewStatus((prev) => ({ ...prev, [order._id]: e.target.value }))}
                            className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                          >
                            {['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => (
                              <option key={s} value={s} className="bg-slate-900 text-slate-200">{s.replace(/_/g, ' ')}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => updateStatus(order._id)}
                            disabled={updatingId === order._id}
                            className="p-1.5 btn-gradient-primary text-slate-950 rounded-xl transition disabled:opacity-50 shadow-md"
                            title="Apply new status"
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
            <div className="px-6 py-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 text-slate-300 disabled:opacity-50 transition"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 text-slate-300 disabled:opacity-50 transition"
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

