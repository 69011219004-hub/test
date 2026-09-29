import React, { useState } from 'react';
import { X, PiggyBank, Check, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSaveBudget: (budget: number) => Promise<void>;
}

export const BudgetModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentBudget,
  onSaveBudget,
}) => {
  const [budget, setBudget] = useState(currentBudget.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(budget);
    if (isNaN(num) || num < 0) {
      setError('กรุณาระบุจำนวนงบประมาณเป็นตัวเลขที่ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSaveBudget(num);
      onClose();
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถบันทึกงบประมาณได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const presets = [10000, 15000, 20000, 30000, 50000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ตั้งค่างบประมาณประจำเดือน</h3>
              <p className="text-xs text-slate-500">บันทึกเป้าหมายรายจ่ายลงในบัญชีผู้ใช้ Firebase</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              งบประมาณรายจ่ายต่อเดือน (บาท)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
                ฿
              </span>
              <input
                type="number"
                min="0"
                step="100"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xl font-bold text-slate-900 outline-hidden focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1 self-center">ค่าแนะนำ:</span>
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBudget(p.toString())}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
                >
                  {p.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>บันทึกงบประมาณ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
