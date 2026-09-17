'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldCheck, MapPin, CreditCard, ShoppingBag, CheckCircle, ArrowRight, Lock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

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

  // Address State
  const [address, setAddress] = useState<Address>({
    fullName: user?.name || '',
    street: '123 Tech Boulevard, Suite 400',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    country: 'United States',
    phone: '+1 (555) 234-5678',
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'amazon_pay' | 'cod'>('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '•••• •••• •••• 4242',
    expDate: '12/28',
    cvv: '***',
    nameOnCard: address.fullName || 'Valued Customer',
  });

  useEffect(() => {
    syncFromServer();
  }, [syncFromServer]);

  const subtotal = getTotalPrice();
  const shipping = subtotal > 50 ? 0 : 4.99;
  const estimatedTax = subtotal * 0.08; // 8% estimated tax
  const total = subtotal + shipping + estimatedTax;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: address,
          paymentMethod,
          items,
          totalAmount: total,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      toast.success('Order placed successfully!');
      clearCart();
      router.push(`/orders/${data.orderId || data.order?._id || 'recent'}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-amazon_bg flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-amazon_yellow mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amazon_blue mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 text-sm mb-6">Add items to your cart before proceeding to checkout.</p>
          <Link
            href="/products"
            className="bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold px-6 py-2.5 rounded-md inline-block text-sm"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon_bg py-6 px-4 md:px-8">
      {/* Checkout Navbar Header */}
      <div className="max-w-6xl mx-auto bg-white border-b border-gray-200 py-3 px-6 rounded-t-lg flex items-center justify-between mb-6 shadow-sm">
        <Link href="/" className="flex items-center gap-1 text-2xl font-extrabold text-amazon_blue tracking-tight">
          amazon<span className="text-amazon_orange">.clone</span>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Checkout (<span className="text-amazon_blue font-semibold">{items.length} items</span>)
        </h1>
        <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
          <Lock className="w-4 h-4 text-emerald-600" /> SSL Encrypted
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Steps Form */}
        <div className="lg:col-span-2 space-y-4">

          {/* STEP 1: Shipping Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${step === 1 ? 'bg-amazon_orange text-white' : 'bg-gray-200 text-gray-700'}`}>
                  1
                </span>
                <h2 className="text-lg font-bold text-gray-900">Select Shipping Address</h2>
              </div>
              {step > 1 && (
                <button onClick={() => setStep(1)} className="text-xs text-amazon_blue font-medium hover:underline">
                  Change
                </button>
              )}
            </div>

            {step === 1 ? (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amazon_orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amazon_orange"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amazon_orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amazon_orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">State / Province</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amazon_orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amazon_orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amazon_orange"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => {
                      if (!address.fullName || !address.street || !address.city) {
                        toast.error('Please fill required address fields');
                        return;
                      }
                      setStep(2);
                    }}
                    className="bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold px-6 py-2.5 rounded-md text-sm shadow transition"
                  >
                    Use this address
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-600 pl-10">
                <span className="font-semibold text-gray-800">{address.fullName}</span>, {address.street}, {address.city}, {address.state} {address.zipCode} ({address.phone})
              </div>
            )}
          </div>

          {/* STEP 2: Payment Method */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${step === 2 ? 'bg-amazon_orange text-white' : 'bg-gray-200 text-gray-700'}`}>
                  2
                </span>
                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
              </div>
              {step > 2 && (
                <button onClick={() => setStep(2)} className="text-xs text-amazon_blue font-medium hover:underline">
                  Change
                </button>
              )}
            </div>

            {step === 2 ? (
              <div className="space-y-4 pt-2">
                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition ${paymentMethod === 'card' ? 'border-amazon_orange bg-amber-50/40' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pm"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="text-amazon_orange focus:ring-amazon_orange"
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Credit or Debit Card</div>
                        <div className="text-xs text-gray-500">Visa, Mastercard, Discover, Amex</div>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-gray-400" />
                  </label>

                  <label className={`flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition ${paymentMethod === 'amazon_pay' ? 'border-amazon_orange bg-amber-50/40' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pm"
                        checked={paymentMethod === 'amazon_pay'}
                        onChange={() => setPaymentMethod('amazon_pay')}
                        className="text-amazon_orange focus:ring-amazon_orange"
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Amazon Pay / Store Card</div>
                        <div className="text-xs text-gray-500">Pay directly from Amazon balance</div>
                      </div>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-amazon_yellow" />
                  </label>

                  <label className={`flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition ${paymentMethod === 'cod' ? 'border-amazon_orange bg-amber-50/40' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pm"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-amazon_orange focus:ring-amazon_orange"
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Cash on Delivery (COD)</div>
                        <div className="text-xs text-gray-500">Pay cash upon delivery</div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => setStep(3)}
                    className="bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold px-6 py-2.5 rounded-md text-sm shadow transition"
                  >
                    Use this payment method
                  </button>
                </div>
              </div>
            ) : step > 2 ? (
              <div className="text-xs text-gray-600 pl-10">
                <span className="font-semibold text-gray-800">
                  {paymentMethod === 'card' ? 'Credit Card (•••• 4242)' : paymentMethod === 'amazon_pay' ? 'Amazon Pay Balance' : 'Cash on Delivery'}
                </span>
              </div>
            ) : null}
          </div>

          {/* STEP 3: Review Items & Delivery */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${step === 3 ? 'bg-amazon_orange text-white' : 'bg-gray-200 text-gray-700'}`}>
                3
              </span>
              <h2 className="text-lg font-bold text-gray-900">Review Items & Shipping</h2>
            </div>

            {step === 3 && (
              <div className="space-y-4 pt-2">
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-2">
                  {items.map((item, idx) => {
                    const asin = item.asin || (item as any).productId?._id || `item-${idx}`;
                    const title = item.title || (item as any).productId?.title || 'Product';
                    const image = item.image || (item as any).productId?.image || '/placeholder.png';
                    const price = item.price || (item as any).productId?.price || 0;

                    return (
                      <div key={asin + idx} className="py-3 flex items-center gap-4">
                        <img src={image} alt={title} className="w-14 h-14 object-contain" />
                        <div className="flex-1 text-xs">
                          <div className="font-medium text-gray-900 line-clamp-1">{title}</div>
                          <div className="text-gray-500">Qty: {item.quantity} × ${price.toFixed(2)}</div>
                        </div>
                        <div className="font-bold text-sm text-gray-900">
                          ${(price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="w-full bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-extrabold py-3.5 rounded-md text-base shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-amazon_blue border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>Place your order <CheckCircle className="w-5 h-5" /></>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    By placing your order, you agree to Amazon's privacy notice and conditions of use.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm sticky top-6">
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || step < 3}
              className="w-full bg-amazon_yellow hover:bg-amazon_yellow_hover text-amazon_blue font-bold py-3 rounded-md text-sm shadow transition mb-4 disabled:opacity-50"
            >
              Place Your Order
            </button>

            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">Order Summary</h3>

            <div className="space-y-2 text-xs text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Items ({items.reduce((s, i) => s + i.quantity, 0)}):</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping & handling:</span>
                <span className="text-emerald-700 font-medium">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%):</span>
                <span>${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-extrabold text-base text-red-700">
                <span>Order Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900">
              <span className="font-bold">✨ Guarantee:</span> Amazon Guarantee covers your purchase from click to delivery.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
