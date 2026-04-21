'use client';
import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import Link from 'next/link';
import type { CartItem } from './MarketplaceScreen';

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
}

export default function CartSidebar({ open, onClose, items, onRemove, onUpdateQuantity }: CartSidebarProps) {
  const [checkingOut, setCheckingOut] = useState(false);

  const subtotal = items.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const shipping = items.length > 0 ? 4.99 : 0;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    setCheckingOut(true);
    await new Promise((r) => setTimeout(r, 1500));
    // Backend integration point: POST /api/marketplace/checkout
    toast.success('Order placed successfully! 🎉');
    setCheckingOut(false);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-full max-w-sm flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          background: 'rgba(12,12,20,0.98)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(110,231,247,0.1)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/06">
          <div className="flex items-center gap-2">
            <Icon name="ShoppingCartIcon" size={20} className="text-cyan-glow" />
            <h2 className="text-base font-700 text-slate-200">Your Cart</h2>
            {items.length > 0 && (
              <span
                className="text-xs font-700 px-2 py-0.5 rounded-full text-ice-black tabular-nums"
                style={{ background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' }}
              >
                {items.reduce((s, c) => s + c.quantity, 0)}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/08 transition-all duration-150">
            <Icon name="XMarkIcon" size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(110,231,247,0.08)', border: '1px solid rgba(110,231,247,0.15)' }}
              >
                <Icon name="ShoppingCartIcon" size={24} className="text-cyan-glow" />
              </div>
              <p className="text-sm font-600 text-slate-400 mb-1">Your cart is empty</p>
              <p className="text-xs text-slate-600">Add products to start shopping</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-xl transition-all duration-150"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <AppImage
                    src={item.image}
                    alt={item.imageAlt}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-slate-200 line-clamp-2 leading-snug">{item.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.seller}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-700 gradient-text tabular-nums">${(item.price * item.quantity).toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all duration-150"
                      >
                        <Icon name="MinusIcon" size={12} className="text-slate-400" />
                      </button>
                      <span className="text-sm font-600 text-slate-200 w-5 text-center tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all duration-150"
                      >
                        <Icon name="PlusIcon" size={12} className="text-slate-400" />
                      </button>
                      <button
                        onClick={() => { onRemove(item.id); toast.success('Item removed from cart'); }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-400/10 transition-all duration-150 ml-1"
                      >
                        <Icon name="TrashIcon" size={12} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary + Checkout */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-white/06 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-slate-200 tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Shipping</span>
                <span className="text-slate-200 tabular-nums">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/06 pt-2">
                <span className="text-sm font-600 text-slate-300">Total</span>
                <span className="text-lg font-700 gradient-text tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo code */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code"
                className="input-glass text-sm flex-1 py-2"
              />
              <button className="btn-glass text-sm px-4 py-2">Apply</button>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              style={{ minHeight: 48 }}
            >
              {checkingOut ? (
                <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
              ) : (
                <Link href="/checkout" className="flex items-center gap-2 w-full justify-center" onClick={onClose}>
                  <Icon name="LockClosedIcon" size={16} />
                  Secure Checkout · ${total.toFixed(2)}
                </Link>
              )}
            </button>

            <div className="flex items-center justify-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Icon name="ShieldCheckIcon" size={12} />
                Secure Payment
              </span>
              <span className="flex items-center gap-1">
                <Icon name="ArrowPathIcon" size={12} />
                Easy Returns
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}