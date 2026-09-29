import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { MonthlySummary } from '../types.ts';

interface Props {
  summary: MonthlySummary;
  selectedYear: number;
  selectedMonth: number;
  monthlyBudget: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectCurrentMonth: () => void;
  onOpenBudgetModal: () => void;
}

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const MonthlySummaryCards: React.FC<Props> = ({
  summary,
  selectedYear,
  selectedMonth,
  monthlyBudget,
  onPrevMonth,
  onNextMonth,
  onSelectCurrentMonth,
  onOpenBudgetModal,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return now.getFullYear() === selectedYear && now.getMonth() === selectedMonth;
  };

  const budgetUsagePercent = monthlyBudget > 0 ? (summary.totalExpense / monthlyBudget) * 100 : 0;
  const remainingBudget = monthlyBudget - summary.totalExpense;

  return (
    <div className="space-y-4">
      {/* Month Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {THAI_MONTHS[selectedMonth]} {selectedYear + 543}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                ({selectedYear})
              </span>
            </div>
            <p className="text-xs text-slate-500">
              สรุปภาพรวมรายรับ-รายจ่ายประจำเดือน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition cursor-pointer"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {!isCurrentMonth() && (
            <button
              type="button"
              onClick={onSelectCurrentMonth}
              className="rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 active:scale-95 transition cursor-pointer"
            >
              กลับเดือนปัจจุบัน
            </button>
          )}

          <button
            type="button"
            onClick={onNextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition cursor-pointer"
            title="เดือนถัดไป"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-emerald-800">
              รายรับรวม (Income)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-emerald-700">
              +{formatCurrency(summary.totalIncome)}
            </div>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              <span>บันทึกทั้งหมด</span>
              <strong className="text-slate-700">{summary.categoryBreakdown.filter(c => c.type === 'income').reduce((acc, curr) => acc + curr.count, 0)} รายการ</strong>
            </p>
          </div>
        </div>

        {/* Total Expense */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 via-white to-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-rose-800">
              รายจ่ายรวม (Expense)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-xs">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-rose-700">
              -{formatCurrency(summary.totalExpense)}
            </div>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              <span>เฉลี่ยวันละ</span>
              <strong className="text-slate-700">{formatCurrency(summary.averageDailyExpense)}</strong>
            </p>
          </div>
        </div>

        {/* Net Balance */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-5 shadow-xs transition hover:shadow-md ${
            summary.netBalance >= 0
              ? 'border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-white'
              : 'border-amber-100 bg-gradient-to-br from-amber-50/70 via-white to-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-slate-700">
              คงเหลือสุทธิ (Net)
            </span>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-xs ${
                summary.netBalance >= 0 ? 'bg-indigo-600' : 'bg-amber-600'
              }`}
            >
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold tracking-tight ${
                summary.netBalance >= 0 ? 'text-indigo-950' : 'text-amber-800'
              }`}
            >
              {summary.netBalance >= 0 ? '+' : ''}
              {formatCurrency(summary.netBalance)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">สัดส่วนเงินออม:</span>
              <span
                className={`font-bold ${
                  summary.savingsRate >= 20
                    ? 'text-emerald-600'
                    : summary.savingsRate > 0
                    ? 'text-indigo-600'
                    : 'text-rose-600'
                }`}
              >
                {summary.savingsRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Budget & Remaining */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50/80 via-white to-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-wide uppercase text-slate-700">
                งบประมาณรายจ่าย
              </span>
              <button
                type="button"
                onClick={onOpenBudgetModal}
                className="text-slate-400 hover:text-indigo-600 p-0.5 rounded-sm transition cursor-pointer"
                title="ตั้งค่างบประมาณ"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(monthlyBudget)}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                ใช้ไป {budgetUsagePercent.toFixed(0)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full transition-all duration-500 ${
                  budgetUsagePercent > 100
                    ? 'bg-rose-500'
                    : budgetUsagePercent > 80
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
              />
            </div>

            <p className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>คงเหลืองบ:</span>
              <span
                className={`font-semibold ${
                  remainingBudget < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'
                }`}
              >
                {remainingBudget < 0 ? 'เกินงบ ' : ''}
                {formatCurrency(Math.abs(remainingBudget))}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Budget Warning Banner if Over Budget */}
      {budgetUsagePercent >= 100 && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <strong>เตือนการใช้จ่ายเกินงบประมาณ:</strong> คุณใช้จ่ายในเดือนนี้เกินงบที่ตั้งไว้{' '}
            <strong className="underline">{formatCurrency(Math.abs(remainingBudget))}</strong>{' '}
            (ใช้ไปแล้ว {budgetUsagePercent.toFixed(1)}%)
          </div>
        </div>
      )}
    </div>
  );
};
