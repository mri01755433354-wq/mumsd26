import React, { useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Clock,
  Printer,
  Calendar,
  Building,
  Baby,
  BookOpen,
  BookMarked,
  Utensils,
  Building2,
  ChevronRight,
  CreditCard,
  AlertCircle,
  FileCheck2,
  PieChart as PieChartIcon,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Transaction, DepartmentId, AdvanceSettlement, MadrasaProfile } from '../types';
import {
  DEPARTMENTS,
  formatTaka,
  toBengaliNumber,
  formatBengaliDate
} from '../utils/formatters';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  transactions: Transaction[];
  advances: AdvanceSettlement[];
  profile: MadrasaProfile;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectReceipt: (txn: Transaction) => void;
  onOpenQuickIncome: () => void;
  onOpenQuickExpense: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  advances,
  profile,
  setActiveTab,
  onSelectReceipt,
  onOpenQuickIncome,
  onOpenQuickExpense
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentYearMonth = todayStr.substring(0, 7);

  // Department Balances calculations
  const departmentStats = useMemo(() => {
    const stats: Record<
      DepartmentId,
      { income: number; expense: number; balance: number; count: number }
    > = {
      nurani: { income: 0, expense: 0, balance: 0, count: 0 },
      ebtedayi: { income: 0, expense: 0, balance: 0, count: 0 },
      hefzo: { income: 0, expense: 0, balance: 0, count: 0 },
      boarding: { income: 0, expense: 0, balance: 0, count: 0 },
      director: { income: 0, expense: 0, balance: 0, count: 0 }
    };

    transactions.forEach((txn) => {
      if (stats[txn.departmentId]) {
        stats[txn.departmentId].count += 1;
        if (txn.type === 'income') {
          stats[txn.departmentId].income += txn.amount;
          stats[txn.departmentId].balance += txn.amount;
        } else if (txn.type === 'expense') {
          stats[txn.departmentId].expense += txn.amount;
          stats[txn.departmentId].balance -= txn.amount;
        }
      }
    });

    return stats;
  }, [transactions]);

  // Overall totals
  const overallStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;
    let todayIncome = 0;
    let todayExpense = 0;

    transactions.forEach((txn) => {
      if (txn.type === 'income') {
        totalIncome += txn.amount;
        if (txn.date.startsWith(currentYearMonth)) {
          monthIncome += txn.amount;
        }
        if (txn.date === todayStr) {
          todayIncome += txn.amount;
        }
      } else if (txn.type === 'expense') {
        totalExpense += txn.amount;
        if (txn.date.startsWith(currentYearMonth)) {
          monthExpense += txn.amount;
        }
        if (txn.date === todayStr) {
          todayExpense += txn.amount;
        }
      }
    });

    const netGrandTotal = totalIncome - totalExpense;
    return {
      totalIncome,
      totalExpense,
      netGrandTotal,
      monthIncome,
      monthExpense,
      todayIncome,
      todayExpense
    };
  }, [transactions, currentYearMonth, todayStr]);

  // Chart data: Department balance donut
  const pieChartData = useMemo(() => {
    return (Object.keys(departmentStats) as DepartmentId[]).map((deptKey) => {
      const dept = DEPARTMENTS[deptKey];
      const stat = departmentStats[deptKey];
      return {
        name: dept.name,
        shortName: dept.shortName,
        value: Math.max(0, stat.balance),
        color: dept.color
      };
    });
  }, [departmentStats]);

  // Last 7 days trend
  const trendChartData = useMemo(() => {
    const days: { date: string; label: string; income: number; expense: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('bn-BD', { weekday: 'short' });
      days.push({
        date: dateStr,
        label: dayName,
        income: 0,
        expense: 0
      });
    }

    transactions.forEach((txn) => {
      const targetDay = days.find((day) => day.date === txn.date);
      if (targetDay) {
        if (txn.type === 'income') {
          targetDay.income += txn.amount;
        } else if (txn.type === 'expense') {
          targetDay.expense += txn.amount;
        }
      }
    });

    return days;
  }, [transactions]);

  // Recent 6 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 6);
  }, [transactions]);

  const getDeptIcon = (deptId: DepartmentId) => {
    switch (deptId) {
      case 'nurani':
        return <Baby className="w-5 h-5" />;
      case 'ebtedayi':
        return <BookOpen className="w-5 h-5" />;
      case 'hefzo':
        return <BookMarked className="w-5 h-5" />;
      case 'boarding':
        return <Utensils className="w-5 h-5" />;
      case 'director':
        return <Building2 className="w-5 h-5" />;
      default:
        return <Building className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcome & Institution Header Card */}
      <div className="bg-gradient-to-r from-purple-900/30 via-slate-900/50 to-teal-900/30 backdrop-blur-2xl text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/15 relative overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute right-0 top-0 bottom-0 opacity-5 flex items-center pr-6 pointer-events-none">
          <Building2 className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-0.5 rounded-full border border-emerald-400/30 backdrop-blur-xs">
                প্রাতিষ্ঠানিক ERP ড্যাশবোর্ড
              </span>
              <span className="text-white/50 text-xs font-medium">
                {profile.regNo}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {profile.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/60">
              {profile.address} • {profile.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenQuickIncome}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন আয় এন্ট্রি</span>
            </button>
            <button
              onClick={onOpenQuickExpense}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-rose-950/40 border border-rose-400/30 transition-transform active:scale-95"
            >
              <MinusCircle className="w-4 h-4" />
              <span>নতুন ব্যয় এন্ট্রি</span>
            </button>
            <button
              onClick={() => setActiveTab('adjustment')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 text-sm font-medium rounded-2xl transition-colors backdrop-blur-xs"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>অগ্রিম সমন্বয়</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fresh Start Clean Data Hint Banner (Only shows when transactions exist) */}
      {transactions.length > 0 && transactions.some((t) => t.id.startsWith('TXN-00')) && (
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-teal-950/70 border border-emerald-500/40 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl backdrop-blur-xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>মাদ্রাসার নিজস্ব বাস্তব হিসাব চালু করতে চান?</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  বর্তমানে ডেমো ডাটা চালু আছে
                </span>
              </h4>
              <p className="text-xs text-white/70 mt-0.5">
                পূর্বের পরীক্ষামূলক এন্ট্রিগুলো মুছে ০ ব্যালেন্স বা বর্তমান ক্যাশ টাকা দিয়ে নতুন খতিয়ান শুরু করুন।
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('settings')}
            className="shrink-0 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
          >
            <span>ক্লিন হিসাব শুরু করুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Top Summary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Grand Total Cash In Hand */}
        <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-emerald-500/30 shadow-xl shadow-black/20 hover:border-emerald-400/50 hover:bg-white/[0.07] transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-bl-full pointer-events-none -z-0 blur-lg" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80 block mb-1.5">
                সর্বমোট নগদ ক্যাশ (Cash In Hand)
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-300 tracking-tight">
                {formatTaka(overallStats.netGrandTotal)}
              </h3>
              <p className="text-xs text-white/60 font-medium mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400" />
                সকল বিভাগের সমন্বিত নিট তহবিল
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shadow-md">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* This Month's Income */}
        <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl shadow-black/20 hover:border-white/20 hover:bg-white/[0.07] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block mb-1.5">
                চলতি মাসের মোট জমা
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {formatTaka(overallStats.monthIncome)}
              </h3>
              <p className="text-xs text-emerald-300 font-medium mt-2 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                আজকের আদায়: {formatTaka(overallStats.todayIncome)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* This Month's Expense */}
        <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl shadow-black/20 hover:border-white/20 hover:bg-white/[0.07] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block mb-1.5">
                চলতি মাসের মোট ব্যয়
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {formatTaka(overallStats.monthExpense)}
              </h3>
              <p className="text-xs text-rose-300 font-medium mt-2 flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                আজকের খরচ: {formatTaka(overallStats.todayExpense)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Lifetime Income */}
        <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl shadow-black/20 hover:border-white/20 hover:bg-white/[0.07] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block mb-1.5">
                সর্বমোট কালেকশন
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {formatTaka(overallStats.totalIncome)}
              </h3>
              <p className="text-xs text-white/50 font-medium mt-2">
                মোট খরচ: {formatTaka(overallStats.totalExpense)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-300 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Department Specific Balances (5 Master Sections) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <span>বিভাগভিত্তিক ক্যাশ খতিয়ান ও ফান্ড ব্যালেন্স</span>
          </h2>
          <span className="text-xs font-medium text-white/50">
            ৫টি সক্রিয় প্রশাসনিক ও শিক্ষা বিভাগ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {(Object.keys(DEPARTMENTS) as DepartmentId[]).map((deptKey) => {
            const dept = DEPARTMENTS[deptKey];
            const stat = departmentStats[deptKey];
            return (
              <div
                key={deptKey}
                className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-4.5 border border-white/10 shadow-lg hover:bg-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs border border-white/15"
                      style={{ backgroundColor: `${dept.color}25`, color: dept.color }}
                    >
                      {getDeptIcon(deptKey)}
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-white/70">
                      {toBengaliNumber(stat.count)}টি এন্ট্রি
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white truncate">
                    {dept.name}
                  </h3>
                  <p className="text-[11px] text-white/50 line-clamp-1 mb-2">
                    {dept.description}
                  </p>

                  <div className="mt-2 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">
                      বর্তমান স্থিতি
                    </span>
                    <span
                      className="text-base sm:text-lg font-extrabold tracking-tight"
                      style={{ color: stat.balance >= 0 ? '#34d399' : '#fb7185' }}
                    >
                      {formatTaka(stat.balance)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-300 font-medium">
                    + {formatTaka(stat.income)}
                  </span>
                  <span className="text-rose-300 font-medium">
                    - {formatTaka(stat.expense)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Analytics Visualizations (Charts Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Weekly Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white/[0.05] backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-white">
                বিগত ৭ দিনের আয় ও ব্যয় তুলনা
              </h3>
              <p className="text-xs text-white/50">দৈনিক ক্যাশ ফ্লো পর্যালোচনা</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block shadow-xs" />
                মোট জমা (আয়)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-rose-300">
                <span className="w-3 h-3 rounded-md bg-rose-500 inline-block shadow-xs" />
                মোট খরচ (ব্যয়)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }}
                  tickFormatter={(val) => `৳${toBengaliNumber(val)}`}
                />
                <Tooltip
                  formatter={(val: number) => [formatTaka(val), 'পরিমাণ']}
                  labelFormatter={(label) => `বার: ${label}`}
                  contentStyle={{
                    backgroundColor: '#0c0d1e',
                    borderRadius: '16px',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="income" name="আয়" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="ব্যয়" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Fund Distribution Donut Chart */}
        <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-400" />
              <span>বিভাগীয় ব্যালেন্স অনুপাত</span>
            </h3>
            <p className="text-xs text-white/50">বিভাগভিত্তিক নগদ তহবিলের শেয়ার</p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [formatTaka(val), 'স্থিতি']}
                  contentStyle={{
                    backgroundColor: '#0c0d1e',
                    borderRadius: '16px',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {pieChartData.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-white/5">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: item.color }} />
                  <span className="text-white/80 truncate">{item.shortName}</span>
                </div>
                <span className="font-semibold text-white">{formatTaka(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Recent Transactions & Quick Ledger Table */}
      <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>সাম্প্রতিক লেনদেনসমূহ (Recent Cash Book Entries)</span>
            </h3>
            <p className="text-xs text-white/50">
              সর্বশেষ অন্তর্ভুক্ত লেনদেনের রসিদ ও ভাউচার
            </p>
          </div>

          <button
            onClick={() => setActiveTab('cashbook')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/25 px-3.5 py-2 rounded-xl border border-emerald-500/30 transition-colors self-start sm:self-auto backdrop-blur-xs"
          >
            <span>সম্পূর্ণ রেজিস্টার দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-white/[0.03] text-white/60 font-semibold border-b border-white/10">
              <tr>
                <th className="px-4 py-3.5">তারিখ ও রসিদ নং</th>
                <th className="px-4 py-3.5">ধরণ</th>
                <th className="px-4 py-3.5">বিভাগ</th>
                <th className="px-4 py-3.5">খাত ও বিবরণ</th>
                <th className="px-4 py-3.5">দাতা / গ্রহীতা</th>
                <th className="px-4 py-3.5 text-right">পরিমাণ (টাকা)</th>
                <th className="px-4 py-3.5 text-center">মানি রসিদ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-white/40">
                    কোন লেনদেন পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                recentTransactions.map((txn) => {
                  const dept = DEPARTMENTS[txn.departmentId];
                  const isIncome = txn.type === 'income';
                  return (
                    <tr key={txn.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-white">
                          {formatBengaliDate(txn.date)}
                        </div>
                        <div className="text-[11px] text-white/40 font-mono">
                          {txn.receiptNo || txn.voucherNo || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-xs ${
                            isIncome
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {isIncome ? '+ জমা / আয়' : '- খরচ / ব্যয়'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium border border-white/10"
                          style={{ backgroundColor: `${dept?.color}25`, color: dept?.color }}
                        >
                          {dept?.name || txn.departmentId}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white max-w-xs truncate">
                          {txn.category}
                        </div>
                        <div className="text-xs text-white/50 max-w-xs truncate">
                          {txn.description}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-white/70 whitespace-nowrap">
                        {txn.payerOrPayee || '-'}
                      </td>
                      <td
                        className={`px-4 py-3.5 text-right font-bold whitespace-nowrap ${
                          isIncome ? 'text-emerald-400 font-mono text-sm' : 'text-rose-400 font-mono text-sm'
                        }`}
                      >
                        {formatTaka(txn.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => onSelectReceipt(txn)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white/80 bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-400/40 border border-white/15 rounded-xl transition-colors backdrop-blur-xs"
                          title="মানি রসিদ বা ভাউচার মুদ্রণ করুন"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>রসিদ</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
