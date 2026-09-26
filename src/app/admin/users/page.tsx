'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, User, Search, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0b0f19] py-8 px-4 md:px-8 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-white">User Directory</h1>
            <p className="text-sm text-slate-400 mt-1">Manage registered store accounts & permissions</p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-slate-100"
          />
        </div>

        {/* Table Container */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800/80">
              <tr>
                {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-800 rounded-lg animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500 text-sm">
                    No users matching search &quot;{search}&quot;
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-bold font-display text-white text-xs">{user.name}</td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-xs">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3 text-purple-400" /> : <User className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {user._id === currentUserId ? (
                        <span className="text-xs text-slate-500 italic">Current Session</span>
                      ) : (
                        <button
                          onClick={() => toggleRole(user._id, user.role)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                            user.role === 'admin'
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                              : 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
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
            <div className="px-6 py-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 text-slate-300 disabled:opacity-50 transition">Prev</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 text-slate-300 disabled:opacity-50 transition">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

