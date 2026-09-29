import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Calendar,
  FileText,
  CreditCard,
  Check,
  AlertCircle,
  Loader2,
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  GraduationCap,
  Receipt,
  MoreHorizontal,
  Briefcase,
  Award,
  Laptop,
  Store,
  Gift,
} from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod, CATEGORIES, PAYMENT_METHODS } from '../types.ts';

// Map icon names to Lucide icons
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  GraduationCap,
  Receipt,
  MoreHorizontal,
  Briefcase,
  Award,
  Laptop,
  TrendingUp,
  Store,
  Gift,
  PlusCircle,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  editingTransaction?: Transaction | null;
  defaultDate?: string;
}

export const TransactionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  defaultDate,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('food');
  const [date, setDate] = useState<string>(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
      setPaymentMethod(editingTransaction.paymentMethod || 'cash');
    } else {
      setType('expense');
      setAmount('');
      setCategory('food');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setNote('');
      setPaymentMethod('bank_transfer');
    }
    setError(null);
  }, [editingTransaction, isOpen, defaultDate]);

  // When type changes, switch default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory('food');
    } else {
      setCategory('salary');
    }
  };

  const filteredCategories = CATEGORIES.filter((c) => c.type === type);

  const handleAddQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('กรุณากรอกจำนวนเงินที่มากกว่า 0');
      return;
    }

    if (!category) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }

    if (!date) {
      setError('กรุณาระบุวันที่');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        type,
        amount: numAmount,
        category,
        date,
        note: note.trim(),
        paymentMethod,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถบันทึกรายการได้ กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${
                type === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            >
              {type === 'expense' ? (
                <TrendingDown className="h-5 w-5" />
              ) : (
                <TrendingUp className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingTransaction ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
              </h2>
              <p className="text-xs text-slate-500">
                บันทึกลง Firebase Cloud Firestore แบบเรียลไทม์
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector (Tabs) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="h-4 w-4" />
              <span>รายจ่าย (Expense)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>รายรับ (Income)</span>
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ฿
              </span>
              <input
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-2xl font-bold tracking-tight text-slate-900 outline-hidden transition focus:ring-2 ${
                  type === 'expense'
                    ? 'border-slate-200 focus:border-rose-400 focus:ring-rose-200 text-rose-600'
                    : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-200 text-emerald-600'
                }`}
              />
            </div>
            {/* Quick Amount Badges */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1">ปุ่มลัด:</span>
              {[50, 100, 200, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddQuickAmount(preset)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
                >
                  +{preset.toLocaleString()}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('')}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-400 hover:text-slate-600"
              >
                ล้าง
              </button>
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              หมวดหมู่ *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
              {filteredCategories.map((cat) => {
                const IconComp = iconMap[cat.icon] || MoreHorizontal;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg mb-1.5"
                      style={{ backgroundColor: cat.bgColor, color: cat.color }}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-[11px] leading-tight line-clamp-1 ${
                        isSelected ? 'font-bold text-indigo-900' : 'text-slate-700 font-medium'
                      }`}
                    >
                      {cat.name.split('/')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                วันที่ทำรายการ *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-hidden focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ช่องทางชำระเงิน
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 outline-hidden focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              บันทึกช่วยจำ / รายละเอียดเพิ่มเติม (ไม่จำเป็น)
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ข้าวเที่ยงกับเพื่อน, ค่าน้ำมัน, ช้อปปิ้งของเข้าบ้าน"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-hidden focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                maxLength={200}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังบันทึกลง Firebase...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>{editingTransaction ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
