'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('q', search);
    const res = await fetch(`/api/admin/users?${params}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.pages || 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) { router.push('/auth/login'); return; }
      const d = await authRes.json();
      if (d.user?.role !== 'admin') { router.push('/'); return; }
      setCurrentUserId(d.user.id);
      loadUsers();
    };
    init();
  }, [page, search]);

  const toggleRole = async (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      toast.success(`User ${newRole === 'admin' ? 'promoted to Admin' : 'demoted to User'}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } else {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-amazon_blue flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-amazon_blue">User Management</h1>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amazon_yellow"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {user._id === currentUserId ? (
                        <span className="text-xs text-gray-400 italic">You</span>
                      ) : (
                        <button
                          onClick={() => toggleRole(user._id, user.role)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition ${
                            user.role === 'admin'
                              ? 'border-red-300 text-red-600 hover:bg-red-50'
                              : 'border-purple-300 text-purple-600 hover:bg-purple-50'
                          }`}
                        >
                          {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-xs border rounded hover:border-amazon_blue disabled:opacity-50">Prev</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-xs border rounded hover:border-amazon_blue disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
