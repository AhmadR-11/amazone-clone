'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, Package, Truck, CheckCircle2, XCircle, Tag, MessageSquare } from 'lucide-react';
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
  order_placed: <Package className="w-5 h-5 text-blue-500" />,
  order_shipped: <Truck className="w-5 h-5 text-orange-500" />,
  order_delivered: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  order_cancelled: <XCircle className="w-5 h-5 text-red-500" />,
  wishlist_deal: <Tag className="w-5 h-5 text-yellow-500" />,
  review_reply: <MessageSquare className="w-5 h-5 text-purple-500" />,
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
      <div className="min-h-[70vh] bg-amazon_bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amazon_yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon_bg py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-amazon_blue flex items-center gap-2">
              <Bell className="w-7 h-7" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-amazon_blue hover:text-amazon_orange flex items-center gap-1 font-medium"
            >
              <Check className="w-4 h-4" /> Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-amazon_blue mb-2">You&apos;re all caught up!</h2>
            <p className="text-sm text-gray-500">No notifications yet. We&apos;ll notify you when something happens.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`flex items-start gap-4 px-4 py-4 hover:bg-gray-50 transition ${
                  !notif.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {typeIcon[notif.type] || <Bell className="w-5 h-5 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-amazon_blue text-sm">{notif.title}</span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400">{timeAgo(notif.createdAt)}</span>
                    {notif.link && (
                      <Link
                        href={notif.link}
                        onClick={() => markRead(notif._id)}
                        className="text-xs text-amazon_blue hover:underline font-medium"
                      >
                        View details →
                      </Link>
                    )}
                    {!notif.isRead && (
                      <button
                        onClick={() => markRead(notif._id)}
                        className="text-xs text-gray-500 hover:text-amazon_blue"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteNotif(notif._id)}
                  className="flex-shrink-0 text-gray-300 hover:text-red-500 transition p-1 rounded"
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
