'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, ShoppingBag, DollarSign, Clock, TrendingUp,
  Package, Settings, ChevronRight, AlertCircle, Sparkles, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  ordersToday: number;
  pendingOrders: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId: { name: string; email: string };
  pricing?: { total: number };
  total?: number;
  status: string;
  placedAt: string;
}

const statusColors: Record<string, string> = {
  placed: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  processing: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  shipped: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  out_for_delivery: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  delivered: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  cancelled: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  Processing: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  Shipped: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  Delivered: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  Cancelled: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/auth/login?returnUrl=/admin');
          return;
        }
        const authData = await authRes.json();
        if (authData.user?.role !== 'admin') {
          router.push('/');
          toast.error('Admin access required');
          return;
        }
        setIsAdmin(true);

        const statsRes = await fetch('/api/admin/stats');
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
          setRecentOrders(data.recentOrders || []);
        }
      } catch {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const statCards = [
    { label: 'Total Clients', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Total Revenue', value: `$${(stats?.totalRevenue ?? 0).toFixed(0)}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Pending Action', value: stats?.pendingOrders ?? 0, icon: Clock, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] py-8 px-4 md:px-8 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> LUXECORE Command Center
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-white">Admin Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Platform metrics, user management, & order fulfillment</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-3.5 py-1.5 rounded-full font-semibold self-start sm:self-center">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Admin Privileges Active
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="glass-panel rounded-2xl border border-slate-800/80 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium">{card.label}</span>
                <div className={`${card.bg} p-2 rounded-xl border`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold font-display text-white">{card.value}</div>
              <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{stats?.ordersToday ?? 0} placed today</span>
              </div>
            </div>
          ))}
        </div>

        {/* Management Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/admin/orders', label: 'Order Management', icon: Package, desc: 'Fulfill, track, and update status' },
            { href: '/admin/users', label: 'User Directory', icon: Users, desc: 'Manage client accounts and admin roles' },
            { href: '/products', label: 'Store Catalog', icon: Settings, desc: 'Browse live inventory and product views' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="glass-panel border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-cyan-400 group-hover:scale-105 transition-transform">
                  <link.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold font-display text-white text-sm group-hover:text-cyan-400 transition-colors">{link.label}</div>
                  <div className="text-xs text-slate-400">{link.desc}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
            </Link>
          ))}
        </div>

        {/* Recent Orders Table */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <h2 className="font-bold font-display text-white text-base">Recent Store Orders</h2>
            <Link href="/admin/orders" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
              View all orders →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 border-b border-slate-800/80">
                <tr>
                  {['Order #', 'Customer', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500 text-sm">
                      No orders recorded yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-mono font-semibold text-cyan-400 text-xs">
                        {order.orderNumber || order._id.toString().slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-200 text-xs">{order.userId?.name || 'Unknown'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{order.userId?.email || ''}</div>
                      </td>
                      <td className="px-5 py-4 font-bold text-white font-display">
                        ${(order.pricing?.total ?? order.total ?? 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusColors[order.status] || 'bg-slate-800 text-slate-400'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs font-mono">
                        {new Date(order.placedAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/orders/${order._id}`}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

