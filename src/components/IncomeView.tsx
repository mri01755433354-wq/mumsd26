import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Receipt,
  User,
  Phone,
  Wallet,
  Calendar,
  Layers,
  FileText,
  CreditCard,
  Printer,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import {
  DepartmentId,
  HawlatLoan,
  PaymentMethod,
  Student,
  Transaction,
  User as AppUser
} from '../types';
import {
  DEPARTMENTS,
  INCOME_CATEGORIES,
  formatBengaliDate,
  formatTaka,
  generateReceiptNo,
  toBengaliNumber
} from '../utils/formatters';

interface IncomeViewProps {
  students: Student[];
  onAddTransaction: (txn: Transaction) => void;
  recentIncomes: Transaction[];
  onSelectReceipt: (txn: Transaction) => void;
  currentUser: AppUser | null;
  hawlatLoans?: HawlatLoan[];
  onRepayHawlatLoan?: (loanId: string, repayAmount: number) => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  students,
  onAddTransaction,
  recentIncomes,
  onSelectReceipt,
  currentUser,
  hawlatLoans = [],
  onRepayHawlatLoan
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [departmentId, setDepartmentId] = useState<DepartmentId>('nurani');
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('নগদ (Cash)');
  const [payerOrPayee, setPayerOrPayee] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [description, setDescription] = useState('');
  const [receiptNo, setReceiptNo] = useState(generateReceiptNo('MR'));
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [lastCreatedTxn, setLastCreatedTxn] = useState<Transaction | null>(null);

  // Check if current department has active borrowed Hawlat loans
  const deptActiveLoans = useMemo(() => {
    return hawlatLoans.filter(
      (l) =>
        l.toDepartmentId === departmentId &&
        (l.status === 'active' || l.status === 'partial')
    );
  }, [hawlatLoans, departmentId]);

  const totalHawlatDueForDept = useMemo(() => {
    return deptActiveLoans.reduce(
      (acc, l) => acc + (l.amount - l.repaidAmount),
      0
    );
  }, [deptActiveLoans]);

  // Auto-fill student details when selected
  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setStudentId(sId);
    if (!sId) return;

    const student = students.find((s) => s.id === sId);
    if (student) {
      setPayerOrPayee(student.name);
      setContactNumber(student.phone);
      setDepartmentId(student.departmentId);
      const feeTotal =
        student.monthlyFee + student.boardingFee - student.discount;
      if (feeTotal > 0 && !amount) {
        setAmount(feeTotal.toString());
      }
      setDescription(
        `${student.name} (${student.classGroup}, রোল: ${toBengaliNumber(
          student.roll
        )}) - ফি বাবদ`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন।');
      return;
    }

    const newTxn: Transaction = {
      id: `TXN-${Date.now()}`,
      receiptNo: receiptNo || generateReceiptNo('MR'),
      date,
      type: 'income',
      departmentId,
      category,
      description: description || `${category} বাবদ প্রাপ্তি`,
      amount: numAmount,
      paymentMethod,
      payerOrPayee: payerOrPayee || 'সাধারণ দাতা / শিক্ষার্থী',
      contactNumber,
      studentId: studentId || undefined,
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
    setContactNumber('');
    setStudentId('');
    setReceiptNo(generateReceiptNo('MR'));

    setTimeout(() => {
      setShowSuccessBanner(false);
    }, 6000);
  };

  const activeDept = DEPARTMENTS[departmentId];

  return (
    <div className="space-y-6">
      {/* Top Banner / Notification */}
      {showSuccessBanner && lastCreatedTxn && (
        <div className="bg-emerald-950/80 backdrop-blur-2xl text-white rounded-3xl p-5 shadow-2xl border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center flex-shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">জমা এন্ট্রি সফল হয়েছে!</h4>
              <p className="text-xs text-white/70 mt-0.5">
                রসিদ নং:{' '}
                <span className="font-mono font-bold text-emerald-300 bg-black/30 px-1.5 py-0.5 rounded">
                  {lastCreatedTxn.receiptNo}
                </span>{' '}
                • পরিমাণ:{' '}
                <span className="font-bold text-emerald-300">
                  {formatTaka(lastCreatedTxn.amount)}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectReceipt(lastCreatedTxn)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg border border-white/20 transition-all whitespace-nowrap active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>মানি রসিদ মুদ্রণ করুন</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
          <div className="p-5 sm:p-6 bg-white/[0.03] border-b border-white/10 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl shadow-xs">
                <PlusCircle className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">নতুন জমা / আয় এন্ট্রি ফর্ম</h3>
                <p className="text-xs text-white/50">সঠিক তথ্য দিয়ে মানি রসিদ তৈরি করুন</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase text-white/50 block">রসিদ নম্বর</span>
              <span className="font-mono font-bold text-sm bg-black/40 border border-white/10 px-2.5 py-1 rounded-xl text-emerald-300 shadow-inner">
                {receiptNo}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4.5">
            {/* Quick Student Auto-Fill Dropdown */}
            <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center justify-between">
                <span>শিক্ষার্থী নির্বাচন করুন (ঐচ্ছিক - স্বয়ংক্রিয় তথ্য পূরণের জন্য)</span>
                <span className="text-[10px] text-emerald-300">
                  {students.length} জন ছাত্র
                </span>
              </label>
              <select
                value={studentId}
                onChange={handleStudentSelect}
                className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
              >
                <option value="">-- তালিকার বাইরে সাধারণ দাতা / অন্যান্য --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    রোল {toBengaliNumber(s.roll)} - {s.name} ({s.classGroup}) [
                    {DEPARTMENTS[s.departmentId]?.shortName}]
                  </option>
                ))}
              </select>
            </div>

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
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  বিভাগ <span className="text-rose-400">*</span>
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
                  required
                >
                  {(Object.keys(DEPARTMENTS) as DepartmentId[]).map((key) => (
                    <option key={key} value={key}>
                      {DEPARTMENTS[key].name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hawlat Outstanding Notice on Selected Department */}
            {totalHawlatDueForDept > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white">
                      হাওলাত বকেয়া নোটিশ:
                    </span>{' '}
                    এই বিভাগে ৳{toBengaliNumber(totalHawlatDueForDept)} বকেয়া দেনা
                    রয়েছে।
                  </div>
                </div>
                {onRepayHawlatLoan && deptActiveLoans.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const firstLoan = deptActiveLoans[0];
                      const due = firstLoan.amount - firstLoan.repaidAmount;
                      const repayVal = prompt(
                        `${DEPARTMENTS[firstLoan.fromDepartmentId]?.name}-কে হাওলাত বাবদ কত টাকা ফেরত দিতে চান? (বকেয়া: ${due} টাকা)`,
                        due.toString()
                      );
                      if (repayVal && parseFloat(repayVal) > 0) {
                        onRepayHawlatLoan(firstLoan.id, parseFloat(repayVal));
                        alert('হাওলাত ফেরত সফল হয়েছে!');
                      }
                    }}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold text-[11px] shrink-0"
                  >
                    হাওলাত ফেরত দিন
                  </button>
                )}
              </div>
            )}

            {/* Category & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  আয়ের খাত <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
                  required
                >
                  {INCOME_CATEGORIES.map((cat, idx) => (
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
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
                >
                  <option value="নগদ (Cash)">নগদ (Cash)</option>
                  <option value="বিকাশ/নগদ (MFS)">বিকাশ / নগদ (MFS)</option>
                  <option value="ব্যাংক ট্রান্সফার">ব্যাংক ট্রান্সফার (Bank Deposit)</option>
                  <option value="চেক (Cheque)">চেক (Cheque)</option>
                </select>
              </div>
            </div>

            {/* Payer Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  টাকা প্রদানকারীর নাম / অভিভাবক <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: হাজী মোঃ রফিকুল ইসলাম"
                  value={payerOrPayee}
                  onChange={(e) => setPayerOrPayee(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 rounded-xl p-2.5 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  মোবাইল নম্বর
                </label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 rounded-xl p-2.5 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden font-mono"
                />
              </div>
            </div>

            {/* Amount (Big Highlighted Input) */}
            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30 shadow-inner">
              <label className="block text-xs font-bold text-emerald-300 mb-2 flex items-center justify-between">
                <span>জমার পরিমাণ (টাকা) <span className="text-rose-400">*</span></span>
                <span className="text-xs text-emerald-300 font-semibold font-mono">
                  {amount ? formatTaka(parseFloat(amount) || 0) : '৳ ০.০০'}
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-emerald-400">
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
                  className="w-full text-lg sm:text-xl font-bold text-white bg-white/[0.08] border border-emerald-400/40 rounded-xl py-2.5 pl-10 pr-4 focus:border-emerald-300 focus:bg-white/[0.12] focus:outline-hidden shadow-inner font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                বিবরণ / বিশেষ নোট
              </label>
              <textarea
                rows={2}
                placeholder="যেমন: চলতি মাসের বেতন ও খোরাকি ফি পরিশোধ"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 rounded-xl p-2.5 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>জমা নিশ্চিত করুন ও মানি রসিদ তৈরি করুন</span>
            </button>
          </form>
        </div>

        {/* Right Info & Recent Incomes List (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Department Info Pill */}
          <div
            className="rounded-3xl p-5 border backdrop-blur-xl shadow-lg"
            style={{
              backgroundColor: `${activeDept?.color}15`,
              borderColor: `${activeDept?.color}35`
            }}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <span
                className="w-3 h-3 rounded-full shadow-xs"
                style={{ backgroundColor: activeDept?.color }}
              />
              <h4 className="font-bold text-sm text-white">
                {activeDept?.name} এ জমা
              </h4>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {activeDept?.description}
            </p>
          </div>

          {/* Recent Incomes List */}
          <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>সর্বশেষ আদায় ও রসিদসমূহ</span>
                </h4>
                <p className="text-[11px] text-white/50">রিয়েল-টাইম ক্যাশ কালেকশন</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-500/15 text-emerald-300 rounded-full border border-emerald-500/30 backdrop-blur-xs">
                {recentIncomes.length}টি রসিদ
              </span>
            </div>

            <div className="divide-y divide-white/5 max-h-[460px] overflow-y-auto">
              {recentIncomes.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-xs">
                  এখনো কোনো জমার রেকর্ড নেই।
                </div>
              ) : (
                recentIncomes.map((txn) => {
                  const dept = DEPARTMENTS[txn.departmentId];
                  return (
                    <div
                      key={txn.id}
                      className="p-4 hover:bg-white/[0.04] transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                            {txn.receiptNo}
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
                        <div className="font-bold text-emerald-400 text-sm font-mono">
                          {formatTaka(txn.amount)}
                        </div>
                        <button
                          onClick={() => onSelectReceipt(txn)}
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-white/80 hover:text-emerald-300 bg-white/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-white/15 hover:border-emerald-500/30 transition-colors backdrop-blur-xs"
                        >
                          <Printer className="w-3 h-3" />
                          <span>রসিদ</span>
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
