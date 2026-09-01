import React, { useState, useMemo } from 'react';
import {
  MinusCircle,
  Receipt,
  Building,
  User,
  Calendar,
  Wallet,
  CheckCircle2,
  Printer,
  ShoppingBag,
  FileCheck,
  AlertTriangle,
  ArrowRightLeft,
  Sparkles,
  Info
} from 'lucide-react';
import {
  DepartmentId,
  HawlatLoan,
  PaymentMethod,
  Transaction,
  User as AppUser
} from '../types';
import {
  DEPARTMENTS,
  EXPENSE_CATEGORIES,
  formatBengaliDate,
  formatTaka,
  generateVoucherNo,
  toBengaliNumber
} from '../utils/formatters';

interface ExpenseViewProps {
  onAddTransaction: (txn: Transaction) => void;
  recentExpenses: Transaction[];
  onSelectReceipt: (txn: Transaction) => void;
  currentUser: AppUser | null;
  totalCashInHand: number;
  transactions: Transaction[];
  hawlatLoans: HawlatLoan[];
  onAddHawlatLoan: (loan: HawlatLoan) => void;
  onNavigateToHawlat?: () => void;
}

export const ExpenseView: React.FC<ExpenseViewProps> = ({
  onAddTransaction,
  recentExpenses,
  onSelectReceipt,
  currentUser,
  totalCashInHand,
  transactions,
  hawlatLoans,
  onAddHawlatLoan,
  onNavigateToHawlat
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [departmentId, setDepartmentId] = useState<DepartmentId>('boarding');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('নগদ (Cash)');
  const [payerOrPayee, setPayerOrPayee] = useState('');
  const [voucherNo, setVoucherNo] = useState(generateVoucherNo());
  const [description, setDescription] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [lastCreatedTxn, setLastCreatedTxn] = useState<Transaction | null>(null);

  // Quick Hawlat Modal state
  const [showHawlatModal, setShowHawlatModal] = useState(false);
  const [suggestedLenderDept, setSuggestedLenderDept] =
    useState<DepartmentId>('director');

  // Compute departmental balances
  const deptBalances = useMemo(() => {
    const balances: Record<DepartmentId, number> = {
      nurani: 0,
      ebtedayi: 0,
      hefzo: 0,
      boarding: 0,
      director: 0
    };

    transactions.forEach((t) => {
      if (t.type === 'income') balances[t.departmentId] += t.amount;
      else if (t.type === 'expense') balances[t.departmentId] -= t.amount;
    });

    hawlatLoans.forEach((l) => {
      balances[l.fromDepartmentId] -= l.amount;
      balances[l.fromDepartmentId] += l.repaidAmount;
      balances[l.toDepartmentId] += l.amount;
      balances[l.toDepartmentId] -= l.repaidAmount;
    });

    return balances;
  }, [transactions, hawlatLoans]);

  const currentDeptBalance = deptBalances[departmentId] || 0;
  const numAmount = parseFloat(amount) || 0;
  const isDeficit = numAmount > 0 && currentDeptBalance < numAmount;
  const deficitAmount = numAmount - Math.max(0, currentDeptBalance);

  // Find departments that have surplus funds to suggest
  const surplusDepartments = useMemo(() => {
    return (Object.keys(DEPARTMENTS) as DepartmentId[])
      .filter((dId) => dId !== departmentId && deptBalances[dId] > 0)
      .map((dId) => ({
        id: dId,
        name: DEPARTMENTS[dId].name,
        shortName: DEPARTMENTS[dId].shortName,
        balance: deptBalances[dId],
        canCoverFully: deptBalances[dId] >= deficitAmount
      }))
      .sort((a, b) => b.balance - a.balance);
  }, [deptBalances, departmentId, deficitAmount]);

  const handleQuickHawlatAndSpend = (lenderDept: DepartmentId) => {
    const loanAmount = Math.ceil(deficitAmount);
    if (loanAmount <= 0) return;

    // 1. Create Hawlat Loan record
    const newLoan: HawlatLoan = {
      id: `HWL-${Date.now()}`,
      voucherNo: generateVoucherNo(),
      date,
      fromDepartmentId: lenderDept,
      toDepartmentId: departmentId,
      amount: loanAmount,
      repaidAmount: 0,
      purpose: `${category} খরচ মেটানোর জন্য ${DEPARTMENTS[lenderDept]?.name} হতে জরুরি হাওলাত`,
      status: 'active',
      createdAt: Date.now()
    };

    onAddHawlatLoan(newLoan);
    setShowHawlatModal(false);

    alert(
      `সফল! ${DEPARTMENTS[lenderDept]?.name} হতে ${formatTaka(loanAmount)} ${DEPARTMENTS[departmentId]?.name} এ হাওলাত স্থানান্তর করা হয়েছে। এখন ব্যয় ভাউচার নিশ্চিত করতে পারেন।`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('অনুগ্রহ করে সঠিক খরচের টাকার পরিমাণ লিখুন।');
      return;
    }

    if (numAmount > totalCashInHand && paymentMethod === 'নগদ (Cash)') {
      const confirmSpend = window.confirm(
        `সতর্কবার্তা: সর্বমোট ক্যাশ ব্যালেন্স (${formatTaka(totalCashInHand)}) এর চেয়ে খরচের পরিমাণ (${formatTaka(numAmount)}) বেশি। আপনি কি এই ব্যয়টি নিশ্চিত করতে চান?`
      );
      if (!confirmSpend) return;
    }

    const newTxn: Transaction = {
      id: `TXN-${Date.now()}`,
      receiptNo: voucherNo || generateVoucherNo(),
      voucherNo: voucherNo || generateVoucherNo(),
      date,
      type: 'expense',
      departmentId,
      category,
      description: description || `${category} বাবদ ব্যয়`,
      amount: numAmount,
      paymentMethod,
      payerOrPayee: payerOrPayee || 'সংশ্লিষ্ট ব্যক্তি / প্রতিষ্ঠান',
      entryBy: currentUser?.username || 'admin',
      createdAt: Date.now()
    };

    onAddTransaction(newTxn);
    setLastCreatedTxn(newTxn);
    setShowSuccessBanner(true);

    // Reset form
    setAmount('');
    setDescription('');
    setPayerOrPayee('');
    setVoucherNo(generateVoucherNo());

    setTimeout(() => {
      setShowSuccessBanner(false);
    }, 6000);
  };

  const activeDept = DEPARTMENTS[departmentId];

  return (
    <div className="space-y-6">
      {/* Top Success Notification */}
      {showSuccessBanner && lastCreatedTxn && (
        <div className="bg-rose-950/80 backdrop-blur-2xl text-white rounded-3xl p-5 shadow-2xl border border-rose-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center flex-shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6 text-rose-300" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">ব্যয় এন্ট্রি সফল হয়েছে!</h4>
              <p className="text-xs text-white/70 mt-0.5">
                ভাউচার নং:{' '}
                <span className="font-mono font-bold text-rose-300 bg-black/30 px-1.5 py-0.5 rounded">
                  {lastCreatedTxn.voucherNo}
                </span>{' '}
                • পরিমাণ:{' '}
                <span className="font-bold text-rose-300">
                  {formatTaka(lastCreatedTxn.amount)}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectReceipt(lastCreatedTxn)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg border border-white/20 transition-all whitespace-nowrap active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>ব্যয় ভাউচার প্রিন্ট করুন</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Expense Form (7 cols) */}
        <div className="lg:col-span-7 bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
          <div className="p-5 sm:p-6 bg-white/[0.03] border-b border-white/10 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/20 border border-rose-400/30 rounded-2xl shadow-xs">
                <MinusCircle className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">নতুন ব্যয় / খরচ এন্ট্রি ফর্ম</h3>
                <p className="text-xs text-white/50">ভাউচার নম্বর সহ খরচের সঠিক হিসাব রাখুন</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase text-white/50 block">ভাউচার নম্বর</span>
              <span className="font-mono font-bold text-sm bg-black/40 border border-white/10 px-2.5 py-1 rounded-xl text-rose-300 shadow-inner">
                {voucherNo}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4.5">
            {/* Date & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  তারিখ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-rose-400 focus:bg-white/[0.09] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center justify-between">
                  <span>বিভাগ <span className="text-rose-400">*</span></span>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      currentDeptBalance < 0
                        ? 'text-rose-400'
                        : 'text-emerald-300'
                    }`}
                  >
                    ব্যালেন্স: {formatTaka(currentDeptBalance)}
                  </span>
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-rose-400 focus:bg-white/[0.09] focus:outline-hidden"
                  required
                >
                  {(Object.keys(DEPARTMENTS) as DepartmentId[]).map((key) => (
                    <option key={key} value={key}>
                      {DEPARTMENTS[key].name} (তহবিল:{' '}
                      {formatTaka(deptBalances[key] || 0)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  ব্যয়ের খাত <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-rose-400 focus:bg-white/[0.09] focus:outline-hidden"
                  required
                >
                  {EXPENSE_CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  পরিশোধ মাধ্যম
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-rose-400 focus:bg-white/[0.09] focus:outline-hidden"
                >
                  <option value="নগদ (Cash)">নগদ (Cash)</option>
                  <option value="বিকাশ/নগদ (MFS)">বিকাশ / নগদ (MFS)</option>
                  <option value="ব্যাংক ট্রান্সফার">ব্যাংক ট্রান্সফার (Bank Deposit)</option>
                  <option value="চেক (Cheque)">চেক (Cheque)</option>
                </select>
              </div>
            </div>

            {/* Payee / Receiver Name */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                টাকা গ্রহণকারী / শিক্ষক / দোকানের নাম <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: হাফেজ মাওলানা মোঃ হাবিবুল্লাহ বাহার / মেসার্স মা স্টোর"
                value={payerOrPayee}
                onChange={(e) => setPayerOrPayee(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 rounded-xl p-2.5 focus:border-rose-400 focus:bg-white/[0.09] focus:outline-hidden"
              />
            </div>

            {/* Amount (Big Highlighted Input) */}
            <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/30 shadow-inner">
              <label className="block text-xs font-bold text-rose-300 mb-2 flex items-center justify-between">
                <span>খরচের পরিমাণ (টাকা) <span className="text-rose-400">*</span></span>
                <span className="text-xs text-rose-300 font-semibold font-mono">
                  {amount ? formatTaka(numAmount) : '৳ ০.০০'}
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-rose-400">
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
                  className="w-full text-lg sm:text-xl font-bold text-white bg-white/[0.08] border border-rose-400/40 rounded-xl py-2.5 pl-10 pr-4 focus:border-rose-300 focus:bg-white/[0.12] focus:outline-hidden shadow-inner font-mono"
                />
              </div>
            </div>

            {/* SMART HAWLAT SUGGESTION BOX (Triggered when department has deficit) */}
            {isDeficit && (
              <div className="bg-gradient-to-br from-amber-950/80 via-slate-900/90 to-rose-950/80 border-2 border-amber-500/50 rounded-2xl p-4 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-2">
                      <span>{activeDept?.name} ফান্ডের ঘাটতি সনাক্ত হয়েছে</span>
                      <span className="text-[10px] bg-rose-500/30 text-rose-200 border border-rose-400/30 px-2 py-0.2 rounded-full font-mono">
                        ঘাটতি: {formatTaka(deficitAmount)}
                      </span>
                    </h5>
                    <p className="text-[11px] text-white/70 mt-0.5">
                      এই বিভাগে ব্যালেন্স রয়েছে {formatTaka(currentDeptBalance)}, কিন্তু খরচ {formatTaka(numAmount)}।
                    </p>
                  </div>
                </div>

                {surplusDepartments.length > 0 ? (
                  <div className="bg-black/30 rounded-xl p-3 border border-white/10 space-y-2">
                    <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>উদ্বৃত্ত ফান্ড রয়েছে এমন বিভাগসমূহ (১-ক্লিকে হাওলাত নিন):</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {surplusDepartments.map((sDept) => (
                        <button
                          key={sDept.id}
                          type="button"
                          onClick={() => handleQuickHawlatAndSpend(sDept.id)}
                          className="text-left p-2.5 rounded-xl bg-white/[0.06] hover:bg-teal-500/20 border border-white/10 hover:border-teal-400/40 transition-all flex items-center justify-between group active:scale-98"
                        >
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-teal-200">
                              {sDept.name}
                            </div>
                            <div className="text-[10px] text-teal-300 font-mono">
                              উদ্বৃত্ত: {formatTaka(sDept.balance)}
                            </div>
                          </div>
                          <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-1 rounded-lg font-bold group-hover:bg-teal-500/40">
                            হাওলাত নিন
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-200/80 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    অন্যান্য বিভাগেও বর্তমানে উদ্বৃত্ত ফান্ড নেই। আপনি চাইলে সাধারণ ক্যাশ থেকে অগ্রিম ব্যয় করতে পারেন।
                  </div>
                )}
              </div>
            )}

            {/* Description / Voucher Details */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                খরচের বিস্তারিত বিবরণ / বিল মেমো নম্বর
              </label>
              <textarea
                rows={2}
                placeholder="যেমন: মেমো নং ৮৯২ অনুযায়ী চাল-ডাল ও তেল ক্রয়"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 rounded-xl p-2.5 focus:border-rose-400 focus:bg-white/[0.09] focus:outline-hidden"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-rose-950/40 border border-rose-400/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>খরচ নিশ্চিত করুন ও ব্যয় ভাউচার তৈরি করুন</span>
            </button>
          </form>
        </div>

        {/* Right Info & Recent Expenses List (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Department Info & Live Balance Pill */}
          <div
            className="rounded-3xl p-5 border backdrop-blur-xl shadow-lg"
            style={{
              backgroundColor: `${activeDept?.color}15`,
              borderColor: `${activeDept?.color}35`
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shadow-xs"
                  style={{ backgroundColor: activeDept?.color }}
                />
                <h4 className="font-bold text-sm text-white">{activeDept?.name}</h4>
              </div>
              <span className="font-mono text-xs font-bold text-white/90 bg-black/30 px-2 py-0.5 rounded-lg border border-white/10">
                ব্যালেন্স: {formatTaka(currentDeptBalance)}
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {activeDept?.description}
            </p>
          </div>

          {/* Recent Expenses List */}
          <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-rose-400" />
                  <span>সর্বশেষ ব্যয় ভাউচারসমূহ</span>
                </h4>
                <p className="text-[11px] text-white/50">অডিট ও খরচের মেমো হিস্ট্রি</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-rose-500/15 text-rose-300 rounded-full border border-rose-500/30 backdrop-blur-xs">
                {recentExpenses.length}টি ভাউচার
              </span>
            </div>

            <div className="divide-y divide-white/5 max-h-[460px] overflow-y-auto">
              {recentExpenses.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-xs">
                  এখনো কোনো ব্যয়ের রেকর্ড নেই।
                </div>
              ) : (
                recentExpenses.map((txn) => {
                  const dept = DEPARTMENTS[txn.departmentId];
                  return (
                    <div
                      key={txn.id}
                      className="p-4 hover:bg-white/[0.04] transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-lg">
                            {txn.voucherNo || txn.receiptNo}
                          </span>
                          <span className="text-xs text-white/50">
                            {formatBengaliDate(txn.date)}
                          </span>
                        </div>
                        <p className="font-semibold text-xs sm:text-sm text-white truncate mt-1">
                          {txn.payerOrPayee}
                        </p>
                        <p className="text-[11px] text-white/50 truncate">
                          {dept?.name} • {txn.category}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-rose-400 text-sm font-mono">
                          {formatTaka(txn.amount)}
                        </div>
                        <button
                          onClick={() => onSelectReceipt(txn)}
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-white/80 hover:text-rose-300 bg-white/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg border border-white/15 hover:border-rose-500/30 transition-colors backdrop-blur-xs"
                        >
                          <Printer className="w-3 h-3" />
                          <span>ভাউচার</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
