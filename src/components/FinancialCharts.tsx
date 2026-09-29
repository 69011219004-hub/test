import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { MonthlySummary, CATEGORIES } from '../types.ts';

interface Props {
  summary: MonthlySummary;
}

export const FinancialCharts: React.FC<Props> = ({ summary }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const formatBaht = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const expenseBreakdown = summary.categoryBreakdown.filter((c) => c.type === 'expense');

  // Custom Tooltip for Area/Bar charts
  const CustomDailyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-xs text-xs">
          <p className="font-bold text-slate-800 mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold font-mono text-slate-900">
                {formatBaht(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-xs text-xs">
          <p className="font-bold text-slate-900 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            {data.category}
          </p>
          <div className="mt-1 flex items-baseline justify-between gap-4 text-slate-600">
            <span>ยอดรวม:</span>
            <span className="font-bold font-mono text-slate-900">{formatBaht(data.amount)}</span>
          </div>
          <div className="mt-0.5 flex items-baseline justify-between gap-4 text-slate-600">
            <span>สัดส่วน:</span>
            <span className="font-bold text-indigo-600">{data.percentage.toFixed(1)}%</span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">
            จำนวน {data.count} รายการ
          </div>
        </div>
      );
    }
    return null;
  };

  const hasData = summary.totalIncome > 0 || summary.totalExpense > 0;

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">ยังไม่มีข้อมูลสำหรับสร้างกราฟในเดือนนี้</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          เริ่มต้นบันทึกรายรับหรือรายจ่ายรายการแรก เพื่อสร้างภาพวิเคราะห์และสรุปผลข้อมูลทางการเงินอัตโนมัติ
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Daily Cashflow Chart (7 Cols on LG) */}
      <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <span>ภาพวิเคราะห์กระแสเงินสดตามวัน (Daily Cashflow)</span>
            </h3>
            <p className="text-xs text-slate-500">
              เปรียบเทียบรายรับและรายจ่ายในแต่ละวันของเดือน
            </p>
          </div>

          {/* Toggle Area vs Bar */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              กราฟเส้นพื้นที่
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              กราฟแท่ง
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={summary.dailyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dayNum" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `฿${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomDailyTooltip />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="รายรับ"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="รายจ่าย"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            ) : (
              <BarChart data={summary.dailyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dayNum" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `฿${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomDailyTooltip />} />
                <Bar dataKey="income" name="รายรับ" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="รายจ่าย" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend Footnotes */}
        <div className="mt-3 flex items-center justify-center gap-6 border-t border-slate-100 pt-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span>รายรับ (Income)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500" />
            <span>รายจ่าย (Expense)</span>
          </div>
        </div>
      </div>

      {/* Expense Category Breakdown Chart (5 Cols on LG) */}
      <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-purple-600" />
                <span>สัดส่วนรายจ่ายตามหมวดหมู่</span>
              </h3>
              <p className="text-xs text-slate-500">
                {expenseBreakdown.length} หมวดหมู่ที่มีการใช้จ่าย
              </p>
            </div>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
              รวม {formatBaht(summary.totalExpense)}
            </span>
          </div>

          {expenseBreakdown.length > 0 ? (
            <>
              {/* Donut Chart */}
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="amount"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Ranking List */}
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1">
                {expenseBreakdown.slice(0, 5).map((cat, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/60 p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-semibold text-slate-800 line-clamp-1">
                          {cat.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{formatBaht(cat.amount)}</span>
                        <span className="font-semibold text-indigo-600 text-[11px]">
                          ({cat.percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              ไม่มีข้อมูลรายจ่ายในเดือนนี้
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
