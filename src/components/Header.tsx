import React from 'react';
import {
  Menu,
  Bell,
  Search,
  PlusCircle,
  MinusCircle,
  Printer,
  Calendar,
  Wallet,
  Building,
  UserCheck
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { formatBengaliDate, formatTaka, toBengaliNumber } from '../utils/formatters';
import { MadrasaProfile, User } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMobileSidebar: () => void;
  totalCashInHand: number;
  currentUser: User | null;
  profile: MadrasaProfile;
  onOpenQuickIncome: () => void;
  onOpenQuickExpense: () => void;
  onQuickPrintReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileSidebar,
  totalCashInHand,
  currentUser,
  profile,
  onOpenQuickIncome,
  onOpenQuickExpense,
  onQuickPrintReport
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'ড্যাশবোর্ড ও আর্থিক খতিয়ান',
          subtitle: 'মাদ্রাসার সকল বিভাগ ও ফান্ডের সমন্বিত লাইভ ব্যালেন্স'
        };
      case 'income':
        return {
          title: 'আদায় ও জমা এন্ট্রি মডিউল',
          subtitle: 'শিক্ষার্থী ফি, সাধারণ অনুদান, যাকাত ও উন্নয়ন ফান্ড কালেকশন'
        };
      case 'expense':
        return {
          title: 'ব্যয় ও ভাউচার এন্ট্রি মডিউল',
          subtitle: 'উস্তাদ বেতন, বোর্ডিং বাজার, বিদ্যুৎ বিল ও বিবিধ ব্যয় এন্ট্রি'
        };
      case 'adjustment':
        return {
          title: 'অগ্রিম হিসাব সমন্বয় ও মেমো ভাউচার',
          subtitle: 'বাজার ও নির্দিষ্ট ব্যয়ের জন্য প্রদত্ত অ্যাডভান্স টাকার প্রকৃত খরচের সমন্বয়'
        };
      case 'students':
        return {
          title: 'শিক্ষার্থী ও মাসিক ফি কালেকশন',
          subtitle: 'সকল বিভাগের ছাত্র তালিকা, মাসিক বকেয়া ফি ও মানি রিসিট'
        };
      case 'cashbook':
        return {
          title: 'লেনদেন রেজিস্টার ও কেন্দ্রীয় ক্যাশ বই',
          subtitle: 'তারিখ ও বিভাগ অনুযায়ী ফিল্টার, সার্চ ও এক্সেল/সিএসভি এক্সপোর্ট'
        };
      case 'reports':
        return {
          title: 'অডিট ও প্রিন্ট উপযোগী আর্থিক রিপোর্ট',
          subtitle: 'দৈনিক, মাসিক, বার্ষিক ও ফান্ডভিত্তিক সমন্বিত হিসাব বিবরণী'
        };
      case 'settings':
        return {
          title: 'প্রতিষ্ঠান তথ্য ও ব্যাকআপ সেটিংস',
          subtitle: 'সিস্টেম ডাটা ব্যাকআপ, রিস্টোর ও মাদ্রাসার অফিশিয়াল তথ্য সম্পাদনা'
        };
      default:
        return { title: 'মদিনাতুল উলূম মাদ্রাসা ইআরপি', subtitle: '' };
    }
  };

  const { title, subtitle } = getTabTitle();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <header className="sticky top-0 z-30 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/20 no-print">
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 focus:outline-hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-semibold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-lg border border-emerald-500/30 backdrop-blur-xs">
                {profile.address.split(',')[0] || 'মাদ্রাসার হিসাব'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {title}
              </h2>
            </div>
            <p className="text-xs text-white/50 truncate hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Metrics & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Total Cash in Hand Pill */}
          <div className="flex items-center gap-2.5 bg-white/[0.06] backdrop-blur-xl border border-white/15 px-3.5 py-1.5 rounded-2xl shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-emerald-300/80 uppercase block tracking-wider leading-none">
                সর্বমোট নগদ ক্যাশ
              </span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-300">
                {formatTaka(totalCashInHand)}
              </span>
            </div>
          </div>

          {/* Quick Add Buttons (Hidden on small mobile) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenQuickIncome}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl shadow-xs transition-colors backdrop-blur-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>জমা এন্ট্রি</span>
            </button>
            <button
              onClick={onOpenQuickExpense}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl shadow-xs transition-colors backdrop-blur-xs"
            >
              <MinusCircle className="w-3.5 h-3.5 text-rose-300" />
              <span>খরচ এন্ট্রি</span>
            </button>
            <button
              onClick={onQuickPrintReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl transition-colors backdrop-blur-xs"
              title="রিপোর্ট প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5 text-white/80" />
              <span>রিপোর্ট</span>
            </button>
          </div>

          {/* Date Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 text-white/60 rounded-xl text-xs font-medium backdrop-blur-xs">
            <Calendar className="w-3.5 h-3.5 text-white/40" />
            <span>{formatBengaliDate(todayStr)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
