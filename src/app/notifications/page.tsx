'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, Package, Truck, CheckCircle2, XCircle, Tag, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcon: Record<string, React.ReactNode> = {
  order_placed: <Package className="w-5 h-5 text-cyan-400" />,
  order_shipped: <Truck className="w-5 h-5 text-amber-400" />,
  order_delivered: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  order_cancelled: <XCircle className="w-5 h-5 text-rose-400" />,
  wishlist_deal: <Tag className="w-5 h-5 text-yellow-400" />,
  review_reply: <MessageSquare className="w-5 h-5 text-purple-400" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        router.push('/auth/login?returnUrl=/notifications');
        return;
      }
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PUT' });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PUT' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotif = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f8fafc] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 md:px-8 text-slate-900">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              Inbox &amp; Order Alerts
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900 flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 px-4 py-2 rounded-xl transition-colors font-bold"
            >
              <Check className="w-4 h-4 text-slate-900" /> Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center shadow-sm max-w-lg mx-auto my-8">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Bell className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold font-display text-slate-900 mb-1">You&apos;re all caught up!</h2>
            <p className="text-xs text-slate-500 leading-relaxed">No new notifications. We&apos;ll keep you updated on order dispatches and account alerts.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`flex items-start gap-4 p-5 hover:bg-slate-50/80 transition-colors ${
                  !notif.isRead ? 'bg-slate-50/50 border-l-4 border-l-slate-900' : ''
                }`}
              >
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 mt-0.5">
                  {typeIcon[notif.type] || <Bell className="w-5 h-5 text-slate-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-display text-slate-900 text-sm">{notif.title}</span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[11px] text-slate-400 font-mono">{timeAgo(notif.createdAt)}</span>
                    {notif.link && (
                      <Link
                        href={notif.link}
                        onClick={() => markRead(notif._id)}
                        className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        View details <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                    {!notif.isRead && (
                      <button
                        onClick={() => markRead(notif._id)}
                        className="text-[11px] text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteNotif(notif._id)}
                  className="flex-shrink-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

