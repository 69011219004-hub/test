import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  TrendingDown,
  TrendingUp,
  Download,
  Calendar,
  CreditCard,
  Building2,
  Smartphone,
  Banknote,
  FileSpreadsheet,
  AlertCircle,
  MoreHorizontal,
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  GraduationCap,
  Receipt,
  Briefcase,
  Award,
  Laptop,
  Store,
  Gift,
  PlusCircle,
} from 'lucide-react';
import { Transaction, TransactionType, CATEGORIES, PAYMENT_METHODS } from '../types.ts';

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

const paymentIconMap: Record<string, React.FC<{ className?: string }>> = {
  cash: Banknote,
  bank_transfer: Building2,
  credit_card: CreditCard,
  e_wallet: Smartphone,
};

interface Props {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
}

export const TransactionList: React.FC<Props> = ({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const getCategoryDetails = (catId: string, type: TransactionType) => {
    const found = CATEGORIES.find((c) => c.id === catId);
    if (found) return found;
    return {
      id: catId,
      name: catId,
      type,
      icon: 'MoreHorizontal',
      color: '#64748b',
      bgColor: '#f1f5f9',
    };
  };

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const catInfo = getCategoryDetails(t.category, t.type);
        const matchNote = t.note?.toLowerCase().includes(query);
        const matchCat = catInfo.name.toLowerCase().includes(query);
        if (!matchNote && !matchCat) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchQuery]);

  // Group by Date
  const grouped = useMemo(() => {
    const map = new Map<string, { transactions: Transaction[]; totalIncome: number; totalExpense: number }>();

    filtered.forEach((t) => {
      const existing = map.get(t.date) || {
        transactions: [],
        totalIncome: 0,
        totalExpense: 0,
      };
      existing.transactions.push(t);
      if (t.type === 'income') existing.totalIncome += t.amount;
      else existing.totalExpense += t.amount;
      map.set(t.date, existing);
    });

    // Sort by date descending
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'ช่องทางชำระ', 'บันทึกช่วยจำ'];
    const rows = filtered.map((t) => {
      const cat = getCategoryDetails(t.category, t.type);
      const pm = PAYMENT_METHODS.find((p) => p.id === t.paymentMethod)?.label || t.paymentMethod;
      return [
        `"${t.date}"`,
        `"${t.type === 'income' ? 'รายรับ' : 'รายจ่าย'}"`,
        `"${cat.name}"`,
        t.amount,
        `"${pm}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `income-expense-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      const thaiMonths = [
        'ม.ค.',
        'ก.พ.',
        'มี.ค.',
        'เม.ย.',
        'พ.ค.',
        'มิ.ย.',
        'ก.ค.',
        'ส.ค.',
        'ก.ย.',
        'ต.ค.',
        'พ.ย.',
        'ธ.ค.',
      ];
      return `${parseInt(d, 10)} ${thaiMonths[parseInt(m, 10) - 1]} ${parseInt(y, 10) + 543}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Header with Search & Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ประวัติรายการบันทึก
            </h3>
            <p className="text-xs text-slate-500">
              แสดงทั้งหมด {filtered.length} รายการ (ซิงค์แบบเรียลไทม์กับ Firebase)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>ส่งออก CSV</span>
            </button>

            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>เพิ่มรายการใหม่</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามหมวดหมู่ หรือบันทึกช่วยจำ..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-hidden focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="sm:col-span-4 flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer ${
                typeFilter === 'expense'
                  ? 'bg-white text-rose-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('income')}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer ${
                typeFilter === 'income'
                  ? 'bg-white text-emerald-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
          </div>

          {/* Category Filter Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-700 outline-hidden focus:border-indigo-400 focus:bg-white"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List Content */}
      <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
        {grouped.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">ไม่พบรายการบันทึก</p>
            <p className="mt-1 text-xs text-slate-400">
              {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all'
                ? 'ลองปรับเปลี่ยนตัวกรองค้นหา'
                : 'เริ่มบันทึกรายรับหรือรายจ่ายรายการแรกเพื่อดูรายการที่นี่'}
            </p>
          </div>
        ) : (
          grouped.map(([dateKey, group]) => (
            <div key={dateKey} className="p-4 sm:p-5">
              {/* Date Header with Day Summary */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-dashed border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {formatDateDisplay(dateKey)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({group.transactions.length} รายการ)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {group.totalIncome > 0 && (
                    <span className="font-bold text-emerald-600 font-mono">
                      +{formatCurrency(group.totalIncome)}
                    </span>
                  )}
                  {group.totalExpense > 0 && (
                    <span className="font-bold text-rose-600 font-mono">
                      -{formatCurrency(group.totalExpense)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions in this Day */}
              <div className="space-y-2.5">
                {group.transactions.map((t) => {
                  const cat = getCategoryDetails(t.category, t.type);
                  const IconComp = iconMap[cat.icon] || MoreHorizontal;
                  const PaymentIcon = paymentIconMap[t.paymentMethod] || Banknote;
                  const isDeleting = deletingId === t.id;

                  return (
                    <div
                      key={t.id}
                      className="group flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                          style={{ backgroundColor: cat.color }}
                        >
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {cat.name}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                              <PaymentIcon className="h-3 w-3 text-slate-400" />
                              <span>{PAYMENT_METHODS.find((p) => p.id === t.paymentMethod)?.label}</span>
                            </span>
                          </div>
                          {t.note ? (
                            <p className="text-xs text-slate-500 truncate mt-0.5 max-w-xs sm:max-w-md">
                              {t.note}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-0.5 italic">
                              ไม่มีบันทึกช่วยจำ
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Amount & Actions */}
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span
                          className={`text-sm font-bold font-mono ${
                            t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {t.type === 'income' ? '+' : '-'}
                          {formatCurrency(t.amount)}
                        </span>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            type="button"
                            onClick={() => onEdit(t)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-indigo-600 transition cursor-pointer"
                            title="แก้ไข"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteClick(t.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer disabled:opacity-50"
                            title="ลบ"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
