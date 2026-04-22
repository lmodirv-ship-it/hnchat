'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  price_mad: number;
  price_usd: number;
  duration_days: number;
  features: string[];
}

interface BankDetails {
  account_holder: string;
  bank_name: string;
  account_number: string;
  rib: string;
  iban: string;
  swift_code: string;
  currency: string;
  instructions: string;
}

interface Subscription {
  id: string;
  plan_name: string;
  status: string;
  payment_method: string;
  amount_mad: number;
  amount_usd: number;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

type Step = 'plans' | 'method' | 'bank_transfer' | 'paypal' | 'upload' | 'done';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'في الانتظار', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  pending_verification: { label: 'قيد المراجعة', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  approved: { label: 'مفعّل', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  rejected: { label: 'مرفوض', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  expired: { label: 'منتهي', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

const PLAN_COLORS: Record<string, string> = {
  free: '#94a3b8',
  basic: '#60a5fa',
  pro: '#a78bfa',
  business: '#fbbf24',
};

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const supabase = createClient();

  const [step, setStep] = useState<Step>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'paypal'>('bank_transfer');
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string>('');

  // Upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [transferRef, setTransferRef] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, bankRes] = await Promise.all([
        supabase.from('subscription_plans').select('*').eq('is_active', true).order('price_mad'),
        supabase.from('bank_transfer_details').select('*').eq('is_active', true).limit(1).single(),
      ]);

      if (plansRes.data) setPlans(plansRes.data);
      if (bankRes.data) setBankDetails(bankRes.data);

      if (user) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['approved', 'pending_verification', 'pending'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (sub) setCurrentSubscription(sub);
      }
    } catch {
      // no active subscription
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    setSelectedPlan(plan);
    setStep('method');
  };

  const handleCreateSubscription = async () => {
    if (!selectedPlan || !user) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          payment_method: paymentMethod,
          amount_mad: selectedPlan.price_mad,
          amount_usd: selectedPlan.price_usd,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSubscriptionId(json.subscription.id);
      setStep(paymentMethod === 'paypal' ? 'paypal' : 'bank_transfer');
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile || !subscriptionId) return;
    setSubmitting(true);
    setUploadProgress(20);
    try {
      const formData = new FormData();
      formData.append('file', receiptFile);
      formData.append('subscription_id', subscriptionId);
      formData.append('transfer_reference', transferRef);
      formData.append('notes', notes);

      setUploadProgress(60);
      const res = await fetch('/api/payments/upload-receipt', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setUploadProgress(100);
      toast.success('تم رفع الإيصال بنجاح! سيتم مراجعته خلال 24 ساعة');
      setStep('done');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'فشل رفع الإيصال');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" theme="dark" />
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/home-feed">
            <button className="p-2 rounded-xl transition-all hover:bg-white/5">
              <Icon name="ArrowLeftIcon" size={18} className="text-slate-400" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">الاشتراكات والدفع</h1>
            <p className="text-sm text-slate-500 mt-0.5">تحويل بنكي · PayPal</p>
          </div>
        </div>

        {/* Current Subscription Banner */}
        {currentSubscription && (
          <div className="mb-6 rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(52,211,153,0.15)' }}>
              <Icon name="CheckBadgeIcon" size={20} style={{ color: '#34d399' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">اشتراكك الحالي</p>
              <p className="text-xs text-slate-400 mt-0.5">
                خطة {currentSubscription.plan_name} ·{' '}
                <span style={{ color: STATUS_LABELS[currentSubscription.status]?.color }}>
                  {STATUS_LABELS[currentSubscription.status]?.label}
                </span>
                {currentSubscription.expires_at && (
                  <> · ينتهي {new Date(currentSubscription.expires_at).toLocaleDateString('ar-MA')}</>
                )}
              </p>
            </div>
          </div>
        )}

        {/* ── STEP: Plans ── */}
        {step === 'plans' && (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm mb-6">اختر الخطة المناسبة لك</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((plan) => {
                const color = PLAN_COLORS[plan.name] || '#94a3b8';
                const isFree = plan.price_mad === 0;
                return (
                  <button key={plan.id} onClick={() => !isFree && handleSelectPlan(plan)}
                    disabled={isFree}
                    className="text-left rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-default"
                    style={{
                      background: `linear-gradient(135deg, rgba(${color === '#fbbf24' ? '251,191,36' : color === '#a78bfa' ? '167,139,250' : color === '#60a5fa' ? '96,165,250' : '148,163,184'},0.08) 0%, rgba(15,15,25,0.9) 100%)`,
                      border: `1px solid ${color}33`,
                    }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
                          {plan.display_name}
                        </span>
                      </div>
                      {plan.name === 'pro' && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(167,139,250,0.2)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.4)' }}>
                          الأكثر شعبية
                        </span>
                      )}
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">{isFree ? 'مجاني' : `${plan.price_mad} درهم`}</span>
                      {!isFree && <span className="text-slate-500 text-sm mr-1">/ شهر</span>}
                      {!isFree && <p className="text-xs text-slate-500 mt-0.5">≈ ${plan.price_usd} USD</p>}
                    </div>
                    <ul className="space-y-1.5">
                      {plan.features.map((f: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                          <Icon name="CheckIcon" size={12} style={{ color }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {!isFree && (
                      <div className="mt-4 py-2.5 rounded-xl text-center text-sm font-semibold transition-all"
                        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
                        اختر هذه الخطة
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP: Payment Method ── */}
        {step === 'method' && selectedPlan && (
          <div className="max-w-lg mx-auto space-y-4">
            <button onClick={() => setStep('plans')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-2">
              <Icon name="ArrowRightIcon" size={14} /> العودة للخطط
            </button>
            <div className="rounded-2xl p-4 mb-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-slate-500">الخطة المختارة</p>
              <p className="text-white font-semibold mt-1">{selectedPlan.display_name} — {selectedPlan.price_mad} درهم/شهر</p>
            </div>
            <p className="text-slate-300 font-semibold">اختر طريقة الدفع</p>

            {/* Bank Transfer */}
            <button onClick={() => setPaymentMethod('bank_transfer')}
              className="w-full rounded-2xl p-4 text-left transition-all"
              style={{
                background: paymentMethod === 'bank_transfer' ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${paymentMethod === 'bank_transfer' ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(52,211,153,0.15)' }}>
                  <Icon name="BuildingLibraryIcon" size={20} style={{ color: '#34d399' }} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">تحويل بنكي</p>
                  <p className="text-xs text-slate-500 mt-0.5">للمغرب · درهم مغربي (MAD)</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: paymentMethod === 'bank_transfer' ? '#34d399' : '#475569' }}>
                  {paymentMethod === 'bank_transfer' && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#34d399' }} />
                  )}
                </div>
              </div>
            </button>

            {/* PayPal */}
            <button onClick={() => setPaymentMethod('paypal')}
              className="w-full rounded-2xl p-4 text-left transition-all"
              style={{
                background: paymentMethod === 'paypal' ? 'rgba(0,48,135,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${paymentMethod === 'paypal' ? 'rgba(0,112,243,0.4)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(0,112,243,0.15)' }}>
                  <span className="text-lg font-bold" style={{ color: '#0070f3' }}>P</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">PayPal</p>
                  <p className="text-xs text-slate-500 mt-0.5">دولي · دولار أمريكي (USD) — ${selectedPlan.price_usd}</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: paymentMethod === 'paypal' ? '#0070f3' : '#475569' }}>
                  {paymentMethod === 'paypal' && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#0070f3' }} />
                  )}
                </div>
              </div>
            </button>

            <button onClick={handleCreateSubscription} disabled={submitting}
              className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ background: 'linear-gradient(135deg, #34d399, #059669)', color: '#0a0a0f' }}>
              {submitting ? 'جاري المعالجة...' : 'متابعة →'}
            </button>
          </div>
        )}

        {/* ── STEP: Bank Transfer Details ── */}
        {step === 'bank_transfer' && bankDetails && (
          <div className="max-w-lg mx-auto space-y-4">
            <button onClick={() => setStep('method')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-2">
              <Icon name="ArrowRightIcon" size={14} /> العودة
            </button>
            <div className="rounded-2xl p-5 space-y-3"
              style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="BuildingLibraryIcon" size={18} style={{ color: '#34d399' }} />
                <p className="text-white font-semibold">معلومات التحويل البنكي</p>
              </div>
              {[
                { label: 'صاحب الحساب', value: bankDetails.account_holder, key: 'holder' },
                { label: 'البنك', value: bankDetails.bank_name, key: 'bank' },
                { label: 'رقم الحساب', value: bankDetails.account_number, key: 'account' },
                ...(bankDetails.rib ? [{ label: 'RIB', value: bankDetails.rib, key: 'rib' }] : []),
                ...(bankDetails.iban ? [{ label: 'IBAN', value: bankDetails.iban, key: 'iban' }] : []),
                ...(bankDetails.swift_code ? [{ label: 'SWIFT', value: bankDetails.swift_code, key: 'swift' }] : []),
              ].map(({ label, value, key }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-xs text-slate-500">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-mono">{value}</span>
                    <button onClick={() => copyToClipboard(value, key)}
                      className="p-1 rounded-lg transition-all hover:bg-white/10">
                      <Icon name={copied === key ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14}
                        style={{ color: copied === key ? '#34d399' : '#64748b' }} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <p className="text-xs font-semibold" style={{ color: '#fbbf24' }}>المبلغ المطلوب:</p>
                <p className="text-2xl font-bold text-white mt-1">{selectedPlan?.price_mad} درهم</p>
              </div>
            </div>
            {bankDetails.instructions && (
              <div className="rounded-xl p-3 text-xs text-slate-400"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Icon name="InformationCircleIcon" size={14} className="inline ml-1 text-blue-400" />
                {bankDetails.instructions}
              </div>
            )}
            <button onClick={() => setStep('upload')}
              className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #34d399, #059669)', color: '#0a0a0f' }}>
              رفع إيصال التحويل →
            </button>
          </div>
        )}

        {/* ── STEP: PayPal ── */}
        {step === 'paypal' && (
          <div className="max-w-lg mx-auto space-y-4">
            <button onClick={() => setStep('method')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-2">
              <Icon name="ArrowRightIcon" size={14} /> العودة
            </button>
            <div className="rounded-2xl p-6 text-center space-y-4"
              style={{ background: 'rgba(0,48,135,0.1)', border: '1px solid rgba(0,112,243,0.3)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(0,112,243,0.15)' }}>
                <span className="text-3xl font-bold" style={{ color: '#0070f3' }}>P</span>
              </div>
              <div>
                <p className="text-white font-bold text-lg">الدفع عبر PayPal</p>
                <p className="text-slate-400 text-sm mt-1">المبلغ: <span className="text-white font-semibold">${selectedPlan?.price_usd} USD</span></p>
              </div>
              <div className="rounded-xl p-3 text-xs text-slate-400 text-right"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="font-semibold text-white mb-1">تعليمات الدفع عبر PayPal:</p>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>أرسل المبلغ إلى: <span className="font-mono text-blue-400">payments@hnchat.net</span></li>
                  <li>في ملاحظة الدفع اكتب: اشتراك {selectedPlan?.display_name}</li>
                  <li>ارفع لقطة شاشة من PayPal كإيصال</li>
                </ol>
              </div>
              <button onClick={() => { copyToClipboard('payments@hnchat.net', 'paypal_email'); }}
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm transition-all hover:opacity-80"
                style={{ background: 'rgba(0,112,243,0.15)', color: '#60a5fa', border: '1px solid rgba(0,112,243,0.3)' }}>
                <Icon name={copied === 'paypal_email' ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14} />
                {copied === 'paypal_email' ? 'تم النسخ!' : 'نسخ البريد الإلكتروني'}
              </button>
            </div>
            <button onClick={() => setStep('upload')}
              className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #0070f3, #0050b3)', color: '#fff' }}>
              رفع إيصال PayPal →
            </button>
          </div>
        )}

        {/* ── STEP: Upload Receipt ── */}
        {step === 'upload' && (
          <div className="max-w-lg mx-auto space-y-4">
            <button onClick={() => setStep(paymentMethod === 'paypal' ? 'paypal' : 'bank_transfer')}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-2">
              <Icon name="ArrowRightIcon" size={14} /> العودة
            </button>
            <p className="text-white font-semibold">رفع إيصال الدفع</p>

            {/* File drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
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
                  <p className="text-sm text-slate-400">اضغط لرفع الإيصال</p>
                  <p className="text-xs text-slate-600">JPG, PNG, PDF — حتى 5MB</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">رقم مرجع التحويل (اختياري)</label>
                <input value={transferRef} onChange={(e) => setTransferRef(e.target.value)}
                  placeholder="مثال: TRF-2024-XXXXX"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-slate-500"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">ملاحظات (اختياري)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي معلومات إضافية..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-slate-500 resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="rounded-xl overflow-hidden h-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full transition-all duration-300 rounded-xl"
                  style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg, #34d399, #059669)' }} />
              </div>
            )}

            <button onClick={handleUploadReceipt} disabled={!receiptFile || submitting}
              className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #34d399, #059669)', color: '#0a0a0f' }}>
              {submitting ? 'جاري الرفع...' : 'إرسال الإيصال للمراجعة'}
            </button>
          </div>
        )}

        {/* ── STEP: Done ── */}
        {step === 'done' && (
          <div className="max-w-lg mx-auto text-center space-y-6 py-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(52,211,153,0.15)', border: '2px solid rgba(52,211,153,0.4)' }}>
              <Icon name="CheckIcon" size={36} style={{ color: '#34d399' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">تم استلام طلبك!</h2>
              <p className="text-slate-400 text-sm mt-2">سيتم مراجعة إيصالك وتفعيل اشتراكك خلال 24 ساعة</p>
            </div>
            <div className="rounded-2xl p-4 text-sm text-slate-400"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p>ستتلقى إشعاراً عند تفعيل اشتراكك</p>
            </div>
            <Link href="/home-feed">
              <button className="px-8 py-3 rounded-2xl font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)' }}>
                العودة للرئيسية
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
