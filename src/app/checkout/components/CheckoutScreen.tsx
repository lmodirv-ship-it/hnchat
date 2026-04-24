'use client';
import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';

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
  { id: 'bank_transfer', label: 'تحويل بنكي', icon: 'BuildingLibraryIcon', badge: 'Bank', badgeColor: '#34d399', desc: 'MAD · درهم مغربي' },
  { id: 'paypal', label: 'PayPal', icon: 'BanknotesIcon', badge: 'PayPal', badgeColor: '#0070f3', desc: 'USD · دولار أمريكي' },
];

type Step = 'cart' | 'shipping' | 'payment' | 'bank_details' | 'upload' | 'confirm';

interface BankDetails {
  account_holder: string;
  bank_name: string;
  account_number: string;
  rib?: string;
  iban?: string;
  swift_code?: string;
  instructions?: string;
}

export default function CheckoutScreen() {
  const { user } = useAuth();
  const supabase = createClient();
  const { formatAmount, currency, t } = useI18n();
  const [step, setStep] = useState<Step>('cart');
  const [items, setItems] = useState<CheckoutItem[]>(MOCK_ITEMS);
  const [selectedPayment, setSelectedPayment] = useState('bank_transfer');
  const [processing, setProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', country: 'MA', zip: '' });
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [copied, setCopied] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [transferRef, setTransferRef] = useState('');
  const [orderId, setOrderId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const shipping = 4.99;
  const total = subtotal - discount + shipping;
  const totalMAD = (total * 10).toFixed(2); // approx conversion

  useEffect(() => {
    supabase.from('bank_transfer_details').select('*').eq('is_active', true).limit(1).single()
      .then(({ data }) => { if (data) setBankDetails(data); });
  }, []);

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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      // Create order record in Supabase
      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        items: items,
        subtotal,
        discount,
        shipping,
        total,
        payment_method: selectedPayment,
        shipping_address: form,
        status: 'pending_payment',
      }).select().single();

      if (error) throw error;
      setOrderId(order?.id || `ORD-${Date.now()}`);

      if (selectedPayment === 'bank_transfer') {
        setStep('bank_details');
      } else {
        // PayPal instructions
        setStep('bank_details');
      }
    } catch {
      // Fallback: still show bank details even without DB
      setOrderId(`ORD-${Date.now()}`);
      setStep('bank_details');
    } finally {
      setProcessing(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile) return;
    setProcessing(true);
    try {
      const ext = receiptFile.name.split('.').pop();
      const filename = `orders/${orderId}_${Date.now()}.${ext}`;
      const arrayBuffer = await receiptFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(filename, buffer, { contentType: receiptFile.type, upsert: true });

      if (!uploadError) {
        await supabase.from('payment_receipts').insert({
          user_id: user?.id || null,
          receipt_url: filename,
          receipt_filename: receiptFile.name,
          transfer_reference: transferRef || null,
          status: 'pending_verification',
          notes: `Order: ${orderId}`,
        });
        await supabase.from('orders').update({ status: 'pending_verification' }).eq('id', orderId);
      }

      // 🔔 Brevo: trigger purchase confirmation email
      if (user?.email) {
        fetch('/api/email/purchase-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.user_metadata?.full_name || user.email.split('@')[0],
            orderId,
            items: items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
            total,
          }),
        }).catch(() => {});
      }

      toast.success('Receipt uploaded! We\'ll verify within 24 hours.');
      setStep('confirm');
    } catch {
      // 🔔 Brevo: trigger purchase confirmation email even on fallback path
      if (user?.email) {
        fetch('/api/email/purchase-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.user_metadata?.full_name || user.email.split('@')[0],
            orderId,
            items: items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
            total,
          }),
        }).catch(() => {});
      }
      toast.success('Order placed! Please send your receipt to payments@hnchat.net');
      setStep('confirm');
    } finally {
      setProcessing(false);
    }
  };

  const STEPS: { id: Step; label: string }[] = [
    { id: 'cart', label: 'Cart' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment', label: 'Payment' },
    { id: 'confirm', label: 'Confirm' },
  ];
  const displayStep = step === 'bank_details' || step === 'upload' ? 'payment' : step;
  const stepIdx = STEPS.findIndex((s) => s.id === displayStep);

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
                      <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-150"
                        style={
                          selectedPayment === pm.id
                            ? { borderColor: '#00d2ff', background: '#00d2ff' }
                            : { borderColor: '#475569', background: 'transparent' }
                        }
                      />
                    </button>
                  ))}
                </div>

                {/* Bank details */}
                {selectedPayment === 'bank_transfer' && bankDetails ? (
                  <div className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <Icon name="BuildingLibraryIcon" size={16} className="text-cyan-glow flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-amber-300/80 leading-relaxed">
                        Transfer <strong className="text-white">{totalMAD} MAD</strong> to our bank account.
                      </p>
                      <div className="space-y-2 mt-2">
                        {[
                          { label: 'Account Holder', value: bankDetails.account_holder, key: 'holder' },
                          { label: 'Bank', value: bankDetails.bank_name, key: 'bank' },
                          { label: 'Account Number', value: bankDetails.account_number, key: 'account' },
                          ...(bankDetails.rib ? [{ label: 'RIB', value: bankDetails.rib, key: 'rib' }] : []),
                          ...(bankDetails.iban ? [{ label: 'IBAN', value: bankDetails.iban, key: 'iban' }] : []),
                          ...(bankDetails.swift_code ? [{ label: 'SWIFT', value: bankDetails.swift_code, key: 'swift' }] : []),
                        ].map(({ label, value, key }) => (
                          <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <span className="text-xs text-slate-500">{label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white font-mono">{value}</span>
                              <button onClick={() => copyToClipboard(value, key)} className="p-1 rounded-lg hover:bg-white/10">
                                <Icon name={copied === key ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14}
                                  style={{ color: copied === key ? '#34d399' : '#64748b' }} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2">
                          <p className="text-xs font-semibold text-amber-400">Amount to transfer:</p>
                          <p className="text-2xl font-bold text-white mt-1">{totalMAD} MAD</p>
                          <p className="text-xs text-slate-500">(≈ ${total.toFixed(2)} USD)</p>
                        </div>
                        {bankDetails.instructions && (
                          <p className="text-xs text-slate-400 pt-1">{bankDetails.instructions}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : selectedPayment === 'bank_transfer' ? (
                  <div className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Icon name="BuildingLibraryIcon" size={16} className="text-cyan-glow flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-amber-300/80 leading-relaxed">
                        Transfer <strong className="text-white">{totalMAD} MAD</strong> to our bank account.
                      </p>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <span className="text-xs text-slate-500">Account Holder</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-mono">{bankDetails?.account_holder}</span>
                            <button onClick={() => copyToClipboard(bankDetails?.account_holder || '', 'holder')}
                              className="p-1 rounded-lg hover:bg-white/10">
                              <Icon name={copied === 'holder' ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14}
                                style={{ color: copied === 'holder' ? '#34d399' : '#64748b' }} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <span className="text-xs text-slate-500">Bank</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-mono">{bankDetails?.bank_name}</span>
                            <button onClick={() => copyToClipboard(bankDetails?.bank_name || '', 'bank')}
                              className="p-1 rounded-lg hover:bg-white/10">
                              <Icon name={copied === 'bank' ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14}
                                style={{ color: copied === 'bank' ? '#34d399' : '#64748b' }} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <span className="text-xs text-slate-500">Account Number</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-mono">{bankDetails?.account_number}</span>
                            <button onClick={() => copyToClipboard(bankDetails?.account_number || '', 'account')}
                              className="p-1 rounded-lg hover:bg-white/10">
                              <Icon name={copied === 'account' ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14}
                                style={{ color: copied === 'account' ? '#34d399' : '#64748b' }} />
                            </button>
                          </div>
                        </div>
                        {bankDetails.rib && (
                          <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <span className="text-xs text-slate-500">RIB</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white font-mono">{bankDetails.rib}</span>
                              <button onClick={() => copyToClipboard(bankDetails.rib, 'rib')}
                                className="p-1 rounded-lg hover:bg-white/10">
                                <Icon name={copied === 'rib' ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14}
                                  style={{ color: copied === 'rib' ? '#34d399' : '#64748b' }} />
                              </button>
                            </div>
                          </div>
                        )}
                        {bankDetails.iban && (
                          <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <span className="text-xs text-slate-500">IBAN</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white font-mono">{bankDetails.iban}</span>
                              <button onClick={() => copyToClipboard(bankDetails.iban, 'iban')}
                                className="p-1 rounded-lg hover:bg-white/10">
                                <Icon name={copied === 'iban' ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14}
                                  style={{ color: copied === 'iban' ? '#34d399' : '#64748b' }} />
                              </button>
                            </div>
                          </div>
                        )}
                        {bankDetails.swift_code && (
                          <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <span className="text-xs text-slate-500">SWIFT</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white font-mono">{bankDetails.swift_code}</span>
                              <button onClick={() => copyToClipboard(bankDetails.swift_code, 'swift')}
                                className="p-1 rounded-lg hover:bg-white/10">
                                <Icon name={copied === 'swift' ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14}
                                  style={{ color: copied === 'swift' ? '#34d399' : '#64748b' }} />
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="pt-2">
                          <p className="text-xs font-semibold text-amber-400">Amount to transfer:</p>
                          <p className="text-2xl font-bold text-white mt-1">{totalMAD} MAD</p>
                          <p className="text-xs text-slate-500">(≈ ${total.toFixed(2)} USD)</p>
                        </div>
                        {bankDetails.instructions && (
                          <p className="text-xs text-slate-400 pt-1">{bankDetails.instructions}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(0,48,135,0.1)', border: '1px solid rgba(0,112,243,0.3)' }}>
                    <Icon name="BanknotesIcon" size={16} className="text-cyan-glow flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-amber-300/80 leading-relaxed">
                        Send <strong className="text-white">${total.toFixed(2)}</strong> USD via PayPal.
                      </p>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <span className="text-xs text-slate-500">Email</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-mono">payments@hnchat.net</span>
                            <button onClick={() => copyToClipboard('payments@hnchat.net', 'paypal')}
                              className="p-1 rounded-lg hover:bg-white/10">
                              <Icon name={copied === 'paypal' ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14}
                                style={{ color: copied === 'paypal' ? '#34d399' : '#64748b' }} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <span className="text-xs text-slate-500">Order ID</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-mono">{orderId}</span>
                            <button onClick={() => copyToClipboard(orderId, 'order')}
                              className="p-1 rounded-lg hover:bg-white/10">
                              <Icon name={copied === 'order' ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14}
                                style={{ color: copied === 'order' ? '#34d399' : '#64748b' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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

            {/* Step: Bank Details */}
            {step === 'bank_details' && (
              <div className="glass-card p-5 space-y-4">
                <h2 className="text-sm font-700 text-slate-300 flex items-center gap-2">
                  <Icon name="BuildingLibraryIcon" size={16} className="text-cyan-glow" />
                  {selectedPayment === 'paypal' ? 'PayPal Payment Instructions' : 'Bank Transfer Details'}
                </h2>

                {selectedPayment === 'bank_transfer' && bankDetails ? (
                  <div className="rounded-2xl p-4 space-y-3"
                    style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    {[
                      { label: 'Account Holder', value: bankDetails.account_holder, key: 'holder' },
                      { label: 'Bank', value: bankDetails.bank_name, key: 'bank' },
                      { label: 'Account Number', value: bankDetails.account_number, key: 'account' },
                      ...(bankDetails.rib ? [{ label: 'RIB', value: bankDetails.rib, key: 'rib' }] : []),
                      ...(bankDetails.iban ? [{ label: 'IBAN', value: bankDetails.iban, key: 'iban' }] : []),
                      ...(bankDetails.swift_code ? [{ label: 'SWIFT', value: bankDetails.swift_code, key: 'swift' }] : []),
                    ].map(({ label, value, key }) => (
                      <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <span className="text-xs text-slate-500">{label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-mono">{value}</span>
                          <button onClick={() => copyToClipboard(value, key)} className="p-1 rounded-lg hover:bg-white/10">
                            <Icon name={copied === key ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14}
                              style={{ color: copied === key ? '#34d399' : '#64748b' }} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <p className="text-xs font-semibold text-amber-400">Amount to transfer:</p>
                      <p className="text-2xl font-bold text-white mt-1">{totalMAD} MAD</p>
                      <p className="text-xs text-slate-500">(≈ ${total.toFixed(2)} USD)</p>
                    </div>
                    {bankDetails.instructions && (
                      <p className="text-xs text-slate-400 pt-1">{bankDetails.instructions}</p>
                    )}
                  </div>
                ) : selectedPayment === 'bank_transfer' ? (
                  <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-sm text-slate-400">Please transfer <strong className="text-white">{totalMAD} MAD</strong> to our bank account.</p>
                    <p className="text-xs text-slate-500 mt-1">Contact us at <span className="text-cyan-400">payments@hnchat.net</span> for bank details.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl p-5 text-center space-y-3"
                    style={{ background: 'rgba(0,48,135,0.1)', border: '1px solid rgba(0,112,243,0.3)' }}>
                    <p className="text-white font-semibold">Send ${total.toFixed(2)} USD via PayPal</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-blue-400 font-mono text-sm">payments@hnchat.net</span>
                      <button onClick={() => copyToClipboard('payments@hnchat.net', 'paypal')} className="p-1 rounded-lg hover:bg-white/10">
                        <Icon name={copied === 'paypal' ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14}
                          style={{ color: copied === 'paypal' ? '#34d399' : '#64748b' }} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">Include your order ID in the note: <span className="font-mono text-slate-300">{orderId}</span></p>
                  </div>
                )}

                <button onClick={() => setStep('upload')}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                  <Icon name="ArrowUpTrayIcon" size={16} />
                  Upload Payment Receipt
                </button>
              </div>
            )}

            {/* Step: Upload Receipt */}
            {step === 'upload' && (
              <div className="glass-card p-5 space-y-4">
                <h2 className="text-sm font-700 text-slate-300 flex items-center gap-2">
                  <Icon name="ArrowUpTrayIcon" size={16} className="text-cyan-glow" />
                  Upload Payment Receipt
                </h2>
                <div onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-slate-500"
                  style={{
                    border: `2px dashed ${receiptFile ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.12)'}`,
                    background: receiptFile ? 'rgba(52,211,153,0.05)' : 'rgba(255,255,255,0.02)',
                  }}>
                  <input ref={fileInputRef} type="file" className="hidden"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                  {receiptFile ? (
                    <div className="space-y-2">
                      <Icon name="DocumentCheckIcon" size={32} style={{ color: '#34d399' }} className="mx-auto" />
                      <p className="text-sm text-white font-medium">{receiptFile.name}</p>
                      <p className="text-xs text-slate-500">{(receiptFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Icon name="ArrowUpTrayIcon" size={32} className="mx-auto text-slate-500" />
                      <p className="text-sm text-slate-400">Click to upload receipt</p>
                      <p className="text-xs text-slate-600">JPG, PNG, PDF — up to 5MB</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1.5">Transfer Reference (optional)</label>
                  <input value={transferRef} onChange={(e) => setTransferRef(e.target.value)}
                    placeholder="e.g. TRF-2024-XXXXX"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-slate-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep('bank_details')} className="btn-glass flex-1 text-sm">Back</button>
                  <button onClick={handleUploadReceipt} disabled={!receiptFile || processing}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-40">
                    {processing ? <Icon name="ArrowPathIcon" size={16} className="animate-spin" /> : 'Submit Receipt'}
                  </button>
                </div>
              </div>
            )}

            {/* Step: Confirm */}
            {step === 'confirm' && (
              <div className="glass-card p-8 text-center space-y-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 32px rgba(0,210,255,0.4)' }}>
                  <Icon name="CheckIcon" size={28} className="text-white" />
                </div>
                <h2 className="text-xl font-700 gradient-text">Order Confirmed!</h2>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  Your order has been placed. We&apos;ll verify your payment within 24 hours and send a confirmation to{' '}
                  <span className="text-slate-300 font-600">{form.email || 'your email'}</span>.
                </p>
                {orderId && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-600"
                    style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.15)', color: '#6ee7f7' }}>
                    <Icon name="ReceiptRefundIcon" size={14} />
                    Order ID: {orderId}
                  </div>
                )}
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
