import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Transaction,
  MonthlySummary,
  CATEGORIES,
} from '../types.ts';
import {
  subscribeUserTransactions,
  addTransactionRecord,
  updateTransactionRecord,
  deleteTransactionRecord,
  FIREBASE_PROJECT_INFO,
} from '../lib/firebase.ts';
import { MonthlySummaryCards } from './MonthlySummaryCards.tsx';
import { FinancialCharts } from './FinancialCharts.tsx';
import { TransactionList } from './TransactionList.tsx';
import { TransactionModal } from './TransactionModal.tsx';
import { BudgetModal } from './BudgetModal.tsx';
import {
  PlusCircle,
  Database,
  ExternalLink,
  Sparkles,
  CloudCheck,
  Loader2,
  RefreshCw,
  FolderPlus,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser, userProfile, updateBudget } = useAuth();

  // Selected Month & Year
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth()); // 0-indexed

  // Transactions State
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);

  // Subscribe to real-time transactions from Firestore
  useEffect(() => {
    if (!currentUser) return;

    setIsLoadingTransactions(true);
    setFirestoreError(null);

    const unsubscribe = subscribeUserTransactions(
      currentUser.uid,
      (transactions) => {
        setAllTransactions(transactions);
        setIsLoadingTransactions(false);
        setFirestoreError(null);
      },
      (error) => {
        setFirestoreError(error.message || 'ไม่สามารถโหลดข้อมูลจาก Firestore ได้');
        setIsLoadingTransactions(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, retryKey]);

  // Navigate months
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleSelectCurrentMonth = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
  };

  // Filter transactions for the selected month
  const monthlyTransactions = useMemo(() => {
    return allTransactions.filter((t) => {
      if (!t.date) return false;
      const [yearStr, monthStr] = t.date.split('-');
      const y = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10) - 1; // 0-indexed
      return y === selectedYear && m === selectedMonth;
    });
  }, [allTransactions, selectedYear, selectedMonth]);

  // Compute Monthly Summary & Breakdown for Charts
  const monthlySummary = useMemo<MonthlySummary>(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const dailyMap = new Map<number, { income: number; expense: number }>();

    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap.set(d, { income: 0, expense: 0 });
    }

    const categoryMap = new Map<string, { amount: number; count: number; type: 'income' | 'expense' }>();

    monthlyTransactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpense += amt;
      }

      // Daily Breakdown
      const dayNum = parseInt(t.date.split('-')[2], 10);
      if (dailyMap.has(dayNum)) {
        const cur = dailyMap.get(dayNum)!;
        if (t.type === 'income') cur.income += amt;
        else cur.expense += amt;
      }

      // Category Breakdown
      const currentCat = categoryMap.get(t.category) || { amount: 0, count: 0, type: t.type };
      currentCat.amount += amt;
      currentCat.count += 1;
      categoryMap.set(t.category, currentCat);
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, (netBalance / totalIncome) * 100) : 0;
    const averageDailyExpense = daysInMonth > 0 ? totalExpense / daysInMonth : 0;

    // Convert category map to array with colors & percentage
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([catId, val]) => {
      const catDef = CATEGORIES.find((c) => c.id === catId);
      const denominator = val.type === 'expense' ? totalExpense : totalIncome;
      const percentage = denominator > 0 ? (val.amount / denominator) * 100 : 0;
      return {
        category: catDef?.name || catId,
        amount: val.amount,
        percentage,
        color: catDef?.color || '#94a3b8',
        count: val.count,
        type: val.type,
      };
    });

    // Sort category by amount desc
    categoryBreakdown.sort((a, b) => b.amount - a.amount);

    const expenseCategories = categoryBreakdown.filter((c) => c.type === 'expense');
    const highestExpenseCategory = expenseCategories.length > 0 ? expenseCategories[0] : null;

    // Daily breakdown array
    const dailyBreakdown = Array.from(dailyMap.entries()).map(([dayNum, val]) => ({
      date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
      dayNum,
      income: val.income,
      expense: val.expense,
      net: val.income - val.expense,
    }));

    return {
      year: selectedYear,
      month: selectedMonth,
      monthLabel: `${selectedMonth + 1}/${selectedYear}`,
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      transactionCount: monthlyTransactions.length,
      averageDailyExpense,
      highestExpenseCategory,
      categoryBreakdown,
      dailyBreakdown,
    };
  }, [monthlyTransactions, selectedYear, selectedMonth]);

  // Handlers for Add/Edit/Delete
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
  ) => {
    if (!currentUser) return;
    if (editingTransaction) {
      await updateTransactionRecord(currentUser.uid, editingTransaction.id, data);
      setEditingTransaction(null);
    } else {
      await addTransactionRecord(currentUser.uid, data);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!currentUser) return;
    await deleteTransactionRecord(currentUser.uid, id);
  };

  const handleEditClick = (t: Transaction) => {
    setEditingTransaction(t);
    setIsAddModalOpen(true);
  };

  // Seed sample transactions if user has 0 records (Helps immediate preview)
  const handleSeedSampleData = async () => {
    if (!currentUser) return;
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');

    const samples: Array<Omit<Transaction, 'id' | 'userId' | 'createdAt'>> = [
      {
        type: 'income',
        amount: 35000,
        category: 'salary',
        date: `${curYear}-${curMonth}-01`,
        note: 'เงินเดือนประจำ',
        paymentMethod: 'bank_transfer',
      },
      {
        type: 'expense',
        amount: 5500,
        category: 'housing',
        date: `${curYear}-${curMonth}-03`,
        note: 'ค่าเช่าห้องพัก & ค่าน้ำไฟ',
        paymentMethod: 'bank_transfer',
      },
      {
        type: 'expense',
        amount: 320,
        category: 'food',
        date: `${curYear}-${curMonth}-05`,
        note: 'รับประทานอาหารกลางวัน',
        paymentMethod: 'e_wallet',
      },
      {
        type: 'expense',
        amount: 900,
        category: 'transport',
        date: `${curYear}-${curMonth}-07`,
        note: 'เติมน้ำมันรถ',
        paymentMethod: 'credit_card',
      },
      {
        type: 'expense',
        amount: 1450,
        category: 'shopping',
        date: `${curYear}-${curMonth}-10`,
        note: 'ซื้อของใช้ในบ้านและซูเปอร์มาร์เก็ต',
        paymentMethod: 'credit_card',
      },
      {
        type: 'income',
        amount: 4500,
        category: 'freelance',
        date: `${curYear}-${curMonth}-12`,
        note: 'รับจ้างงานออกแบบนอกเวลา',
        paymentMethod: 'bank_transfer',
      },
      {
        type: 'expense',
        amount: 480,
        category: 'entertainment',
        date: `${curYear}-${curMonth}-15`,
        note: 'ดูภาพยนตร์และขนม',
        paymentMethod: 'cash',
      },
    ];

    try {
      for (const item of samples) {
        await addTransactionRecord(currentUser.uid, item);
      }
    } catch (err) {
      console.error('Failed to seed sample records:', err);
    }
  };

  const monthlyBudget = userProfile?.monthlyBudget || 15000;

  return (
    <div className="space-y-6">
      {/* Top Banner / Cloud Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-emerald-50/50 p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900">
                ระบบจัดการรายรับ-รายจ่ายบนคลาวด์
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Firebase Real-time Connected
              </span>
            </div>
            <p className="text-xs text-slate-500">
              โปรเจกต์: <span className="font-mono text-indigo-700 font-bold">{FIREBASE_PROJECT_INFO.projectId}</span> &bull; 
              บัญชี: <span className="text-slate-700 font-medium">{currentUser?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allTransactions.length === 0 && !isLoadingTransactions && (
            <button
              type="button"
              onClick={handleSeedSampleData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 active:scale-95 transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>ใส่ข้อมูลตัวอย่างเพื่อทดสอบ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>บันทึกรายการ</span>
          </button>
        </div>
      </div>

      {firestoreError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div>
            <strong>พบปัญหาการเชื่อมต่อ Firestore:</strong> {firestoreError}
            <span className="block mt-0.5 text-slate-600">
              ได้ทำการอัปเดตกฎความปลอดภัย (Security Rules) เรียบร้อยแล้ว กดปุ่มด้านขวาเพื่อโหลดข้อมูลใหม่ได้ทันทีครับ
            </span>
          </div>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>ลองเชื่อมต่อใหม่อีกครั้ง</span>
          </button>
        </div>
      )}

      {/* 1. Monthly Summary Cards */}
      <MonthlySummaryCards
        summary={monthlySummary}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        monthlyBudget={monthlyBudget}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onSelectCurrentMonth={handleSelectCurrentMonth}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
      />

      {/* 2. Financial Charts & Visualization */}
      <FinancialCharts summary={monthlySummary} />

      {/* 3. Transaction List */}
      <TransactionList
        transactions={monthlyTransactions}
        onEdit={handleEditClick}
        onDelete={handleDeleteTransaction}
        onAddNew={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        defaultDate={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={monthlyBudget}
        onSaveBudget={async (newBudget) => {
          await updateBudget(newBudget);
        }}
      />
    </div>
  );
};
