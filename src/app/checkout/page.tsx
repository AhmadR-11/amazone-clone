'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldCheck, MapPin, CreditCard, ShoppingBag, CheckCircle, ArrowRight, Lock, Sparkles, Building, User, Phone, Check, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { COUNTRIES } from '@/lib/constants/countries';

interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart, syncFromServer } = useCartStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Saved Addresses State from Profile
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string>('custom');

  const [phonePrefix, setPhonePrefix] = useState<string>('+1');
  const [phoneNumber, setPhoneNumber] = useState<string>('555-234-5678');

  const [address, setAddress] = useState<Address>({
    fullName: user?.name || '',
    street: '123 Tech Boulevard, Suite 400',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    country: 'United States',
    phone: '+1 (555) 234-5678',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'amazon_pay' | 'cod'>('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '•••• •••• •••• 4242',
    expDate: '12/28',
    cvv: '***',
    nameOnCard: address.fullName || 'Valued Customer',
  });

  useEffect(() => {
    syncFromServer();

    // Fetch user profile saved addresses to auto pre-fill
    const fetchUserAddresses = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user?.addresses && data.user.addresses.length > 0) {
            setSavedAddresses(data.user.addresses);
            // Select default address or first address
            const defaultAddr = data.user.addresses.find((a: any) => a.isDefault) || data.user.addresses[0];
            if (defaultAddr) {
              setSelectedSavedId(defaultAddr._id || '0');
              setAddress({
                fullName: defaultAddr.fullName || data.user.name || '',
                street: defaultAddr.street || defaultAddr.line1 || '',
                city: defaultAddr.city || '',
                state: defaultAddr.state || '',
                zipCode: defaultAddr.postalCode || defaultAddr.zipCode || '',
                country: defaultAddr.country || 'United States',
                phone: defaultAddr.phone || '',
              });
            }
          }
        }
      } catch (e) {
        console.error('Error fetching user addresses for checkout:', e);
      }
    };
    fetchUserAddresses();
  }, [syncFromServer]);

  const subtotal = getTotalPrice();
  const shipping = subtotal > 50 ? 0 : 4.99;
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + shipping + estimatedTax;

  // Handle Saved Address Selection
  const handleSelectSavedAddress = (savedAddr: any) => {
    setSelectedSavedId(savedAddr._id || 'custom');
    setAddress({
      fullName: savedAddr.fullName || user?.name || '',
      street: savedAddr.street || savedAddr.line1 || '',
      city: savedAddr.city || '',
      state: savedAddr.state || '',
      zipCode: savedAddr.postalCode || savedAddr.zipCode || '',
      country: savedAddr.country || 'United States',
      phone: savedAddr.phone || '',
    });
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Shopping bag is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentPayload = {
        type: paymentMethod === 'amazon_pay' ? 'card' : paymentMethod,
        last4: paymentMethod === 'card' ? cardDetails.cardNumber.slice(-4) : undefined,
        brand: paymentMethod === 'card' ? 'Visa' : undefined,
      };

      const shippingPayload = {
        fullName: address.fullName,
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.zipCode,
        country: address.country,
        phone: address.phone,
      };

      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: shippingPayload,
          paymentMethod: paymentPayload,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to place order');
      }

      toast.success('Order placed successfully! 🎉');
      clearCart();
      router.push(`/orders/${data.orderId || data.order?._id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl text-center max-w-md border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 font-display">Your Bag is Empty</h2>
          <p className="text-slate-500 text-xs mb-6">Add items to your shopping bag before proceeding to checkout.</p>
          <Link
            href="/products"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-xs shadow-sm inline-block transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      {/* Checkout Navbar Header */}
      <div className="max-w-6xl mx-auto bg-white border border-slate-200/90 py-4 px-6 rounded-2xl flex items-center justify-between mb-8 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm font-display">
            L
          </div>
          <span className="text-lg font-extrabold text-slate-900 font-display tracking-tight">
            LUXESTORE
          </span>
        </Link>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
          Checkout (<span className="text-slate-600">{items.length} {items.length === 1 ? 'item' : 'items'}</span>)
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-blue-600" /> Express Checkout
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Checkout Steps */}
        <div className="lg:col-span-2 space-y-6">

          {/* STEP 1: Shipping Address */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${step === 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  1
                </span>
                <h2 className="text-base font-bold text-slate-900 font-display">Shipping &amp; Delivery Address</h2>
              </div>
              {step > 1 && (
                <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline font-bold">
                  Edit Address
                </button>
              )}
            </div>

            {step === 1 ? (
              <div className="space-y-5 pt-2">

                {/* Saved Address Selector (If user has addresses saved in profile) */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                      Choose Saved Address From Profile
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((saved) => (
                        <div
                          key={saved._id}
                          onClick={() => handleSelectSavedAddress(saved)}
                          className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            selectedSavedId === saved._id
                              ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                            <span>{saved.fullName}</span>
                            {selectedSavedId === saved._id && (
                              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-slate-600 text-[11px] leading-tight">{saved.street}, {saved.city}</div>
                          <div className="text-slate-500 text-[11px]">{saved.country} {saved.phone ? `(${saved.phone})` : ''}</div>
                        </div>
                      ))}

                      {/* Custom address option */}
                      <div
                        onClick={() => setSelectedSavedId('custom')}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-center gap-2 ${
                          selectedSavedId === 'custom'
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 font-bold text-blue-900'
                            : 'border-dashed border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                        }`}
                      >
                        <Plus size={14} /> Enter / Edit Custom Address
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Address Form Inputs */}
                <div className="space-y-4 pt-1 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                    {savedAddresses.length > 0 ? 'Edit Selected Shipping Address' : 'Enter Delivery Address'}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                      <select
                        value={address.country}
                        onChange={(e) => {
                          const matchedCountry = COUNTRIES.find((c) => c.name === e.target.value);
                          setAddress({ ...address, country: e.target.value });
                          if (matchedCountry) setPhonePrefix(matchedCountry.phoneCode);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium cursor-pointer"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State / Region</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={address.zipCode}
                        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <div className="flex gap-2">
                        <select
                          value={phonePrefix}
                          onChange={(e) => {
                            setPhonePrefix(e.target.value);
                            setAddress({ ...address, phone: `${e.target.value} ${phoneNumber}` });
                          }}
                          className="px-2.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white font-mono font-bold cursor-pointer"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.phoneCode}>
                              {c.flag} {c.phoneCode} ({c.code})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            setAddress({ ...address, phone: `${phonePrefix} ${e.target.value}` });
                          }}
                          className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (!address.fullName || !address.street || !address.city) {
                        toast.error('Please fill required address fields');
                        return;
                      }
                      setStep(2);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    Confirm Address &amp; Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-600 pl-10">
                <span className="font-bold text-slate-900">{address.fullName}</span> — {address.street}, {address.city}, {address.state} {address.zipCode} ({address.country}) {address.phone ? `Phone: ${address.phone}` : ''}
              </div>
            )}
          </div>

          {/* STEP 2: Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${step === 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  2
                </span>
                <h2 className="text-base font-bold text-slate-900 font-display">Payment Method</h2>
              </div>
              {step > 2 && (
                <button onClick={() => setStep(2)} className="text-xs text-blue-600 hover:underline font-bold">
                  Edit
                </button>
              )}
            </div>

            {step === 2 ? (
              <div className="space-y-4 pt-2">
                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-slate-900 bg-slate-50/80 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pm"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="text-slate-900 focus:ring-slate-900"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Credit / Debit Card</div>
                        <div className="text-[11px] text-slate-500">Visa, Mastercard, American Express</div>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-slate-700" />
                  </label>

                  <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'amazon_pay' ? 'border-slate-900 bg-slate-50/80 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pm"
                        checked={paymentMethod === 'amazon_pay'}
                        onChange={() => setPaymentMethod('amazon_pay')}
                        className="text-slate-900 focus:ring-slate-900"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Digital Wallet / Express Checkout</div>
                        <div className="text-[11px] text-slate-500">Instant approval via linked account</div>
                      </div>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-slate-700" />
                  </label>

                  <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-slate-900 bg-slate-50/80 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pm"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-slate-900 focus:ring-slate-900"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Cash on Delivery (COD)</div>
                        <div className="text-[11px] text-slate-500">Pay cash upon parcel arrival</div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setStep(3)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors"
                  >
                    Confirm Payment &amp; Review
                  </button>
                </div>
              </div>
            ) : step > 2 ? (
              <div className="text-xs text-slate-600 pl-10">
                <span className="font-bold text-slate-900">
                  {paymentMethod === 'card' ? 'Credit Card (•••• 4242)' : paymentMethod === 'amazon_pay' ? 'Digital Wallet' : 'Cash on Delivery'}
                </span>
              </div>
            ) : null}
          </div>

          {/* STEP 3: Review Items & Place Order */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${step === 3 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                3
              </span>
              <h2 className="text-base font-bold text-slate-900 font-display">Review Items &amp; Complete Order</h2>
            </div>

            {step === 3 && (
              <div className="space-y-4 pt-2">
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-2">
                  {items.map((item, idx) => {
                    const asin = item.asin || (item as any).productId?._id || `item-${idx}`;
                    const title = item.title || (item as any).productId?.title || 'Product';
                    const image = item.image || (item as any).imageUrl || (item as any).productId?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80';
                    const price = item.price || (item as any).productId?.price || 0;

                    return (
                      <div key={asin + idx} className="py-3 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-50 p-1.5 border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <img
                            src={image}
                            alt={title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80';
                            }}
                            className="max-h-full max-w-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="font-bold text-slate-900 line-clamp-1">{title}</div>
                          <div className="text-slate-500 text-[11px]">Qty: {item.quantity} × ${price.toFixed(2)}</div>
                        </div>
                        <div className="font-extrabold text-sm text-slate-900 font-display">
                          ${(price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <><span>Place Order Now</span> <CheckCircle className="w-4 h-4 text-amber-400" /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 sticky top-24 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base font-display">Order Total</h3>

            <div className="space-y-2.5 text-xs text-slate-600 border-t border-b border-slate-100 py-4 font-medium">
              <div className="flex justify-between">
                <span>Items ({items.reduce((s, i) => s + i.quantity, 0)}):</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="text-emerald-700 font-semibold">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%):</span>
                <span>${estimatedTax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>Final Total:</span>
              <span className="text-xl font-bold text-slate-900 font-display">
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || step < 3}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs shadow-sm disabled:opacity-40 transition-colors"
            >
              Place Order (${total.toFixed(2)})
            </button>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
              🛡️ <strong>Buyer Guarantee:</strong> Every purchase includes 30-day effortless returns &amp; full order protection.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
