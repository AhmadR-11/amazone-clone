'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  User, Mail, MapPin, Plus, Trash2, CheckCircle2,
  Sparkles, Phone, Camera, Save, Check, Loader2, ArrowDown,
  Pencil, X, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { COUNTRIES } from '@/lib/constants/countries';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [addresses, setAddresses] = useState<any[]>([]);

  // Profile Edit State (Editing disabled by default until user clicks Edit Profile)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New address form state
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [isSavingAddress, setIsSavingAddress] = useState<boolean>(false);
  const [phonePrefix, setPhonePrefix] = useState<string>('+1');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    isDefault: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser({
              userId: data.user._id || data.user.id || user?.userId || '',
              id: data.user._id || data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              avatar: data.user.avatar,
              isGuest: false,
            });
            setName(data.user.name || '');
            setAvatar(data.user.avatar || '');
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

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        toast.success('Photo selected! Click "Save Changes" to apply.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle profile update (Name & Avatar)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          avatar: avatar || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      if (data.user && user) {
        setUser({
          ...user,
          name: data.user.name,
          avatar: data.user.avatar,
        });
      }
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Revert unsaved profile edits and exit edit mode
  const handleCancelEdit = () => {
    setName(user?.name || '');
    setAvatar(user?.avatar || '');
    setIsEditing(false);
  };

  // Handle address addition
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    const combinedPhone = `${phonePrefix} ${phoneNumber.trim()}`.trim();

    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAddr,
          phone: combinedPhone,
          postalCode: newAddr.zipCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add address');

      toast.success('Address saved successfully!');
      setAddresses(data.addresses || []);
      setShowAddressForm(false);
      setPhoneNumber('');
      setNewAddr({
        fullName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        isDefault: false,
      });
    } catch (err: any) {
      toast.error(err.message || 'Error saving address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Handle address deletion
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    try {
      const res = await fetch(`/api/user/profile?addressId=${addressId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete address');

      toast.success('Address removed');
      setAddresses(data.addresses || []);
    } catch (err: any) {
      toast.error(err.message || 'Error deleting address');
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
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-8 px-3 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Title & Quick Actions Header */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-xl shadow-md overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Account Center</div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 font-sans tracking-tight">
                {name || user?.name || 'Valued Client'}
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center flex-wrap">
            {/* Moved Saved Addresses Quick Button */}
            <a
              href="#addresses"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200/90"
            >
              <MapPin size={13} className="text-blue-600" />
              <span>Saved Addresses ({addresses.length})</span>
            </a>

            <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> LUXESTORE Member
            </span>
          </div>
        </div>

        {/* Profile Card (Viewing Mode by Default, Editing Enabled upon clicking Edit Profile) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-sm">
          {!isEditing ? (
            <div>
              {/* Card Header: View Mode */}
              <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" /> Personal Profile &amp; Identity
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Your verified account information and profile details</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Pencil size={13} />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* View Mode Details */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-md overflow-hidden border-2 border-white ring-2 ring-slate-200 self-center sm:self-auto flex-shrink-0">
                    {avatar ? (
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
                    <div className="text-base sm:text-lg font-extrabold text-slate-900 font-sans truncate">
                      {name || user?.name || 'Valued Client'}
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate">{user?.email}</p>
                    <div className="pt-1.5 flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 size={11} /> Verified Account
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-200/70 border border-slate-300/70 px-2.5 py-0.5 rounded-full">
                        <ShieldCheck size={11} className="text-blue-600" /> {user?.role === 'admin' ? 'Administrator' : 'LUXESTORE VIP'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/80 space-y-1">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">Full Name</span>
                    <p className="text-sm font-extrabold text-slate-900">{name || user?.name || 'Not provided'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/80 space-y-1">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">Email Address</span>
                    <p className="text-sm font-mono text-slate-800 truncate">{user?.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Card Header: Edit Mode */}
              <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" /> Edit Personal Profile
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Modify your profile picture and account display name</p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <X size={13} />
                  <span>Cancel</span>
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Profile Avatar Upload Section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="relative group self-center sm:self-auto flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-md overflow-hidden border-2 border-white ring-2 ring-slate-200">
                      {avatar ? (
                        <img src={avatar} alt="Profile Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span>{name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110 cursor-pointer"
                      title="Upload profile picture"
                      aria-label="Upload profile picture"
                    >
                      <Camera size={14} />
                    </button>
                  </div>

                  <div className="flex-1 space-y-1.5 text-center sm:text-left">
                    <div className="text-xs font-bold text-slate-900">Change Profile Photo</div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Upload a clean JPG, PNG or WebP profile image (max 2MB).
                    </p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start pt-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer"
                      >
                        Choose Photo
                      </button>
                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar('')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full p-3 text-xs sm:text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Email Address <span className="text-slate-400 font-normal">(Registered)</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full p-3 text-xs sm:text-sm text-slate-500 bg-slate-100 border border-slate-200 rounded-xl font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Action Buttons: Cancel + Save Changes */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-blue-600 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Saved Addresses Section (Moved to this dedicated area, fully fixed with delete & add) */}
        <div id="addresses" className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-sm scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" /> Saved Delivery Addresses ({addresses.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage your shipping profiles for instant checkout</p>
            </div>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          {/* Add Address Form Expandable */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-xl mb-6 space-y-4 shadow-sm animate-in fade-in duration-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Add New Shipping Address</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Full Recipient Name"
                  required
                  value={newAddr.fullName}
                  onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  className="p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Country Selector */}
                <select
                  value={newAddr.country}
                  onChange={(e) => {
                    const selectedCountry = COUNTRIES.find((c) => c.name === e.target.value);
                    setNewAddr({ ...newAddr, country: e.target.value });
                    if (selectedCountry) setPhonePrefix(selectedCountry.phoneCode);
                  }}
                  className="p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>

                {/* Street Address */}
                <input
                  type="text"
                  placeholder="Street Address (e.g. 123 Main St, Suite 4B)"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="sm:col-span-2 p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* City */}
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* State */}
                <input
                  type="text"
                  placeholder="State / Province / Region"
                  required
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                  className="p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Zip Code */}
                <input
                  type="text"
                  placeholder="Zip / Postal Code"
                  required
                  value={newAddr.zipCode}
                  onChange={(e) => setNewAddr({ ...newAddr, zipCode: e.target.value })}
                  className="p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Phone Code Prefix + Phone Input */}
                <div className="flex gap-2">
                  <select
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    className="p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.phoneCode}>
                        {c.flag} {c.phoneCode} ({c.code})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="Phone Number (e.g. 555-0199)"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 p-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingAddress ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>Save Address</span>
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

          {/* Address Cards Grid */}
          {addresses.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No saved addresses yet.</p>
              <button
                onClick={() => setShowAddressForm(true)}
                className="mt-2 text-blue-600 font-bold hover:underline"
              >
                + Add your primary shipping address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {addresses.map((addr, idx) => (
                <div
                  key={addr._id || idx}
                  className="bg-slate-50 border border-slate-200/90 p-4 sm:p-5 rounded-xl relative text-xs text-slate-700 space-y-1 hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-extrabold text-slate-900 text-sm truncate">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] px-2 py-0.5 rounded-full flex-shrink-0">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-slate-600 leading-snug">{addr.street}</div>
                    <div className="text-slate-600">{addr.city}, {addr.state} {addr.postalCode || addr.zipCode}</div>
                    <div className="text-slate-500 font-medium">{addr.country}</div>
                    {addr.phone && (
                      <div className="mt-2 text-slate-500 font-mono flex items-center gap-1.5 text-[11px] pt-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {addr.phone}
                      </div>
                    )}
                  </div>

                  {addr._id && (
                    <div className="pt-3 border-t border-slate-200/60 mt-3 flex justify-end">
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-[11px] font-bold text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1"
                        title="Delete address"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
