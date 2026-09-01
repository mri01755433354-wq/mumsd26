import React, { useState } from 'react';
import {
  Printer,
  X,
  CheckCircle2,
  Landmark,
  ExternalLink,
  FileText,
  Scissors
} from 'lucide-react';
import { MadrasaProfile, Transaction } from '../types';
import {
  DEPARTMENTS,
  formatBengaliDate,
  formatTaka
} from '../utils/formatters';
import { directPrintSlip, openSlipInNewWindow } from '../utils/printHelper';

interface MoneyReceiptModalProps {
  transaction: Transaction | null;
  profile: MadrasaProfile;
  onClose: () => void;
}

export const MoneyReceiptModal: React.FC<MoneyReceiptModalProps> = ({
  transaction,
  profile,
  onClose
}) => {
  if (!transaction) return null;

  const isIncome = transaction.type === 'income';
  const dept = DEPARTMENTS[transaction.departmentId];
  const directorName = profile.director || 'হাফেজ মাওলানা মোঃ হাবিবুল্লাহ বাহার এম এ';

  const [printStatus, setPrintStatus] = useState<string | null>(null);

  const handleDirectPrint = () => {
    setPrintStatus('প্রিন্টারের সাথে সংযোগ স্থাপন করা হচ্ছে...');
    directPrintSlip(transaction, profile);
    setTimeout(() => setPrintStatus(null), 3000);
  };

  const handleOpenNewTab = () => {
    openSlipInNewWindow(transaction, profile);
  };

  const renderSlip = (copyType: 'গ্রাহক / দাতার কপি' | 'অফিস / ক্যাশ কপি') => {
    return (
      <div className="border-2 border-slate-800 rounded-2xl p-4 sm:p-5 bg-white relative overflow-hidden text-slate-900 shadow-sm print:border-black print:shadow-none mb-3">
        {/* Watermark */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <Landmark className="w-48 h-48 text-black" />
        </div>

        {/* Slip Header */}
        <div className="text-center pb-3 border-b border-slate-700 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
              {isIncome ? 'মানি রসিদ নং:' : 'ব্যয় ভাউচার নং:'} {transaction.receiptNo || transaction.voucherNo || 'N/A'}
            </span>
            <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
              {copyType}
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            {profile.name}
          </h2>
          <p className="text-xs text-slate-600 font-medium">{profile.address} • ফোন: {profile.phone}</p>
          
          <div className="mt-1.5 inline-block px-3 py-0.5 bg-slate-900 text-white font-bold text-[11px] sm:text-xs rounded-full">
            {isIncome ? 'অফিশিয়াল আদায় ও মানি রসিদ' : 'অফিশিয়াল ব্যয় ভাউচার স্লিপ'}
          </div>
        </div>

        {/* Receipt Body Fields */}
        <div className="py-3 space-y-2 text-xs sm:text-sm relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 font-medium">তারিখ:</span>{' '}
              <span className="font-bold text-slate-900">{formatBengaliDate(transaction.date)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-medium">বিভাগ:</span>{' '}
              <span className="font-bold text-slate-900">{dept?.name || transaction.departmentId}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-slate-500 font-medium text-xs">
                  {isIncome ? 'টাকা প্রদানকারী / ছাত্র:' : 'টাকা গ্রহণকারী / ব্যক্তি:'}
                </span>{' '}
                <span className="font-extrabold text-slate-900 text-sm block sm:inline">
                  {transaction.payerOrPayee || 'সাধারণ'}
                </span>
                {transaction.contactNumber && (
                  <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                    মোবাইল: {transaction.contactNumber}
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-slate-500 text-[11px] block">পরিশোধের মাধ্যম</span>
                <span className="font-bold text-slate-800 text-xs">
                  {transaction.paymentMethod || 'নগদ (Cash)'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0.5">
            <div>
              <span className="text-slate-500 font-medium text-xs">খাত:</span>{' '}
              <span className="font-bold text-slate-800">{transaction.category}</span>
            </div>
            {transaction.description && (
              <div className="text-xs text-slate-600 pl-2 italic border-l-2 border-slate-300">
                "{transaction.description}"
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="mt-2 p-2.5 sm:p-3 bg-emerald-50 rounded-xl border-2 border-emerald-600 flex items-center justify-between print:border-black print:bg-transparent">
            <div>
              <span className="text-xs font-bold text-emerald-900 print:text-black uppercase block">
                {isIncome ? 'মোট আদায়কৃত টাকা' : 'মোট পরিশোধিত টাকা'}
              </span>
              <span className="text-[10px] text-slate-600 font-medium">
                (ডিজিটাল হিসাব খতিয়ান ভেরিফাইড)
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-emerald-900 font-mono print:text-black">
              {formatTaka(transaction.amount)}
            </div>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="pt-4 mt-1 border-t border-slate-300 flex items-end justify-between text-xs relative z-10">
          <div className="text-slate-500 text-[11px]">
            এন্ট্রি: <span className="font-bold text-slate-700">{transaction.entryBy || 'admin'}</span>
          </div>
          <div className="text-center">
            <div className="border-t border-slate-600 w-28 sm:w-36 pt-1 font-bold text-slate-800 text-[11px]">
              আদায়কারী / ক্যাশিয়ার
            </div>
          </div>
          <div className="text-right">
            <div className="border-t border-slate-600 w-32 sm:w-44 pt-1 font-bold text-slate-800 text-[11px]">
              মুহতামিম / পরিচালক
            </div>
            <div className="text-[10px] text-slate-600 font-semibold mt-0.5">
              {directorName}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative my-auto animate-in zoom-in-95 flex flex-col max-h-[95vh]">
        {/* Top Header & Actions */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isIncome ? 'ডিজিটাল মানি রসিদ স্লিপ' : 'ব্যয় ভাউচার স্লিপ'}
              </h3>
              <p className="text-xs text-white/60">প্রিন্ট বা PDF সংরক্ষণের জন্য প্রস্তুত</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectPrint}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer"
              title="সরাসরি প্রিন্টারে কমান্ড দিন"
            >
              <Printer className="w-4 h-4" />
              <span>সরাসরি প্রিন্ট</span>
            </button>

            <button
              onClick={handleOpenNewTab}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/15 transition-all active:scale-95 cursor-pointer"
              title="নতুন ট্যাবে ওপেন করে ব্রাউজারের প্রিন্ট ডায়ালগ ও PDF সেভ করুন"
            >
              <ExternalLink className="w-4 h-4 text-teal-300" />
              <span className="hidden sm:inline">নতুন ট্যাবে / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {printStatus && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{printStatus} (যদি প্রিন্টার না পায়, তবে <strong>'নতুন ট্যাবে / PDF'</strong> বাটনে চাপ দিন)</span>
          </div>
        )}

        {/* Slips Container */}
        <div id="printable-receipt-content" className="flex-1 overflow-y-auto pr-1 space-y-3">
          {renderSlip('গ্রাহক / দাতার কপি')}
          
          <div className="flex items-center justify-center gap-2 py-1 text-white/40 text-xs font-mono">
            <Scissors className="w-3.5 h-3.5" />
            <span>----------------- অফিস কাটিং মার্জিন -----------------</span>
          </div>

          {renderSlip('অফিস / ক্যাশ কপি')}
        </div>
      </div>
    </div>
  );
};
