'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { User, Mail, MapPin, Package, Shield, Key, Plus, Trash2, CheckCircle2, Sparkles, Phone, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [addresses, setAddresses] = useState<any[]>([]);

  // New address form state
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setAddresses(data.user.addresses || []);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setUser]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddr),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add address');

      toast.success('Address added successfully!');
      setAddresses(data.addresses || []);
      setShowAddressForm(false);
      setNewAddr({
        fullName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        phone: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Error adding address');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-xs">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 md:px-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Title Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold font-display text-xl shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold mb-0.5">Account Center</div>
              <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900">{user?.name || 'Valued Client'}</h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            </div>
          </div>
          <span className="self-start sm:self-center text-xs bg-slate-100 text-slate-800 border border-slate-200 font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> LUXESTORE VIP Account
          </span>
        </div>

        {/* Account Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Orders */}
          <Link href="/orders" className="bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-4 group">
            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-800 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display text-slate-900 group-hover:text-blue-600 transition-colors">Your Orders</h2>
              <p className="text-xs text-slate-500 mt-1">Track shipments, view invoices, or reorder items</p>
            </div>
          </Link>

          {/* Card 2: Security */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-800">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display text-slate-900">Login &amp; Security</h2>
              <p className="text-xs text-slate-500 mt-1">OTP verified secure account protection</p>
            </div>
          </div>

          {/* Card 3: Addresses */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-800">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display text-slate-900">Saved Addresses</h2>
              <p className="text-xs text-slate-500 mt-1">Manage delivery locations &amp; shipping profiles</p>
            </div>
          </div>

        </div>

        {/* Profile Info Details Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
          <h2 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> Account Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Full Name</span>
              <span className="font-bold text-slate-900 text-sm">{user?.name || 'N/A'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Email Address</span>
              <span className="font-bold text-slate-900 text-sm font-mono">{user?.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Saved Addresses Section */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" /> Saved Addresses ({addresses.length})
            </h2>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          {/* Add Address Form Modal / Expandable */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="bg-slate-50 border border-slate-200 p-5 rounded-xl mb-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Add New Shipping Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={newAddr.fullName}
                  onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  className="p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="sm:col-span-2 p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="text"
                  placeholder="State / Province"
                  required
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                  className="p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="text"
                  placeholder="Zip / Postal Code"
                  required
                  value={newAddr.zipCode}
                  onChange={(e) => setNewAddr({ ...newAddr, zipCode: e.target.value })}
                  className="p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="text"
                  placeholder="Country"
                  required
                  value={newAddr.country}
                  onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
                  className="p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-colors"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-5 py-2.5 rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Address Cards List */}
          {addresses.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No saved addresses. Click &quot;Add New Address&quot; above.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {addresses.map((addr, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200/90 p-5 rounded-xl relative text-xs text-slate-700 space-y-1 hover:border-slate-300 transition-colors">
                  {addr.isDefault && (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] px-2.5 py-0.5 rounded-full absolute top-3 right-3">
                      Default
                    </span>
                  )}
                  <div className="font-bold text-slate-900 text-sm mb-1">{addr.fullName}</div>
                  <div>{addr.street}</div>
                  <div>{addr.city}, {addr.state} {addr.zipCode}</div>
                  <div>{addr.country}</div>
                  <div className="mt-2 text-slate-500 font-mono flex items-center gap-1 text-[11px]">
                    <Phone className="w-3 h-3 text-slate-400" /> {addr.phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

