'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { User, Mail, MapPin, Package, Shield, Key, Plus, Trash2, CheckCircle2 } from 'lucide-react';
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
      <div className="min-h-[70vh] bg-amazon_bg flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amazon_yellow border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amazon_blue font-medium text-sm">Loading user account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon_bg py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold text-amazon_blue">Your Account</h1>
          <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-3 py-1 rounded-full">
            Prime Member
          </span>
        </div>

        {/* Account Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Orders */}
          <Link href="/orders" className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:border-amazon_orange transition flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0 text-amazon_orange">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Your Orders</h2>
              <p className="text-xs text-gray-500 mt-1">Track, return, or buy items again</p>
            </div>
          </Link>

          {/* Card 2: Security */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 text-amazon_blue">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Login & Security</h2>
              <p className="text-xs text-gray-500 mt-1">Edit login, name, and mobile number</p>
            </div>
          </div>

          {/* Card 3: Addresses */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-600">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Your Addresses</h2>
              <p className="text-xs text-gray-500 mt-1">Edit addresses for orders and gifts</p>
            </div>
          </div>

        </div>

        {/* Profile Info Details Box */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-amazon_blue" /> Personal Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-4 rounded border border-gray-100">
              <span className="text-xs font-semibold text-gray-500 block uppercase">Name</span>
              <span className="font-bold text-gray-800 text-base">{user?.name || 'Amazon User'}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded border border-gray-100">
              <span className="text-xs font-semibold text-gray-500 block uppercase">Email Address</span>
              <span className="font-bold text-gray-800 text-base">{user?.email || 'user@example.com'}</span>
            </div>
          </div>
        </div>

        {/* Saved Addresses Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amazon_orange" /> Saved Addresses ({addresses.length})
            </h2>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold px-4 py-1.5 rounded text-xs transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </div>

          {/* Add Address Form Modal / Expandable */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="bg-amber-50/50 border border-amber-200 p-4 rounded-lg mb-6 space-y-3">
              <h3 className="font-bold text-xs uppercase text-amber-900">Add New Delivery Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={newAddr.fullName}
                  onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  className="p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-amazon_orange"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-amazon_orange"
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="sm:col-span-2 p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-amazon_orange"
                />
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-amazon_orange"
                />
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                  className="p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-amazon_orange"
                />
                <input
                  type="text"
                  placeholder="Zip Code"
                  required
                  value={newAddr.zipCode}
                  onChange={(e) => setNewAddr({ ...newAddr, zipCode: e.target.value })}
                  className="p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-amazon_orange"
                />
                <input
                  type="text"
                  placeholder="Country"
                  required
                  value={newAddr.country}
                  onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
                  className="p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-amazon_orange"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold px-4 py-2 rounded text-xs"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Address Cards List */}
          {addresses.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-xs">No saved addresses found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {addresses.map((addr, idx) => (
                <div key={idx} className="border border-gray-200 p-4 rounded-lg relative text-xs text-gray-600 bg-gray-50">
                  {addr.isDefault && (
                    <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded absolute top-2 right-2">
                      Default
                    </span>
                  )}
                  <div className="font-bold text-gray-900 text-sm mb-1">{addr.fullName}</div>
                  <div>{addr.street}</div>
                  <div>{addr.city}, {addr.state} {addr.zipCode}</div>
                  <div>{addr.country}</div>
                  <div className="mt-2 text-gray-500 font-mono">Phone: {addr.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
