import React from 'react';
import {
  Printer,
  X,
  CheckCircle2,
  Landmark,
  ShieldCheck,
  Calendar,
  Building,
  User,
  CreditCard
} from 'lucide-react';
import { MadrasaProfile, Transaction } from '../types';
import {
  DEPARTMENTS,
  formatBengaliDate,
  formatTaka,
  toBengaliNumber
} from '../utils/formatters';

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

  const handlePrint = () => {
    window.print();
  };

  const renderSlip = (copyType: 'গ্রাহক / দাতার কপি' | 'অফিস / ক্যাশ কপি') => {
    return (
      <div className="border-2 border-slate-800 rounded-xl p-5 bg-white relative overflow-hidden text-slate-900 mb-4 print:mb-8 print:border-black">
        {/* Watermark */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <Landmark className="w-48 h-48 text-black" />
        </div>

        {/* Slip Header */}
        <div className="text-center pb-3 border-b border-slate-700 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              {isIncome ? 'মানি রসিদ নং:' : 'ব্যয় ভাউচার নং:'} {transaction.receiptNo || transaction.voucherNo}
            </span>
            <span className="text-[11px] font-bold text-slate-700 uppercase bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              {copyType}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            {profile.name}
          </h2>
          <p className="text-xs text-slate-600 font-medium">{profile.address} • ফোন: {profile.phone}</p>
          
          <div className="mt-2 inline-block px-3 py-0.5 bg-slate-900 text-white font-bold text-xs rounded-full">
            {isIncome ? 'অফিশিয়াল আদায় ও মানি রসিদ' : 'অফিশিয়াল ব্যয় ভাউচার স্লিপ'}
          </div>
        </div>

        {/* Receipt Body Fields */}
        <div className="py-4 space-y-2.5 text-xs sm:text-sm relative z-10">
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
                <span className="text-slate-500 font-medium">
                  {isIncome ? 'টাকা প্রদানকারী / ছাত্র:' : 'টাকা গ্রহণকারী / ব্যক্তি:'}
                </span>{' '}
                <span className="font-extrabold text-slate-900 text-sm">
                  {transaction.payerOrPayee}
                </span>
                {transaction.contactNumber && (
                  <span className="text-xs text-slate-500 font-mono block mt-0.5">
                    মোবাইল: {transaction.contactNumber}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium block">পরিশোধের মাধ্যম</span>
                <span className="font-bold text-slate-800 text-xs">
                  {transaction.paymentMethod || 'নগদ (Cash)'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1">
            <div>
              <span className="text-slate-500 font-medium">খাত / বিবরণ:</span>{' '}
              <span className="font-bold text-slate-800">{transaction.category}</span>
            </div>
            {transaction.description && (
              <div className="text-xs text-slate-600 pl-4 italic">
                "{transaction.description}"
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="mt-3 p-3 bg-emerald-50 rounded-xl border-2 border-emerald-600 flex items-center justify-between print:border-black print:bg-transparent">
            <div>
              <span className="text-xs font-bold text-emerald-900 print:text-black uppercase block">
                {isIncome ? 'মোট আদায়কৃত টাকা' : 'মোট পরিশোধিত টাকা'}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                (সিস্টেম ভেরিফাইড ডিজিটাল এন্ট্রি)
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900 print:text-black">
              {formatTaka(transaction.amount)}
            </div>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="pt-6 mt-2 border-t border-slate-400 flex items-center justify-between text-xs relative z-10">
          <div className="text-slate-500 text-[11px]">
            এন্ট্রি কারক: <span className="font-bold text-slate-700">{transaction.entryBy || 'admin'}</span>
          </div>
          <div className="text-center">
            <div className="border-t border-slate-700 w-36 pt-1 font-bold text-slate-800">
              আদায়কারী / ক্যাশিয়ার স্বাক্ষর
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-300 relative my-auto animate-in zoom-in-95 print:p-0 print:border-none print:shadow-none print:bg-white">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {isIncome ? 'ডিজিটাল মানি রসিদ স্লিপ' : 'ব্যয় ভাউচার স্লিপ'}
              </h3>
              <p className="text-xs text-slate-500">প্রিন্ট বা সেভ করার জন্য তৈরি</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>মুদ্রণ করুন (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slips Container */}
        <div className="space-y-4 max-h-[75vh] overflow-y-auto p-1 print:max-h-none print:overflow-visible">
          {renderSlip('গ্রাহক / দাতার কপি')}
          {renderSlip('অফিস / ক্যাশ কপি')}
        </div>
      </div>
    </div>
  );
};
