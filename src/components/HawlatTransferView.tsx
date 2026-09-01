import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Building,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Clock,
  Printer,
  FileCheck,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import {
  DepartmentId,
  HawlatLoan,
  MadrasaProfile,
  Transaction,
  User
} from '../types';
import {
  DEPARTMENTS,
  formatBengaliDate,
  formatTaka,
  generateVoucherNo,
  toBengaliNumber
} from '../utils/formatters';

interface HawlatTransferViewProps {
  transactions: Transaction[];
  hawlatLoans: HawlatLoan[];
  onAddHawlatLoan: (loan: HawlatLoan, transferTxn?: Transaction) => void;
  onRepayHawlatLoan: (
    loanId: string,
    repayAmount: number,
    repayTxn?: Transaction
  ) => void;
  profile: MadrasaProfile;
  currentUser: User | null;
}

export const HawlatTransferView: React.FC<HawlatTransferViewProps> = ({
  transactions,
  hawlatLoans,
  onAddHawlatLoan,
  onRepayHawlatLoan,
  profile,
  currentUser
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [fromDept, setFromDept] = useState<DepartmentId>('director');
  const [toDept, setToDept] = useState<DepartmentId>('boarding');
  const [amount, setAmount] = useState<string>('');
  const [purpose, setPurpose] = useState('');
  const [voucherNo, setVoucherNo] = useState(generateVoucherNo());
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Repay Modal state
  const [selectedLoanForRepay, setSelectedLoanForRepay] =
    useState<HawlatLoan | null>(null);
  const [repayAmountInput, setRepayAmountInput] = useState<string>('');

  // Department Balance calculation
  const deptStats = useMemo(() => {
    const stats: Record<
      DepartmentId,
      {
        income: number;
        expense: number;
        hawlatInflow: number; // money borrowed into this dept
        hawlatOutflow: number; // money lent out from this dept
        hawlatRepaidOut: number; // returned money back to lender
        hawlatRepaidIn: number; // received back from borrower
        netBalance: number;
        activeBorrowedDue: number; // still owe to others
        activeLentDue: number; // others owe to this dept
      }
    > = {
      nurani: {
        income: 0,
        expense: 0,
        hawlatInflow: 0,
        hawlatOutflow: 0,
        hawlatRepaidOut: 0,
        hawlatRepaidIn: 0,
        netBalance: 0,
        activeBorrowedDue: 0,
        activeLentDue: 0
      },
      ebtedayi: {
        income: 0,
        expense: 0,
        hawlatInflow: 0,
        hawlatOutflow: 0,
        hawlatRepaidOut: 0,
        hawlatRepaidIn: 0,
        netBalance: 0,
        activeBorrowedDue: 0,
        activeLentDue: 0
      },
      hefzo: {
        income: 0,
        expense: 0,
        hawlatInflow: 0,
        hawlatOutflow: 0,
        hawlatRepaidOut: 0,
        hawlatRepaidIn: 0,
        netBalance: 0,
        activeBorrowedDue: 0,
        activeLentDue: 0
      },
      boarding: {
        income: 0,
        expense: 0,
        hawlatInflow: 0,
        hawlatOutflow: 0,
        hawlatRepaidOut: 0,
        hawlatRepaidIn: 0,
        netBalance: 0,
        activeBorrowedDue: 0,
        activeLentDue: 0
      },
      director: {
        income: 0,
        expense: 0,
        hawlatInflow: 0,
        hawlatOutflow: 0,
        hawlatRepaidOut: 0,
        hawlatRepaidIn: 0,
        netBalance: 0,
        activeBorrowedDue: 0,
        activeLentDue: 0
      }
    };

    // Calculate direct transactions
    transactions.forEach((t) => {
      if (t.type === 'income') {
        if (deptStats[t.departmentId]) {
          deptStats[t.departmentId].income += t.amount;
        }
      } else if (t.type === 'expense') {
        if (deptStats[t.departmentId]) {
          deptStats[t.departmentId].expense += t.amount;
        }
      }
    });

    // Calculate Hawlat loans & repayments
    hawlatLoans.forEach((loan) => {
      const remainingDue = loan.amount - loan.repaidAmount;

      if (deptStats[loan.fromDepartmentId]) {
        deptStats[loan.fromDepartmentId].hawlatOutflow += loan.amount;
        deptStats[loan.fromDepartmentId].hawlatRepaidIn += loan.repaidAmount;
        if (remainingDue > 0) {
          deptStats[loan.fromDepartmentId].activeLentDue += remainingDue;
        }
      }

      if (deptStats[loan.toDepartmentId]) {
        deptStats[loan.toDepartmentId].hawlatInflow += loan.amount;
        deptStats[loan.toDepartmentId].hawlatRepaidOut += loan.repaidAmount;
        if (remainingDue > 0) {
          deptStats[loan.toDepartmentId].activeBorrowedDue += remainingDue;
        }
      }
    });

    // Compute Net available liquid balance for each department
    (Object.keys(DEPARTMENTS) as DepartmentId[]).forEach((deptId) => {
      const d = deptStats[deptId];
      d.netBalance =
        d.income -
        d.expense +
        d.hawlatInflow -
        d.hawlatOutflow -
        d.hawlatRepaidOut +
        d.hawlatRepaidIn;
    });

    return stats;
  }, [transactions, hawlatLoans]);

  const activeHawlatList = useMemo(() => {
    return hawlatLoans.filter(
      (l) => l.status === 'active' || l.status === 'partial'
    );
  }, [hawlatLoans]);

  const settledHawlatList = useMemo(() => {
    return hawlatLoans.filter((l) => l.status === 'repaid');
  }, [hawlatLoans]);

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromDept === toDept) {
      alert('অনুগ্রহ করে দুটি ভিন্ন বিভাগ নির্বাচন করুন।');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('সঠিক টাকার পরিমাণ লিখুন।');
      return;
    }

    const fromDeptBalance = deptStats[fromDept]?.netBalance || 0;
    if (numAmount > fromDeptBalance) {
      const confirmTransfer = window.confirm(
        `সতর্কবার্তা: ${DEPARTMENTS[fromDept]?.name} এ বর্তমান উদ্বৃত্ত (${formatTaka(fromDeptBalance)}) এর চেয়ে বেশি টাকা (${formatTaka(numAmount)}) স্থানান্তর করা হচ্ছে। আপনি কি নিশ্চিত?`
      );
      if (!confirmTransfer) return;
    }

    const newLoan: HawlatLoan = {
      id: `HWL-${Date.now()}`,
      voucherNo: voucherNo || generateVoucherNo(),
      date,
      fromDepartmentId: fromDept,
      toDepartmentId: toDept,
      amount: numAmount,
      repaidAmount: 0,
      purpose:
        purpose ||
        `${DEPARTMENTS[toDept]?.name} এর জরুরি প্রয়োজনে ${DEPARTMENTS[fromDept]?.name} হতে হাওলাত গ্রহণ`,
      status: 'active',
      createdAt: Date.now()
    };

    onAddHawlatLoan(newLoan);
    setShowSuccessModal(true);

    // Reset Form
    setAmount('');
    setPurpose('');
    setVoucherNo(generateVoucherNo());

    setTimeout(() => {
      setShowSuccessModal(false);
    }, 5000);
  };

  const handleOpenRepayModal = (loan: HawlatLoan) => {
    setSelectedLoanForRepay(loan);
    const due = loan.amount - loan.repaidAmount;
    setRepayAmountInput(due.toString());
  };

  const handleConfirmRepay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForRepay) return;

    const repayNum = parseFloat(repayAmountInput);
    const maxDue =
      selectedLoanForRepay.amount - selectedLoanForRepay.repaidAmount;

    if (isNaN(repayNum) || repayNum <= 0) {
      alert('সঠিক পরিশোধের পরিমাণ লিখুন।');
      return;
    }

    if (repayNum > maxDue) {
      alert(`সর্বোচ্চ বকেয়া হাওলাত ${formatTaka(maxDue)} পর্যন্ত পরিশোধ করা যাবে।`);
      return;
    }

    onRepayHawlatLoan(selectedLoanForRepay.id, repayNum);
    setSelectedLoanForRepay(null);
    alert('হাওলাত সফলভাবে ফেরত/পরিশোধ করা হয়েছে!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950/70 via-slate-900/90 to-emerald-950/70 backdrop-blur-xl rounded-3xl p-6 border border-teal-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center flex-shrink-0 shadow-lg">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-[11px] font-bold mb-1">
                <Sparkles className="w-3 h-3" />
                <span>স্মার্ট আন্তঃবিভাগীয় ফান্ড ব্যবস্থাপনা</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                আন্তঃবিভাগীয় ফান্ড ট্রান্সফার ও হাওলাত রেজিস্টার
              </h3>
              <p className="text-xs text-white/70 mt-0.5 max-w-2xl">
                কোনো বিভাগে ফান্ডের ঘাটতি থাকলে অন্য বিভাগ থেকে স্বয়ংক্রিয়ভাবে হাওলাত গ্রহণ, স্বচ্ছ হিসাব সংরক্ষণ এবং পরবর্তীতে আয় আসলে ফেরত প্রদান করুন।
              </p>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="bg-emerald-950/80 backdrop-blur-2xl text-white p-4 rounded-3xl border border-emerald-500/40 flex items-center gap-3 shadow-2xl animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">
            আন্তঃবিভাগীয় ফান্ড স্থানান্তর ও হাওলাত এন্ট্রি সফল হয়েছে!
          </div>
        </div>
      )}

      {/* 1. Live Departmental Liquid Balance Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-400" />
            <span>সকল বিভাগের রিয়েল-টাইম ফান্ড ও তারল্য স্থিতি</span>
          </h4>
          <span className="text-xs text-white/50">৫টি পৃথক বিভাগীয় ফান্ড</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {(Object.keys(DEPARTMENTS) as DepartmentId[]).map((deptId) => {
            const dept = DEPARTMENTS[deptId];
            const stats = deptStats[deptId];
            const isNegative = stats.netBalance < 0;

            return (
              <div
                key={deptId}
                className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-lg hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2 py-0.5 rounded-md text-[11px] font-bold text-white"
                      style={{ backgroundColor: dept.color }}
                    >
                      {dept.shortName}
                    </span>
                    {stats.activeBorrowedDue > 0 && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded-full font-semibold">
                        দেনা: ৳{toBengaliNumber(stats.activeBorrowedDue)}
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-white/90 truncate mb-1">
                    {dept.name}
                  </h5>

                  <div className="mt-2">
                    <span className="text-[10px] uppercase text-white/50 block">
                      বর্তমান নিট ব্যালেন্স
                    </span>
                    <div
                      className={`text-lg font-extrabold font-mono ${
                        isNegative ? 'text-rose-400' : 'text-emerald-300'
                      }`}
                    >
                      {formatTaka(stats.netBalance)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] text-white/60 space-y-1">
                  <div className="flex justify-between">
                    <span>নিজস্ব আয়:</span>
                    <span className="font-mono text-white/80">
                      {formatTaka(stats.income)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>নিজস্ব ব্যয়:</span>
                    <span className="font-mono text-white/80">
                      {formatTaka(stats.expense)}
                    </span>
                  </div>
                  {stats.activeLentDue > 0 && (
                    <div className="flex justify-between text-teal-300 font-semibold">
                      <span>অন্য থেকে পাওনা:</span>
                      <span className="font-mono">
                        {formatTaka(stats.activeLentDue)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: New Hawlat / Transfer (5 cols) */}
        <div className="lg:col-span-5 bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
          <div className="p-5 bg-white/[0.03] border-b border-white/10 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-500/20 border border-teal-400/30 rounded-xl">
                <ArrowRightLeft className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">
                  নতুন ফান্ড ট্রান্সফার / হাওলাত এন্ট্রি
                </h4>
                <p className="text-[11px] text-white/50">
                  বিভাগ হতে বিভাগে টাকা স্থানান্তর
                </p>
              </div>
            </div>
            <span className="font-mono font-bold text-xs bg-black/40 border border-white/10 px-2 py-0.5 rounded-lg text-teal-300">
              {voucherNo}
            </span>
          </div>

          <form onSubmit={handleCreateTransfer} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                তারিখ <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-teal-400 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  হাওলাত প্রদানকারী ফান্ড <span className="text-rose-400">*</span>
                </label>
                <select
                  value={fromDept}
                  onChange={(e) => setFromDept(e.target.value as DepartmentId)}
                  className="w-full text-xs bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-teal-400 focus:outline-hidden"
                >
                  {(Object.keys(DEPARTMENTS) as DepartmentId[]).map((key) => (
                    <option key={key} value={key}>
                      {DEPARTMENTS[key].name} (ব্যালেন্স:{' '}
                      {formatTaka(deptStats[key]?.netBalance || 0)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  হাওলাত গ্রহণকারী ফান্ড <span className="text-rose-400">*</span>
                </label>
                <select
                  value={toDept}
                  onChange={(e) => setToDept(e.target.value as DepartmentId)}
                  className="w-full text-xs bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-teal-400 focus:outline-hidden"
                >
                  {(Object.keys(DEPARTMENTS) as DepartmentId[]).map((key) => (
                    <option key={key} value={key}>
                      {DEPARTMENTS[key].name} (ব্যালেন্স:{' '}
                      {formatTaka(deptStats[key]?.netBalance || 0)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-teal-500/10 p-3.5 rounded-2xl border border-teal-500/30">
              <label className="block text-xs font-bold text-teal-300 mb-1.5 flex items-center justify-between">
                <span>স্থানান্তরের টাকার পরিমাণ <span className="text-rose-400">*</span></span>
                <span className="text-xs text-teal-300 font-semibold font-mono">
                  {amount ? formatTaka(parseFloat(amount) || 0) : '৳ ০.০০'}
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-teal-400">
                  ৳
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-base font-bold text-white bg-white/[0.08] border border-teal-400/40 rounded-xl py-2 pl-8 pr-3 focus:border-teal-300 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                হাওলাত গ্রহণের উদ্দেশ্য / কারণ
              </label>
              <textarea
                rows={2}
                placeholder="যেমন: বোর্ডিংয়ের বাজার খরচের জন্য পরিচালক তহবিল হতে সাময়িক ধার গ্রহণ"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full text-xs bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 rounded-xl p-2.5 focus:border-teal-400 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-950/40 border border-teal-400/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ফান্ড ট্রান্সফার ও হাওলাত সংরক্ষণ করুন</span>
            </button>
          </form>
        </div>

        {/* Right Active Hawlat Loans & Return Management (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Hawlat Pending Cards */}
          <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>চলমান বকেয়া হাওলাত ও ধারসমূহ</span>
                </h4>
                <p className="text-[11px] text-white/50">
                  যেসব হাওলাত এখনো সম্পূর্ণ ফেরত দেওয়া হয়নি
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-500/15 text-amber-300 rounded-full border border-amber-500/30">
                {activeHawlatList.length}টি বকেয়া
              </span>
            </div>

            <div className="divide-y divide-white/5 max-h-[320px] overflow-y-auto">
              {activeHawlatList.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-xs">
                  আলহামদুলিল্লাহ, কোনো বকেয়া আন্তঃবিভাগীয় হাওলাত বা ধার নেই।
                </div>
              ) : (
                activeHawlatList.map((loan) => {
                  const from = DEPARTMENTS[loan.fromDepartmentId];
                  const to = DEPARTMENTS[loan.toDepartmentId];
                  const due = loan.amount - loan.repaidAmount;

                  return (
                    <div
                      key={loan.id}
                      className="p-4 hover:bg-white/[0.04] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-md">
                            {loan.voucherNo}
                          </span>
                          <span className="text-xs text-white/50">
                            {formatBengaliDate(loan.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-white">
                          <span className="text-rose-300">{to?.name}</span>
                          <ArrowRightLeft className="w-3 h-3 text-white/40" />
                          <span className="text-emerald-300">{from?.name}</span>
                        </div>
                        <p className="text-[11px] text-white/50 truncate max-w-sm mt-0.5">
                          "{loan.purpose}"
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-xs text-white/60">
                            মূল হাওলাত: {formatTaka(loan.amount)}
                          </div>
                          <div className="font-bold text-amber-300 text-sm font-mono">
                            বকেয়া: {formatTaka(due)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenRepayModal(loan)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold rounded-xl shadow-md border border-emerald-400/30 transition-all flex items-center gap-1 active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>হাওলাত ফেরত দিন</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Settled Hawlat History */}
          <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-4.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <h4 className="font-bold text-xs text-white flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>পরিশোধিত হাওলাত ইতিহাস (Settled History)</span>
              </h4>
              <span className="text-[11px] text-white/40">
                {settledHawlatList.length}টি সম্পন্ন
              </span>
            </div>

            <div className="divide-y divide-white/5 max-h-[220px] overflow-y-auto">
              {settledHawlatList.length === 0 ? (
                <div className="p-6 text-center text-white/30 text-xs">
                  কোনো পরিশোধিত হাওলাত রেকর্ড নেই।
                </div>
              ) : (
                settledHawlatList.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white/80">
                          {loan.voucherNo}
                        </span>
                        <span className="text-white/40">
                          {formatBengaliDate(loan.date)}
                        </span>
                      </div>
                      <p className="text-white/70 text-[11px]">
                        {DEPARTMENTS[loan.toDepartmentId]?.shortName} $\leftarrow${' '}
                        {DEPARTMENTS[loan.fromDepartmentId]?.shortName}
                      </p>
                    </div>
                    <div className="text-right font-mono font-bold text-emerald-400">
                      {formatTaka(loan.amount)} (পরিশোধিত)
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hawlat Repay Modal */}
      {selectedLoanForRepay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  হাওলাত ফেরত ও নিষ্পত্তি
                </h4>
                <p className="text-xs text-white/60">
                  {selectedLoanForRepay.voucherNo} অনুযায়ী টাকা ফেরত প্রদান
                </p>
              </div>
            </div>

            <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 text-xs space-y-1.5">
              <div className="flex justify-between text-white/80">
                <span>ঋণ গ্রহণকারী বিভাগ:</span>
                <span className="font-bold text-rose-300">
                  {DEPARTMENTS[selectedLoanForRepay.toDepartmentId]?.name}
                </span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>হাওলাত ফেরত পাবে:</span>
                <span className="font-bold text-emerald-300">
                  {DEPARTMENTS[selectedLoanForRepay.fromDepartmentId]?.name}
                </span>
              </div>
              <div className="flex justify-between text-white/80 pt-1 border-t border-white/10">
                <span>অবশিষ্ট বকেয়া:</span>
                <span className="font-bold font-mono text-amber-300">
                  {formatTaka(
                    selectedLoanForRepay.amount -
                      selectedLoanForRepay.repaidAmount
                  )}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmRepay} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  ফেরত দেওয়ার টাকার পরিমাণ <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-teal-400">
                    ৳
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    max={
                      selectedLoanForRepay.amount -
                      selectedLoanForRepay.repaidAmount
                    }
                    value={repayAmountInput}
                    onChange={(e) => setRepayAmountInput(e.target.value)}
                    className="w-full text-base font-bold text-white bg-white/[0.08] border border-teal-400/40 rounded-xl py-2 pl-8 pr-3 focus:border-teal-300 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLoanForRepay(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white/80 text-xs font-semibold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold rounded-xl shadow-lg border border-emerald-400/30"
                >
                  হ্যাঁ, হাওলাত ফেরত দিন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
