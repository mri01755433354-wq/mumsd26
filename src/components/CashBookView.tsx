import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Printer,
  Trash2,
  Calendar,
  Layers,
  FileSpreadsheet,
  ArrowUpDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DepartmentId, Transaction, User } from '../types';
import {
  DEPARTMENTS,
  formatBengaliDate,
  formatTaka,
  toBengaliNumber
} from '../utils/formatters';

interface CashBookViewProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onSelectReceipt: (txn: Transaction) => void;
  currentUser: User | null;
}

export const CashBookView: React.FC<CashBookViewProps> = ({
  transactions,
  onDeleteTransaction,
  onSelectReceipt,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filtered and Sorted
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Date match
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;

        // Dept match
        if (selectedDept !== 'all' && t.departmentId !== selectedDept) return false;

        // Type match
        if (selectedType !== 'all' && t.type !== selectedType) return false;

        // Search match
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchReceipt = t.receiptNo?.toLowerCase().includes(term);
          const matchVoucher = t.voucherNo?.toLowerCase().includes(term);
          const matchPayer = t.payerOrPayee?.toLowerCase().includes(term);
          const matchCat = t.category?.toLowerCase().includes(term);
          const matchDesc = t.description?.toLowerCase().includes(term);
          return matchReceipt || matchVoucher || matchPayer || matchCat || matchDesc;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [
    transactions,
    startDate,
    endDate,
    selectedDept,
    selectedType,
    searchTerm,
    sortOrder
  ]);

  // Filtered Totals
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') expense += t.amount;
    });
    return {
      income,
      expense,
      balance: income - expense,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  // CSV Export function
  const handleExportCSV = () => {
    const headers = [
      'তারিখ',
      'রসিদ/ভাউচার নং',
      'লেনদেনের ধরণ',
      'বিভাগ',
      'খাত',
      'বিবরণ',
      'দাতা/গ্রহীতা',
      'পেমেন্ট মাধ্যম',
      'জমা (টাকা)',
      'খরচ (টাকা)',
      'এন্ট্রি কারক'
    ];

    const rows = filteredTransactions.map((t) => {
      const dept = DEPARTMENTS[t.departmentId]?.name || t.departmentId;
      const isIncome = t.type === 'income';
      return [
        t.date,
        t.receiptNo || t.voucherNo || '-',
        isIncome ? 'জমা' : 'খরচ',
        dept,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${(t.payerOrPayee || '').replace(/"/g, '""')}"`,
        t.paymentMethod || 'নগদ',
        isIncome ? t.amount : 0,
        !isIncome ? t.amount : 0,
        t.entryBy || 'admin'
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `madrasa_cashbook_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string, refNo: string) => {
    if (
      window.confirm(
        `সতর্কতা: আপনি কি নিশ্চিতভাবে এই লেনদেনটি (${refNo}) মুছে ফেলতে চান? এটি ক্যাশ খতিয়ান হতে বাদ যাবে।`
      )
    ) {
      onDeleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter & Action Panel */}
      <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>কেন্দ্রীয় ক্যাশ বহি ও লেনদেন রেজিস্টার</span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              মাদ্রাসার সমস্ত আর্থিক প্রাপ্তি ও প্রদানের সমন্বিত হিসাব খতিয়ান
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 transition-all shadow-xs backdrop-blur-xs active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>এক্সেল / CSV ডাউনলোড</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white/90 text-xs font-bold rounded-xl border border-white/15 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-white/70" />
              <span>প্রিন্ট ভিউ</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <label className="block text-[11px] font-semibold text-white/60 mb-1.5">
              সার্চ ফিল্টার
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="রসিদ নং, ভাউচার, দাতার নাম বা বিবরণ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 rounded-xl py-2 pl-10 pr-3 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-white/60 mb-1.5">
              বিভাগ নির্বাচন
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2 focus:border-emerald-400 focus:outline-hidden"
            >
              <option value="all" className="bg-slate-900 text-white">-- সকল বিভাগ --</option>
              {(Object.keys(DEPARTMENTS) as DepartmentId[]).map((k) => (
                <option key={k} value={k} className="bg-slate-900 text-white">
                  {DEPARTMENTS[k].name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-white/60 mb-1.5">
              তারিখ হতে
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2 focus:border-emerald-400 focus:outline-hidden"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-white/60 mb-1.5">
              তারিখ পর্যন্ত
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2 focus:border-emerald-400 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Quick Type Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 font-medium">ধরণ:</span>
            {[
              { id: 'all', label: 'সকল লেনদেন' },
              { id: 'income', label: '+ শুধুমাত্র জমা' },
              { id: 'expense', label: '- শুধুমাত্র ব্যয়' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  selectedType === tab.id
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 shadow-xs backdrop-blur-xs'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/70 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 px-3 py-1.5 rounded-xl transition-all"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>তারিখ সাজান ({sortOrder === 'desc' ? 'নতুন আগে' : 'পুরোনো আগে'})</span>
          </button>
        </div>
      </div>

      {/* Filtered Dynamic Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white/[0.05] backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-center shadow-lg">
          <span className="text-[11px] font-semibold text-white/50 block mb-1">
            ফিল্টারকৃত রেকর্ড
          </span>
          <span className="text-lg font-bold text-white">
            {toBengaliNumber(totals.count)} টি
          </span>
        </div>

        <div className="bg-emerald-500/10 backdrop-blur-xl p-4 rounded-2xl border border-emerald-500/30 text-center shadow-lg">
          <span className="text-[11px] font-semibold text-emerald-400 block mb-1">
            মোট জমা (Income)
          </span>
          <span className="text-lg font-bold text-emerald-300 font-mono">
            {formatTaka(totals.income)}
          </span>
        </div>

        <div className="bg-rose-500/10 backdrop-blur-xl p-4 rounded-2xl border border-rose-500/30 text-center shadow-lg">
          <span className="text-[11px] font-semibold text-rose-400 block mb-1">
            মোট খরচ (Expense)
          </span>
          <span className="text-lg font-bold text-rose-300 font-mono">
            {formatTaka(totals.expense)}
          </span>
        </div>

        <div className="bg-amber-500/10 backdrop-blur-xl p-4 rounded-2xl border border-amber-500/30 text-center shadow-lg">
          <span className="text-[11px] font-semibold text-amber-400 block mb-1">
            নিট স্থিতি (Net Balance)
          </span>
          <span
            className={`text-lg font-extrabold font-mono ${
              totals.balance >= 0 ? 'text-emerald-300' : 'text-rose-300'
            }`}
          >
            {formatTaka(totals.balance)}
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-white/[0.03] text-white/70 font-semibold border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">তারিখ</th>
                <th className="px-5 py-3.5">রসিদ / ভাউচার নং</th>
                <th className="px-5 py-3.5">ধরণ</th>
                <th className="px-5 py-3.5">বিভাগ</th>
                <th className="px-5 py-3.5">খাত ও বিবরণ</th>
                <th className="px-5 py-3.5">দাতা / গ্রহীতা</th>
                <th className="px-5 py-3.5 text-right">জমা (৳)</th>
                <th className="px-5 py-3.5 text-right">খরচ (৳)</th>
                <th className="px-5 py-3.5 text-center no-print">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-white/40">
                    উক্ত ফিল্টারে কোনো লেনদেন পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const dept = DEPARTMENTS[txn.departmentId];
                  const isIncome = txn.type === 'income';
                  const refNo = txn.receiptNo || txn.voucherNo || '-';

                  return (
                    <tr key={txn.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-white/80 font-medium">
                        {formatBengaliDate(txn.date)}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap font-mono font-semibold text-amber-300/90">
                        {refNo}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold backdrop-blur-xs border ${
                            isIncome
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {isIncome ? '+ জমা' : '- খরচ'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border backdrop-blur-xs"
                          style={{
                            backgroundColor: `${dept?.color}20`,
                            borderColor: `${dept?.color}40`,
                            color: '#ffffff'
                          }}
                        >
                          {dept?.shortName || txn.departmentId}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="font-semibold text-white truncate">
                          {txn.category}
                        </div>
                        <div className="text-xs text-white/50 truncate">
                          {txn.description}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-white/80 whitespace-nowrap">
                        {txn.payerOrPayee || '-'}
                      </td>

                      <td className="px-5 py-3.5 text-right font-bold text-emerald-400 whitespace-nowrap font-mono">
                        {isIncome ? formatTaka(txn.amount) : '-'}
                      </td>

                      <td className="px-5 py-3.5 text-right font-bold text-rose-400 whitespace-nowrap font-mono">
                        {!isIncome ? formatTaka(txn.amount) : '-'}
                      </td>

                      <td className="px-5 py-3.5 text-center whitespace-nowrap no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectReceipt(txn)}
                            title="রসিদ বা ভাউচার মুদ্রণ করুন"
                            className="p-1.5 text-white/50 hover:text-emerald-400 hover:bg-emerald-500/15 rounded-xl border border-transparent hover:border-emerald-500/30 transition-all"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(txn.id, refNo)}
                            title="মুছে ফেলুন"
                            className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/15 rounded-xl border border-transparent hover:border-rose-500/30 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
