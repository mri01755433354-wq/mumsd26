import React, { useState } from 'react';
import {
  RefreshCw,
  Wallet,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Calendar,
  Layers,
  FileCheck,
  TrendingDown,
  TrendingUp,
  Receipt
} from 'lucide-react';
import {
  AdvanceSettlement,
  DepartmentId,
  Transaction,
  User as AppUser
} from '../types';
import {
  DEPARTMENTS,
  formatBengaliDate,
  formatTaka,
  generateReceiptNo,
  generateVoucherNo,
  toBengaliNumber
} from '../utils/formatters';

interface AdjustmentViewProps {
  advances: AdvanceSettlement[];
  onAddAdvanceSettlement: (
    settlement: AdvanceSettlement,
    autoTxn?: Transaction
  ) => void;
  currentUser: AppUser | null;
}

export const AdjustmentView: React.FC<AdjustmentViewProps> = ({
  advances,
  onAddAdvanceSettlement,
  currentUser
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [departmentId, setDepartmentId] = useState<DepartmentId>('boarding');
  const [personName, setPersonName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState<string>('');
  const [actualExpense, setActualExpense] = useState<string>('');
  const [voucherNo, setVoucherNo] = useState(generateVoucherNo());
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const numAdvance = parseFloat(advanceAmount) || 0;
  const numSpent = parseFloat(actualExpense) || 0;
  const diff = numAdvance - numSpent; // Positive = refund to cash, Negative = extra cash payment

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAdvance <= 0 || numSpent <= 0) {
      alert('অনুগ্রহ করে অগ্রিম টাকার পরিমাণ এবং প্রকৃত খরচের সঠিক পরিমাণ লিখুন।');
      return;
    }

    const settlementId = `ADV-${Date.now()}`;
    const newSettlement: AdvanceSettlement = {
      id: settlementId,
      date,
      departmentId,
      personName,
      purpose,
      advanceAmount: numAdvance,
      actualExpense: numSpent,
      difference: diff,
      status: 'settled',
      receiptNo: generateReceiptNo('ADJ'),
      voucherNo: voucherNo || generateVoucherNo(),
      createdAt: Date.now()
    };

    let autoTxn: Transaction | undefined;

    // Create adjustment balancing transaction
    if (diff !== 0) {
      const isRefundToCash = diff > 0;
      autoTxn = {
        id: `TXN-ADJ-${Date.now()}`,
        receiptNo: newSettlement.receiptNo,
        voucherNo: newSettlement.voucherNo,
        date,
        type: isRefundToCash ? 'income' : 'expense',
        departmentId,
        category: 'অগ্রিম হিসাব সমন্বয়',
        description: `${personName} এর '${purpose}' বাবদ অগ্রিম সমন্বয়। (অগ্রিম: ${formatTaka(numAdvance)}, খরচ: ${formatTaka(numSpent)}, ${isRefundToCash ? 'উদ্বৃত্ত ক্যাশে জমা' : 'অতিরিক্ত ক্যাশ প্রদান'})`,
        amount: Math.abs(diff),
        paymentMethod: 'নগদ (Cash)',
        payerOrPayee: personName,
        entryBy: currentUser?.username || 'admin',
        createdAt: Date.now()
      };
    }

    onAddAdvanceSettlement(newSettlement, autoTxn);
    setShowSuccessModal(true);

    // Reset Form
    setPersonName('');
    setPurpose('');
    setAdvanceAmount('');
    setActualExpense('');
    setVoucherNo(generateVoucherNo());

    setTimeout(() => {
      setShowSuccessModal(false);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Information Banner */}
      <div className="bg-amber-500/10 backdrop-blur-xl text-white rounded-3xl p-5 border border-amber-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center flex-shrink-0 shadow-md">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              অগ্রিম হিসাব ও ভাউচার সমন্বয় মডিউল
            </h3>
            <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
              বাজার, মেরামত বা কোনো কাজের জন্য দেওয়া অগ্রিম টাকার বিপরীতে মেমো ও প্রকৃত খরচ মিলিয়ে স্বয়ংক্রিয় ক্যাশ ব্যালেন্সিং করুন।
            </p>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="bg-emerald-950/80 backdrop-blur-2xl text-white p-4 rounded-3xl border border-emerald-500/40 flex items-center gap-3 shadow-2xl animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">
            অগ্রিম হিসাব সমন্বয় সফল হয়েছে এবং স্বয়ংক্রিয়ভাবে ক্যাশ বুকে ব্যালেন্স অ্যাডজাস্ট করা হয়েছে!
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settlement Form (7 cols) */}
        <div className="lg:col-span-7 bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
          <div className="p-5 sm:p-6 bg-white/[0.03] border-b border-white/10 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-400/30 rounded-2xl shadow-xs">
                <ArrowRightLeft className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">অগ্রিম সমন্বয়ের নতুন এন্ট্রি</h3>
                <p className="text-xs text-white/50">মেমো ও খরচের হিসাব মিলিয়ে নিন</p>
              </div>
            </div>
            <span className="font-mono font-bold text-sm bg-black/40 border border-white/10 px-2.5 py-1 rounded-xl text-amber-300 shadow-inner">
              {voucherNo}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4.5">
            {/* Person & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  অগ্রিম গ্রহণকারী ব্যক্তির নাম <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মাওলানা শফিউল্লাহ (বাজার ইনচার্জ)"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 rounded-xl p-2.5 focus:border-amber-400 focus:bg-white/[0.09] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  বিভাগ <span className="text-rose-400">*</span>
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-amber-400 focus:bg-white/[0.09] focus:outline-hidden"
                >
                  {(Object.keys(DEPARTMENTS) as DepartmentId[]).map((k) => (
                    <option key={k} value={k}>
                      {DEPARTMENTS[k].name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Purpose & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  অগ্রিমের উদ্দেশ্য / কাজের বিবরণ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সাপ্তাহিক চাল-ডাল ও মসলা বাজার ক্রয়"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 rounded-xl p-2.5 focus:border-amber-400 focus:bg-white/[0.09] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  সমন্বয়ের তারিখ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-amber-400 focus:bg-white/[0.09] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Advance Amount vs Actual Spent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
              <div>
                <label className="block text-xs font-bold text-white/90 mb-1.5">
                  ১. পূর্বে অগ্রিম প্রদান করা হয়েছিল <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-amber-400">
                    ৳
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="যেমন: ৫০০০"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    className="w-full font-bold text-sm bg-white/[0.08] border border-white/15 text-white rounded-xl py-2 pl-8 pr-3 focus:border-amber-400 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/90 mb-1.5">
                  ২. মেমো অনুযায়ী মোট প্রকৃত খরচ <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-rose-400">
                    ৳
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="যেমন: ৪৮০০"
                    value={actualExpense}
                    onChange={(e) => setActualExpense(e.target.value)}
                    className="w-full font-bold text-sm bg-white/[0.08] border border-white/15 text-white rounded-xl py-2 pl-8 pr-3 focus:border-amber-400 focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation Display Box */}
            {numAdvance > 0 && numSpent > 0 && (
              <div
                className={`p-4 rounded-2xl border text-center transition-all backdrop-blur-xl ${
                  diff > 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : diff < 0
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                  {diff > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>উদ্বৃত্ত টাকা ফেরত (ক্যাশ জমা হবে)</span>
                    </>
                  ) : diff < 0 ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                      <span>অতিরিক্ত ব্যয় (ক্যাশ হতে পরিশোধ করতে হবে)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      <span>হিসাব সম্পূর্ণ নির্ভুল ও সমান (কোনো দেনা-পাওনা নেই)</span>
                    </>
                  )}
                </div>
                <div
                  className={`text-2xl font-extrabold tracking-tight font-mono ${
                    diff > 0 ? 'text-emerald-300' : diff < 0 ? 'text-rose-300' : 'text-blue-300'
                  }`}
                >
                  {formatTaka(Math.abs(diff))}
                </div>
                <p className="text-xs text-white/70 mt-1">
                  {diff > 0
                    ? `ব্যক্তির নিকট হতে ${formatTaka(diff)} ক্যাশে ফেরত নিয়ে জমা করা হবে।`
                    : diff < 0
                    ? `ব্যক্তিকে অতিরিক্ত খরচ বাবদ ${formatTaka(Math.abs(diff))} ক্যাশ হতে প্রদান করা হবে।`
                    : 'অগ্রিম ও খরচের পরিমাণ হুবহু সমান।'}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-amber-950/40 border border-amber-400/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>সমন্বয় সম্পন্ন করুন ও ক্যাশ ব্যালেন্স আপডেট করুন</span>
            </button>
          </form>
        </div>

        {/* Right Settlement History (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <span>সম্পন্ন অগ্রিম সমন্বয়সমূহ</span>
                </h4>
                <p className="text-xs text-white/50">পূর্বের নিষ্পত্তি হিসাব</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-500/15 text-amber-300 rounded-full border border-amber-500/30 backdrop-blur-xs">
                {advances.length}টি সমন্বয়
              </span>
            </div>

            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {advances.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-xs">
                  কোনো অগ্রিম সমন্বয়ের রেকর্ড নেই।
                </div>
              ) : (
                advances.map((adv) => {
                  const dept = DEPARTMENTS[adv.departmentId];
                  return (
                    <div key={adv.id} className="p-4 hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-xs text-white">
                          {adv.personName}
                        </span>
                        <span className="text-[11px] text-white/50">
                          {formatBengaliDate(adv.date)}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 mb-2.5">{adv.purpose}</p>

                      <div className="grid grid-cols-3 gap-2 bg-white/[0.04] border border-white/10 p-2.5 rounded-xl text-center text-xs">
                        <div>
                          <span className="text-[10px] text-white/40 block">অগ্রিম</span>
                          <span className="font-bold text-white font-mono">
                            {formatTaka(adv.advanceAmount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 block">প্রকৃত খরচ</span>
                          <span className="font-bold text-white font-mono">
                            {formatTaka(adv.actualExpense)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 block">
                            {adv.difference >= 0 ? 'ফেরত জমা' : 'অতিরিক্ত'}
                          </span>
                          <span
                            className={`font-bold font-mono ${
                              adv.difference >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {formatTaka(Math.abs(adv.difference))}
                          </span>
                        </div>
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
