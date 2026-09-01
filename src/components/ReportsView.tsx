import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  Layers,
  Building,
  CheckCircle2,
  PieChart as PieIcon,
  Landmark,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Wallet
} from 'lucide-react';
import { DepartmentId, MadrasaProfile, Transaction } from '../types';
import {
  DEPARTMENTS,
  formatBengaliDate,
  formatTaka,
  toBengaliNumber
} from '../utils/formatters';

interface ReportsViewProps {
  transactions: Transaction[];
  profile: MadrasaProfile;
}

type ReportType =
  | 'monthly'
  | 'daily'
  | 'departmental'
  | 'zakat_donation'
  | 'annual';

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  profile
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = todayStr.substring(0, 7);

  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Filter transactions based on report type
  const reportData = useMemo(() => {
    let list = [...transactions];

    if (reportType === 'daily') {
      list = list.filter((t) => t.date === selectedDate);
    } else if (reportType === 'monthly') {
      list = list.filter((t) => t.date.startsWith(selectedMonth));
    } else if (reportType === 'departmental') {
      if (selectedDept !== 'all') {
        list = list.filter((t) => t.departmentId === selectedDept);
      }
    } else if (reportType === 'zakat_donation') {
      list = list.filter(
        (t) =>
          t.category.includes('যাকাত') ||
          t.category.includes('সদকা') ||
          t.category.includes('অনুদান') ||
          t.category.includes('লিল্লাহ') ||
          t.category.includes('চামড়া')
      );
    }

    // Sort by date ascending
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown: Record<
      string,
      { type: 'income' | 'expense'; amount: number; count: number }
    > = {};

    const deptBreakdown: Record<
      DepartmentId,
      { income: number; expense: number; balance: number }
    > = {
      nurani: { income: 0, expense: 0, balance: 0 },
      ebtedayi: { income: 0, expense: 0, balance: 0 },
      hefzo: { income: 0, expense: 0, balance: 0 },
      boarding: { income: 0, expense: 0, balance: 0 },
      director: { income: 0, expense: 0, balance: 0 }
    };

    list.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
        if (deptBreakdown[t.departmentId]) {
          deptBreakdown[t.departmentId].income += t.amount;
          deptBreakdown[t.departmentId].balance += t.amount;
        }
      } else if (t.type === 'expense') {
        totalExpense += t.amount;
        if (deptBreakdown[t.departmentId]) {
          deptBreakdown[t.departmentId].expense += t.amount;
          deptBreakdown[t.departmentId].balance -= t.amount;
        }
      }

      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = {
          type: t.type === 'income' ? 'income' : 'expense',
          amount: 0,
          count: 0
        };
      }
      categoryBreakdown[t.category].amount += t.amount;
      categoryBreakdown[t.category].count += 1;
    });

    return {
      list,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      categoryBreakdown,
      deptBreakdown
    };
  }, [
    transactions,
    reportType,
    selectedMonth,
    selectedDate,
    selectedDept
  ]);

  const getReportTitle = () => {
    switch (reportType) {
      case 'monthly':
        return `মাসিক পূর্ণাঙ্গ আয়-ব্যয় অডিট বিবরণী (${formatBengaliDate(selectedMonth + '-01')})`;
      case 'daily':
        return `দৈনিক ক্যাশ শিট ও হিসাব বিবরণী (${formatBengaliDate(selectedDate)})`;
      case 'departmental':
        return selectedDept === 'all'
          ? 'সকল বিভাগের সমন্বিত তুলনামূলক অডিট রিপোর্ট'
          : `${DEPARTMENTS[selectedDept as DepartmentId]?.name} এর বিশেষ অডিট রিপোর্ট`;
      case 'zakat_donation':
        return 'যাকাত, সদকা, চামড়া ও সাধারণ অনুদান তহবিল অডিট খতিয়ান';
      case 'annual':
        return `বার্ষিক পূর্ণাঙ্গ নিরীক্ষা ও আর্থিক বিবরণী`;
      default:
        return 'আর্থিক অডিট রিপোর্ট';
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel (Hidden during Print) */}
      <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>আর্থিক অডিট ও অফিশিয়াল রিপোর্ট জেনারেটর</span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              মুহতামিম, সভাপতি ও সাধারণ সভার নিরীক্ষার জন্য প্রিন্ট-উপযোগী রিপোর্ট
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>অফিশিয়াল রিপোর্ট প্রিন্ট / PDF</span>
          </button>
        </div>

        {/* Report Types Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'monthly', label: 'মাসিক অডিট শিট' },
            { id: 'daily', label: 'দৈনিক ক্যাশ বিবরণী' },
            { id: 'departmental', label: 'বিভাগভিত্তিক রিপোর্ট' },
            { id: 'zakat_donation', label: 'যাকাত ও অনুদান ফান্ড' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setReportType(item.id as ReportType)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                reportType === item.id
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 shadow-xs backdrop-blur-xs'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dynamic Filters depending on report type */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/10">
          {reportType === 'monthly' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-white/70">
                মাস নির্বাচন:
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2 focus:border-emerald-400 focus:outline-hidden"
              />
            </div>
          )}

          {reportType === 'daily' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-white/70">
                তারিখ নির্বাচন:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2 focus:border-emerald-400 focus:outline-hidden"
              />
            </div>
          )}

          {reportType === 'departmental' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-white/70">বিভাগ:</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2 focus:border-emerald-400 focus:outline-hidden"
              >
                <option value="all" className="bg-slate-900 text-white">-- সকল বিভাগ সমন্বিত --</option>
                {(Object.keys(DEPARTMENTS) as DepartmentId[]).map((k) => (
                  <option key={k} value={k} className="bg-slate-900 text-white">
                    {DEPARTMENTS[k].name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Official Printable Report Document */}
      <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl text-white print:bg-white print:text-black print:rounded-none print:border-none print:shadow-none print:p-0">
        {/* Letterhead Header */}
        <div className="text-center pb-6 mb-6 border-b-2 border-white/20 print:border-black">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold text-xl print:bg-emerald-800 print:text-white print:border print:border-black">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight print:text-black">
                {profile.name}
              </h1>
              <p className="text-xs text-white/60 font-medium print:text-slate-600">{profile.tagline}</p>
            </div>
          </div>

          <p className="text-xs text-white/70 print:text-slate-600">
            ঠিকানা: {profile.address} • ফোন: {profile.phone} • রেজিঃ {profile.regNo}
          </p>

          <div className="mt-4 inline-block px-4 py-1.5 bg-white/10 text-white rounded-xl font-bold text-sm sm:text-base border border-white/15 backdrop-blur-xs print:bg-slate-100 print:text-black print:border-slate-300">
            {getReportTitle()}
          </div>
          <p className="text-[11px] text-white/40 mt-1 print:text-slate-500">
            রিপোর্ট তৈরির তারিখ ও সময়: {formatBengaliDate(todayStr)}
          </p>
        </div>

        {/* 3 Main Stat Boxes */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div className="p-4 bg-emerald-500/10 backdrop-blur-xl rounded-2xl border border-emerald-500/30 print:bg-transparent print:border-black">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1 print:text-black">
              মোট জমা / প্রাপ্তি
            </span>
            <span className="text-lg sm:text-2xl font-extrabold text-emerald-300 font-mono print:text-black">
              {formatTaka(reportData.totalIncome)}
            </span>
          </div>

          <div className="p-4 bg-rose-500/10 backdrop-blur-xl rounded-2xl border border-rose-500/30 print:bg-transparent print:border-black">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block mb-1 print:text-black">
              মোট খরচ / ব্যয়
            </span>
            <span className="text-lg sm:text-2xl font-extrabold text-rose-300 font-mono print:text-black">
              {formatTaka(reportData.totalExpense)}
            </span>
          </div>

          <div className="p-4 bg-amber-500/10 backdrop-blur-xl rounded-2xl border border-amber-500/30 print:bg-transparent print:border-black">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1 print:text-black">
              নিট স্থিতি (উদ্বৃত্ত)
            </span>
            <span className="text-lg sm:text-2xl font-extrabold text-white font-mono print:text-black">
              {formatTaka(reportData.netBalance)}
            </span>
          </div>
        </div>

        {/* Department Breakdown Table */}
        <div className="mb-6">
          <h4 className="font-bold text-xs sm:text-sm text-white mb-2.5 border-b border-white/10 pb-1.5 print:text-black print:border-slate-300">
            ১. বিভাগভিত্তিক প্রাপ্তি ও পরিশোধের সারসংক্ষেপ
          </h4>
          <table className="w-full text-xs sm:text-sm border border-white/10 print:border-slate-300">
            <thead className="bg-white/[0.04] text-white/80 font-bold border-b border-white/10 print:bg-slate-200 print:text-black print:border-slate-300">
              <tr>
                <th className="p-2.5 border border-white/10 text-left print:border-slate-300">ক্রমিক</th>
                <th className="p-2.5 border border-white/10 text-left print:border-slate-300">বিভাগের নাম</th>
                <th className="p-2.5 border border-white/10 text-right print:border-slate-300">মোট জমা (৳)</th>
                <th className="p-2.5 border border-white/10 text-right print:border-slate-300">মোট খরচ (৳)</th>
                <th className="p-2.5 border border-white/10 text-right print:border-slate-300">বর্তমান ব্যালেন্স (৳)</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(DEPARTMENTS) as DepartmentId[]).map((deptKey, idx) => {
                const dept = DEPARTMENTS[deptKey];
                const stat = reportData.deptBreakdown[deptKey];
                return (
                  <tr key={deptKey} className="hover:bg-white/[0.04] print:hover:bg-transparent">
                    <td className="p-2.5 border border-white/10 text-center print:border-slate-300">{toBengaliNumber(idx + 1)}</td>
                    <td className="p-2.5 border border-white/10 font-semibold print:border-slate-300">{dept.name}</td>
                    <td className="p-2.5 border border-white/10 text-right font-bold text-emerald-400 font-mono print:text-black print:border-slate-300">
                      {formatTaka(stat.income)}
                    </td>
                    <td className="p-2.5 border border-white/10 text-right font-bold text-rose-400 font-mono print:text-black print:border-slate-300">
                      {formatTaka(stat.expense)}
                    </td>
                    <td className="p-2.5 border border-white/10 text-right font-extrabold text-white font-mono print:text-black print:border-slate-300">
                      {formatTaka(stat.balance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detailed Itemized Transactions Table */}
        <div className="mb-8">
          <h4 className="font-bold text-xs sm:text-sm text-white mb-2.5 border-b border-white/10 pb-1.5 print:text-black print:border-slate-300">
            ২. লেনদেনের বিস্তারিত খতিয়ান তালিকা ({toBengaliNumber(reportData.list.length)}টি এন্ট্রি)
          </h4>
          <table className="w-full text-xs border border-white/10 print:border-slate-300">
            <thead className="bg-white/[0.04] text-white/80 font-bold border-b border-white/10 print:bg-slate-200 print:text-black print:border-slate-300">
              <tr>
                <th className="p-2.5 border border-white/10 text-left print:border-slate-300">তারিখ</th>
                <th className="p-2.5 border border-white/10 text-left print:border-slate-300">রসিদ/ভাউচার</th>
                <th className="p-2.5 border border-white/10 text-left print:border-slate-300">বিভাগ</th>
                <th className="p-2.5 border border-white/10 text-left print:border-slate-300">খাত ও বিবরণ</th>
                <th className="p-2.5 border border-white/10 text-left print:border-slate-300">দাতা / গ্রহীতা</th>
                <th className="p-2.5 border border-white/10 text-right print:border-slate-300">জমা (৳)</th>
                <th className="p-2.5 border border-white/10 text-right print:border-slate-300">খরচ (৳)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-5 text-center text-white/40 print:text-slate-400">
                    উক্ত সময়ে কোনো লেনদেনের রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                reportData.list.map((t) => {
                  const dept = DEPARTMENTS[t.departmentId];
                  const isIncome = t.type === 'income';
                  return (
                    <tr key={t.id} className="hover:bg-white/[0.04] print:hover:bg-transparent">
                      <td className="p-2.5 border border-white/10 whitespace-nowrap print:border-slate-300">{t.date}</td>
                      <td className="p-2.5 border border-white/10 font-mono font-bold text-amber-300/90 print:text-black print:border-slate-300">
                        {t.receiptNo || t.voucherNo || '-'}
                      </td>
                      <td className="p-2.5 border border-white/10 font-medium print:border-slate-300">{dept?.shortName}</td>
                      <td className="p-2.5 border border-white/10 print:border-slate-300">
                        <div className="font-semibold text-white print:text-black">{t.category}</div>
                        <div className="text-[11px] text-white/50 print:text-slate-500">{t.description}</div>
                      </td>
                      <td className="p-2.5 border border-white/10 print:border-slate-300">{t.payerOrPayee || '-'}</td>
                      <td className="p-2.5 border border-white/10 text-right font-bold text-emerald-400 font-mono print:text-black print:border-slate-300">
                        {isIncome ? formatTaka(t.amount) : '-'}
                      </td>
                      <td className="p-2.5 border border-white/10 text-right font-bold text-rose-400 font-mono print:text-black print:border-slate-300">
                        {!isIncome ? formatTaka(t.amount) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-white/[0.06] font-extrabold border-t border-white/10 print:bg-slate-200 print:text-black print:border-slate-300">
              <tr>
                <td colSpan={5} className="p-2.5 border border-white/10 text-right print:border-slate-300">
                  সর্বমোট:
                </td>
                <td className="p-2.5 border border-white/10 text-right text-emerald-400 font-mono print:text-black print:border-slate-300">
                  {formatTaka(reportData.totalIncome)}
                </td>
                <td className="p-2.5 border border-white/10 text-right text-rose-400 font-mono print:text-black print:border-slate-300">
                  {formatTaka(reportData.totalExpense)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Official Signatures Row */}
        <div className="grid grid-cols-3 gap-8 pt-16 text-center text-xs font-bold text-white/90 print:text-black">
          <div>
            <div className="border-t border-white/30 pt-2 print:border-slate-600">
              হিসাবরক্ষক / নাজের স্বাক্ষর
            </div>
          </div>
          <div>
            <div className="border-t border-white/30 pt-2 print:border-slate-600">
              নিরীক্ষক / অডিট অফিসার
            </div>
          </div>
          <div>
            <div className="border-t border-white/30 pt-2 print:border-slate-600">
              মুহতামিম / সভাপতি মহোদয়
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
