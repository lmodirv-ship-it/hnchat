'use client';
import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';

interface CheckoutItem {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  price: number;
  quantity: number;
  seller: string;
}

const MOCK_ITEMS: CheckoutItem[] = [
  {
    id: 'ci1',
    name: 'Digital Art Pack — Neon Futures Vol.2',
    image: 'https://picsum.photos/seed/art002/80/80',
    imageAlt: 'Digital art pack with neon futuristic designs and abstract patterns',
    price: 24.99,
    quantity: 1,
    seller: 'NeonStudio',
  },
  {
    id: 'ci2',
    name: 'Premium Creator Preset Bundle',
    image: 'https://picsum.photos/seed/preset01/80/80',
    imageAlt: 'Photography preset bundle with cinematic color grading filters',
    price: 14.99,
    quantity: 2,
    seller: 'CreatorHub',
  },
];

const PAYMENT_METHODS = [
  { id: 'stripe', label: 'Credit / Debit Card', icon: 'CreditCardIcon', badge: 'Stripe', badgeColor: '#635bff', desc: 'Visa, Mastercard, Amex' },
  { id: 'paddle', label: 'Paddle Checkout', icon: 'ShieldCheckIcon', badge: 'Paddle', badgeColor: '#00b4d8', desc: 'Global payments + tax handled' },
  { id: 'paypal', label: 'PayPal', icon: 'BanknotesIcon', badge: 'PayPal', badgeColor: '#003087', desc: 'Pay with your PayPal balance' },
];

type Step = 'cart' | 'shipping' | 'payment' | 'confirm';

export default function CheckoutScreen() {
  const [step, setStep] = useState<Step>('cart');
  const [items, setItems] = useState<CheckoutItem[]>(MOCK_ITEMS);
  const [selectedPayment, setSelectedPayment] = useState('stripe');
  const [processing, setProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', country: 'MA', zip: '' });

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const shipping = 4.99;
  const total = subtotal - discount + shipping;

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) { setItems((prev) => prev.filter((i) => i.id !== id)); return; }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  };

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'HNCHAT10') {
      setPromoApplied(true);
      toast.success('Promo code applied! 10% off 🎉');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    // Payment provider integration point:
    // - Stripe: POST /api/checkout/stripe → create PaymentIntent → redirect to Stripe Checkout
    // - Paddle: window.Paddle.Checkout.open({ product: ..., email: form.email })
    // - PayPal: POST /api/checkout/paypal → create order → redirect to PayPal approval URL
    toast.success('Order placed! Redirecting to payment... 🚀');
    setProcessing(false);
    setStep('confirm');
  };

  const STEPS: { id: Step; label: string }[] = [
    { id: 'cart', label: 'Cart' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment', label: 'Payment' },
    { id: 'confirm', label: 'Confirm' },
  ];
  const stepIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <>
      <Toaster position="bottom-right" theme="dark" />
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/marketplace">
            <button className="p-2 rounded-xl hover:bg-white/08 transition-all duration-150">
              <Icon name="ArrowLeftIcon" size={18} className="text-slate-400" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-700 text-slate-200">Checkout</h1>
            <p className="text-xs text-slate-500 mt-0.5">Secure & encrypted payment</p>
          </div>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 transition-all duration-300"
                  style={
                    i < stepIdx
                      ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#0a0a0f' }
                      : i === stepIdx
                      ? { background: 'rgba(0,210,255,0.15)', border: '2px solid #00d2ff', color: '#6ee7f7' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#475569' }
                  }
                >
                  {i < stepIdx ? <Icon name="CheckIcon" size={14} /> : i + 1}
                </div>
                <span className="text-xs font-500 hidden sm:block" style={{ color: i <= stepIdx ? '#94a3b8' : '#475569' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2 transition-all duration-300"
                  style={{ background: i < stepIdx ? 'linear-gradient(90deg, #00d2ff, #9b59ff)' : 'rgba(255,255,255,0.06)' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">

            {/* Step: Cart */}
            {step === 'cart' && (
              <div className="glass-card p-5 space-y-4">
                <h2 className="text-sm font-700 text-slate-300 flex items-center gap-2">
                  <Icon name="ShoppingCartIcon" size={16} className="text-cyan-glow" />
                  Your Items ({items.length})
                </h2>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <AppImage src={item.image} alt={item.imageAlt} width={64} height={64} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-600 text-slate-200 leading-snug">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">by {item.seller}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-700 gradient-text">${(item.price * item.quantity).toFixed(2)}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10">
                            <Icon name="MinusIcon" size={12} className="text-slate-400" />
                          </button>
                          <span className="text-sm font-600 text-slate-200 w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10">
                            <Icon name="PlusIcon" size={12} className="text-slate-400" />
                          </button>
                          <button onClick={() => updateQty(item.id, 0)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-400/10 ml-1">
                            <Icon name="TrashIcon" size={12} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setStep('shipping')}
                  disabled={items.length === 0}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-30"
                >
                  Continue to Shipping
                  <Icon name="ArrowRightIcon" size={16} />
                </button>
              </div>
            )}

            {/* Step: Shipping */}
            {step === 'shipping' && (
              <div className="glass-card p-5 space-y-4">
                <h2 className="text-sm font-700 text-slate-300 flex items-center gap-2">
                  <Icon name="TruckIcon" size={16} className="text-cyan-glow" />
                  Shipping Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'name', label: 'Full Name', placeholder: 'Your full name', type: 'text' },
                    { key: 'email', label: 'Email', placeholder: 'your@email.com', type: 'email' },
                    { key: 'address', label: 'Address', placeholder: 'Street address', type: 'text' },
                    { key: 'city', label: 'City', placeholder: 'City', type: 'text' },
                    { key: 'zip', label: 'ZIP / Postal Code', placeholder: '10000', type: 'text' },
                  ].map((f) => (
                    <div key={f.key} className={f.key === 'address' ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-600 text-slate-400 mb-1.5">{f.label}</label>
                      <input
                        type={f.type}
                        value={(form as any)[f.key]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="input-glass text-sm w-full"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-600 text-slate-400 mb-1.5">Country</label>
                    <select
                      value={form.country}
                      onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                      className="input-glass text-sm w-full"
                    >
                      <option value="MA">🇲🇦 Morocco</option>
                      <option value="FR">🇫🇷 France</option>
                      <option value="US">🇺🇸 United States</option>
                      <option value="GB">🇬🇧 United Kingdom</option>
                      <option value="AE">🇦🇪 UAE</option>
                      <option value="SA">🇸🇦 Saudi Arabia</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep('cart')} className="btn-glass flex-1 text-sm">Back</button>
                  <button
                    onClick={() => setStep('payment')}
                    disabled={!form.name || !form.email || !form.address}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-30"
                  >
                    Continue to Payment
                    <Icon name="ArrowRightIcon" size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step: Payment */}
            {step === 'payment' && (
              <div className="glass-card p-5 space-y-4">
                <h2 className="text-sm font-700 text-slate-300 flex items-center gap-2">
                  <Icon name="CreditCardIcon" size={16} className="text-cyan-glow" />
                  Payment Method
                </h2>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setSelectedPayment(pm.id)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-150"
                      style={
                        selectedPayment === pm.id
                          ? { background: 'rgba(0,210,255,0.06)', border: '1.5px solid rgba(0,210,255,0.3)' }
                          : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }
                      }
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: selectedPayment === pm.id ? 'rgba(0,210,255,0.12)' : 'rgba(255,255,255,0.05)' }}
                      >
                        <Icon name={pm.icon as any} size={18} className={selectedPayment === pm.id ? 'text-cyan-glow' : 'text-slate-500'} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-600 text-slate-200">{pm.label}</span>
                          <span
                            className="text-xs font-700 px-2 py-0.5 rounded-md"
                            style={{ background: `${pm.badgeColor}20`, color: pm.badgeColor }}
                          >
                            {pm.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{pm.desc}</p>
                      </div>
                      <div
                        className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-150"
                        style={
                          selectedPayment === pm.id
                            ? { borderColor: '#00d2ff', background: '#00d2ff' }
                            : { borderColor: '#475569', background: 'transparent' }
                        }
                      />
                    </button>
                  ))}
                </div>

                {/* Coming soon notice */}
                <div
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}
                >
                  <Icon name="InformationCircleIcon" size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300/80 leading-relaxed">
                    Payment processing will be activated soon. Your order details are saved and you&apos;ll be notified when payments go live.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('shipping')} className="btn-glass flex-1 text-sm">Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={processing}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                    style={{ minHeight: 44 }}
                  >
                    {processing ? (
                      <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Icon name="LockClosedIcon" size={16} />
                        Place Order · ${total.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step: Confirm */}
            {step === 'confirm' && (
              <div className="glass-card p-8 text-center space-y-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 32px rgba(0,210,255,0.4)' }}
                >
                  <Icon name="CheckIcon" size={28} className="text-white" />
                </div>
                <h2 className="text-xl font-700 gradient-text">Order Confirmed!</h2>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  Your order has been placed successfully. You&apos;ll receive a confirmation email at <span className="text-slate-300 font-600">{form.email || 'your email'}</span>.
                </p>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-600"
                  style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.15)', color: '#6ee7f7' }}
                >
                  <Icon name="ClockIcon" size={14} />
                  Payment processing coming soon
                </div>
                <div className="flex gap-3 justify-center pt-2">
                  <Link href="/marketplace">
                    <button className="btn-glass text-sm px-6">Continue Shopping</button>
                  </Link>
                  <Link href="/profile">
                    <button className="btn-primary text-sm px-6">View Orders</button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="space-y-4">
            <div className="glass-card p-5 space-y-4 sticky top-4">
              <h2 className="text-sm font-700 text-slate-300">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="text-slate-200 tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between">
                    <span className="text-green-400">Promo (HNCHAT10)</span>
                    <span className="text-green-400 tabular-nums">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Shipping</span>
                  <span className="text-slate-200 tabular-nums">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-white/06 pt-2">
                  <span className="font-600 text-slate-300">Total</span>
                  <span className="text-lg font-700 gradient-text tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo code */}
              {!promoApplied && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="input-glass text-sm flex-1 py-2"
                    onKeyDown={(e) => { if (e.key === 'Enter') applyPromo(); }}
                  />
                  <button onClick={applyPromo} className="btn-glass text-xs px-3 py-2">Apply</button>
                </div>
              )}

              {/* Trust badges */}
              <div className="space-y-2 pt-2 border-t border-white/06">
                {[
                  { icon: 'LockClosedIcon', text: 'SSL Encrypted Checkout', color: '#00d2ff' },
                  { icon: 'ShieldCheckIcon', text: 'Buyer Protection Guarantee', color: '#a78bfa' },
                  { icon: 'ArrowPathIcon', text: '30-Day Easy Returns', color: '#34d399' },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-2 text-xs text-slate-500">
                    <Icon name={b.icon as any} size={13} style={{ color: b.color }} />
                    {b.text}
                  </div>
                ))}
              </div>

              {/* Payment logos */}
              <div className="flex items-center gap-2 pt-1">
                {['Stripe', 'Paddle', 'PayPal'].map((p) => (
                  <div
                    key={p}
                    className="flex-1 py-1.5 rounded-lg text-center text-xs font-600"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#475569' }}
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
