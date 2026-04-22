'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface Receipt {
  id: string;
  status: string;
  created_at: string;
  receipt_url: string | null;
  rejection_reason: string | null;
  subscriptions: { plan_name: string; amount_mad: number; amount_usd: number; payment_method: string } | null;
  user_profiles: { username: string | null; full_name: string | null; email: string | null } | null;
}

interface BankForm {
  account_holder: string;
  bank_name: string;
  account_number: string;
  rib: string;
  iban: string;
  swift_code: string;
  instructions: string;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OwnerPaymentsScreen() {
  const supabase = createClient();
  const [tab, setTab] = useState<'receipts' | 'bank'>('receipts');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [receiptFilter, setReceiptFilter] = useState<'pending_verification' | 'approved' | 'rejected'>('pending_verification');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [bankForm, setBankForm] = useState<BankForm>({ account_holder: '', bank_name: '', account_number: '', rib: '', iban: '', swift_code: '', instructions: '' });
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const ownerFetch = useCallback(async (url: string, opts: RequestInit = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'x-owner-access': 'granted',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(opts.headers as Record<string, string> || {}),
      },
    });
  }, []);

  const loadReceipts = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_receipts')
        .select(`*, subscriptions(plan_name, amount_mad, amount_usd, payment_method), user_profiles!payment_receipts_user_id_fkey(username, full_name, email)`)
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) setReceipts(data as Receipt[]);
    } catch {
      showToast('Failed to load receipts', 'error');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const loadBankDetails = useCallback(async () => {
    setBankLoading(true);
    try {
      const { data } = await supabase.from('bank_transfer_details').select('*').eq('is_active', true).limit(1).single();
      if (data) setBankForm({
        account_holder: data.account_holder || '',
        bank_name: data.bank_name || '',
        account_number: data.account_number || '',
        rib: data.rib || '',
        iban: data.iban || '',
        swift_code: data.swift_code || '',
        instructions: data.instructions || '',
      });
    } catch { /* no bank details yet */ } finally {
      setBankLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (tab === 'receipts') loadReceipts(receiptFilter);
    if (tab === 'bank') loadBankDetails();
  }, [tab, receiptFilter]);

  const handleReceiptAction = async (receiptId: string, subscriptionId: string, action: 'approve' | 'reject') => {
    setActionLoading(`receipt_${receiptId}`);
    try {
      const res = await ownerFetch('/api/payments/verify-receipt', {
        method: 'POST',
        body: JSON.stringify({ receipt_id: receiptId, subscription_id: subscriptionId, action, rejection_reason: action === 'reject' ? rejectReason : undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showToast(json.message, 'success');
      setRejectingId(null);
      setRejectReason('');
      await loadReceipts(receiptFilter);
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const saveBankDetails = async () => {
    setBankSaving(true);
    try {
      const { data: existing } = await supabase.from('bank_transfer_details').select('id').eq('is_active', true).limit(1).single();
      if (existing) {
        await supabase.from('bank_transfer_details').update({ ...bankForm, updated_at: new Date().toISOString() }).eq('id', existing.id);
      } else {
        await supabase.from('bank_transfer_details').insert({ ...bankForm, currency: 'MAD', is_active: true });
      }
      showToast('Bank details saved successfully', 'success');
    } catch {
      showToast('Failed to save bank details', 'error');
    } finally {
      setBankSaving(false);
    }
  };

  const statusColors: Record<string, { bg: string; color: string }> = {
    pending_verification: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
    approved: { bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
    rejected: { bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl"
          style={{
            background: toast.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}`,
            backdropFilter: 'blur(20px)',
          }}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <p className="text-sm font-medium text-white">{toast.msg}</p>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <p className="text-sm mt-1" style={{ color: '#78716c' }}>Manage payment receipts and bank transfer details</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['receipts', 'bank'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
            style={{
              background: tab === t ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${tab === t ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.07)'}`,
              color: tab === t ? '#fbbf24' : '#78716c',
            }}>
            {t === 'receipts' ? 'Payment Receipts' : 'Bank Details'}
          </button>
        ))}
      </div>

      {/* Receipts tab */}
      {tab === 'receipts' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(['pending_verification', 'approved', 'rejected'] as const).map(s => (
              <button key={s} onClick={() => setReceiptFilter(s)}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: receiptFilter === s ? (statusColors[s]?.bg || 'rgba(251,191,36,0.15)') : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${receiptFilter === s ? (statusColors[s]?.color + '50') : 'rgba(255,255,255,0.07)'}`,
                  color: receiptFilter === s ? (statusColors[s]?.color || '#fbbf24') : '#78716c',
                }}>
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 className="text-sm font-bold text-white">Receipts</h3>
              <span className="text-xs" style={{ color: '#78716c' }}>{receipts.length} shown</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              </div>
            ) : receipts.length === 0 ? (
              <p className="text-center text-sm py-16" style={{ color: '#57534e' }}>No receipts found</p>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {receipts.map(receipt => (
                  <div key={receipt.id} className="px-5 py-4 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-white">
                            {receipt.user_profiles?.full_name || receipt.user_profiles?.username || 'Unknown'}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded-md"
                            style={{ background: statusColors[receipt.status]?.bg, color: statusColors[receipt.status]?.color }}>
                            {receipt.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs" style={{ color: '#57534e' }}>{timeAgo(receipt.created_at)}</span>
                        </div>
                        <p className="text-xs" style={{ color: '#78716c' }}>
                          {receipt.user_profiles?.email} · Plan: {receipt.subscriptions?.plan_name || 'N/A'} ·{' '}
                          {receipt.subscriptions?.amount_mad} MAD / {receipt.subscriptions?.amount_usd} USD
                        </p>
                        {receipt.receipt_url && (
                          <a href={receipt.receipt_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs mt-1 inline-flex items-center gap-1 hover:underline"
                            style={{ color: '#60a5fa' }}>
                            <Icon name="DocumentIcon" size={12} /> View Receipt
                          </a>
                        )}
                        {receipt.rejection_reason && (
                          <p className="text-xs mt-1" style={{ color: '#f87171' }}>Reason: {receipt.rejection_reason}</p>
                        )}
                      </div>
                      {receiptFilter === 'pending_verification' && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button disabled={!!actionLoading}
                            onClick={() => handleReceiptAction(receipt.id, (receipt as any).subscription_id, 'approve')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
                            Approve
                          </button>
                          <button disabled={!!actionLoading}
                            onClick={() => setRejectingId(rejectingId === receipt.id ? null : receipt.id)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                    {rejectingId === receipt.id && (
                      <div className="flex gap-2 ml-13">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Rejection reason..."
                          className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-red-500"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                        <button
                          disabled={!rejectReason.trim() || !!actionLoading}
                          onClick={() => handleReceiptAction(receipt.id, (receipt as any).subscription_id, 'reject')}
                          className="px-3 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                          Confirm Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bank Details tab */}
      {tab === 'bank' && (
        <div className="rounded-2xl p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
              <Icon name="BuildingLibraryIcon" size={18} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Bank Transfer Details</h3>
              <p className="text-xs" style={{ color: '#78716c' }}>Shown to users who choose bank transfer payment</p>
            </div>
          </div>

          {bankLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { key: 'account_holder', label: 'Account Holder' },
                { key: 'bank_name', label: 'Bank Name' },
                { key: 'account_number', label: 'Account Number' },
                { key: 'rib', label: 'RIB' },
                { key: 'iban', label: 'IBAN' },
                { key: 'swift_code', label: 'SWIFT / BIC' },
              ] as const).map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>{field.label}</label>
                  <input
                    type="text"
                    value={bankForm[field.key]}
                    onChange={e => setBankForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-amber-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Payment Instructions</label>
                <textarea
                  value={bankForm.instructions}
                  onChange={e => setBankForm(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>
          )}

          <button onClick={saveBankDetails} disabled={bankSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 20px rgba(251,191,36,0.2)' }}>
            {bankSaving && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {bankSaving ? 'Saving...' : 'Save Bank Details'}
          </button>
        </div>
      )}
    </div>
  );
}
