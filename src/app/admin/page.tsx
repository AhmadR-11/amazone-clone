'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, ShoppingBag, DollarSign, Clock, TrendingUp,
  Package, Settings, ChevronRight, AlertCircle
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
  placed: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-orange-100 text-orange-700',
  out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  Processing: 'bg-yellow-100 text-yellow-700',
  Shipped: 'bg-orange-100 text-orange-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
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
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amazon_yellow border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Revenue', value: `$${(stats?.totalRevenue ?? 0).toFixed(0)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Orders', value: stats?.pendingOrders ?? 0, icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-amazon_blue">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your Amazon Clone store</p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-1.5 rounded-full font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Admin Mode
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 font-medium">{card.label}</span>
                <div className={`${card.bg} p-2 rounded-lg`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{card.value}</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>{stats?.ordersToday ?? 0} today</span>
              </div>
            </div>
          ))}
        </div>

        {/* Nav Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { href: '/admin/orders', label: 'Manage Orders', icon: Package, desc: 'Update order status, view details' },
            { href: '/admin/users', label: 'Manage Users', icon: Users, desc: 'Promote/demote user roles' },
            { href: '/admin/settings', label: 'Settings', icon: Settings, desc: 'Featured products, config' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-amazon_yellow transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amazon_yellow bg-opacity-20 p-2.5 rounded-lg">
                  <link.icon className="w-5 h-5 text-amazon_blue" />
                </div>
                <div>
                  <div className="font-bold text-amazon_blue text-sm">{link.label}</div>
                  <div className="text-xs text-gray-500">{link.desc}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amazon_blue transition" />
            </Link>
          ))}
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-amazon_blue">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-amazon_blue hover:text-amazon_orange font-medium">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order #', 'Customer', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono font-semibold text-amazon_blue text-xs">
                        {order.orderNumber || order._id.toString().slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{order.userId?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">{order.userId?.email || ''}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        ${(order.pricing?.total ?? order.total ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(order.placedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/orders/${order._id}`}
                          className="text-xs text-amazon_blue hover:text-amazon_orange font-medium"
                        >
                          View
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
