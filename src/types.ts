export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgColor: string;
}

export interface MonthlySummary {
  year: number;
  month: number; // 0-indexed (0 = Jan, 8 = Sep)
  monthLabel: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
  averageDailyExpense: number;
  highestExpenseCategory: { category: string; amount: number; percentage: number } | null;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
    count: number;
    type: TransactionType;
  }>;
  dailyBreakdown: Array<{
    date: string;
    dayNum: number;
    income: number;
    expense: number;
    net: number;
  }>;
}

export interface UserPreferences {
  monthlyBudget?: number;
  currency?: string;
}

export const CATEGORIES: CategoryInfo[] = [
  // Expense Categories
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#f97316', bgColor: '#fff7ed' },
  { id: 'transport', name: 'การเดินทาง/ยานพาหนะ', type: 'expense', icon: 'Car', color: '#3b82f6', bgColor: '#eff6ff' },
  { id: 'shopping', name: 'ช้อปปิ้ง/ของใช้ส่วนตัว', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', bgColor: '#fdf2f8' },
  { id: 'housing', name: 'ที่อยู่อาศัย/ค่าน้ำ-ไฟ', type: 'expense', icon: 'Home', color: '#8b5cf6', bgColor: '#f5f3ff' },
  { id: 'entertainment', name: 'บันเทิง/ท่องเที่ยว', type: 'expense', icon: 'Film', color: '#06b6d4', bgColor: '#ecfeff' },
  { id: 'health', name: 'สุขภาพ/ยารักษาโรค', type: 'expense', icon: 'HeartPulse', color: '#ef4444', bgColor: '#fef2f2' },
  { id: 'education', name: 'การศึกษา/พัฒนาตนเอง', type: 'expense', icon: 'GraduationCap', color: '#10b981', bgColor: '#ecfdf5' },
  { id: 'bills', name: 'บิล/ค่าบริการรายเดือน', type: 'expense', icon: 'Receipt', color: '#64748b', bgColor: '#f8fafc' },
  { id: 'other_expense', name: 'รายจ่ายอื่นๆ', type: 'expense', icon: 'MoreHorizontal', color: '#94a3b8', bgColor: '#f1f5f9' },

  // Income Categories
  { id: 'salary', name: 'เงินเดือนประจำ', type: 'income', icon: 'Briefcase', color: '#10b981', bgColor: '#ecfdf5' },
  { id: 'bonus', name: 'โบนัส/ค่าคอมมิชชัน', type: 'income', icon: 'Award', color: '#059669', bgColor: '#ecfdf5' },
  { id: 'freelance', name: 'ฟรีแลนซ์/งานเสริม', type: 'income', icon: 'Laptop', color: '#0ea5e9', bgColor: '#f0f9ff' },
  { id: 'investment', name: 'เงินปันผล/ดอกเบี้ย', type: 'income', icon: 'TrendingUp', color: '#6366f1', bgColor: '#eef2ff' },
  { id: 'business', name: 'ธุรกิจส่วนตัว/ขายของ', type: 'income', icon: 'Store', color: '#f59e0b', bgColor: '#fffbeb' },
  { id: 'gift', name: 'ของขวัญ/ผู้ใหญ่ให้', type: 'income', icon: 'Gift', color: '#d946ef', bgColor: '#fdf4ff' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', icon: 'PlusCircle', color: '#14b8a6', bgColor: '#f0fdfa' },
];

export const PAYMENT_METHODS: Array<{ id: PaymentMethod; label: string; icon: string }> = [
  { id: 'cash', label: 'เงินสด', icon: 'Banknote' },
  { id: 'bank_transfer', label: 'โอนผ่านธนาคาร', icon: 'Building2' },
  { id: 'credit_card', label: 'บัตรเครดิต/เดบิต', icon: 'CreditCard' },
  { id: 'e_wallet', label: 'พร้อมเพย์ / E-Wallet', icon: 'Smartphone' },
];
