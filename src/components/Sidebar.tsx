import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  BookOpen,
  Users,
  FileText,
  Settings,
  LogOut,
  Building2,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Landmark,
  ArrowRightLeft
} from 'lucide-react';
import { MadrasaProfile, User } from '../types';

export type ActiveTab =
  | 'dashboard'
  | 'income'
  | 'expense'
  | 'hawlat'
  | 'adjustment'
  | 'students'
  | 'cashbook'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  profile: MadrasaProfile;
  onLogout: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  pendingAdvanceCount: number;
  activeHawlatCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  profile,
  onLogout,
  isOpenMobile,
  setIsOpenMobile,
  pendingAdvanceCount,
  activeHawlatCount = 0
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'ড্যাশবোর্ড ওভারভিউ',
      icon: LayoutDashboard,
      badge: null,
      desc: 'ক্যাশ ব্যালেন্স ও রিয়েলটাইম পরিসংখ্যান'
    },
    {
      id: 'income' as ActiveTab,
      label: 'আদায় ও জমা এন্ট্রি',
      icon: PlusCircle,
      badge: '+আয়',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      desc: 'ফি, অনুদান, যাকাত ও ফান্ড কালেকশন'
    },
    {
      id: 'expense' as ActiveTab,
      label: 'ব্যয় ও ভাউচার এন্ট্রি',
      icon: MinusCircle,
      badge: '-ব্যয়',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      desc: 'বেতন, বাজার, বিল ও প্রতিষ্ঠান পরিচালনা'
    },
    {
      id: 'hawlat' as ActiveTab,
      label: 'ফান্ড ট্রান্সফার ও হাওলাত',
      icon: ArrowRightLeft,
      badge: activeHawlatCount > 0 ? `${activeHawlatCount} বকেয়া` : 'ট্রান্সফার',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      desc: 'বিভাগীয় ঋণ, ধার ও স্বয়ংক্রিয় ফেরত'
    },
    {
      id: 'adjustment' as ActiveTab,
      label: 'অগ্রিম ও সমন্বয় হিসাব',
      icon: RefreshCw,
      badge: pendingAdvanceCount > 0 ? `${pendingAdvanceCount}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      desc: 'বাজার ও খরচের অ্যাডভান্স সমন্বয়'
    },
    {
      id: 'students' as ActiveTab,
      label: 'শিক্ষার্থী ও ফি রসিদ',
      icon: Users,
      badge: 'ফি বুক',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      desc: 'ছাত্র তালিকা, মাসিক ফি ও বকেয়া'
    },
    {
      id: 'cashbook' as ActiveTab,
      label: 'লেনদেন রেজিস্টার ও খতিয়ান',
      icon: BookOpen,
      badge: 'খতিয়ান',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      desc: 'সকল লেনদেনের বিস্তারিত ইতিহাস ও এক্সপোর্ট'
    },
    {
      id: 'reports' as ActiveTab,
      label: 'অডিট ও হিসাব বিবরণী',
      icon: FileText,
      badge: 'রিপোর্ট',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      desc: 'মাসিক, বার্ষিক ও জাকাত অডিট প্রিন্ট'
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white/[0.04] backdrop-blur-2xl text-white flex flex-col border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Madrasa Brand Header */}
        <div className="p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-white/20 text-white flex-shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base text-white tracking-wide truncate" title={profile.name}>
                {profile.name || 'মাদ্রাসার নাম'}
              </h1>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse inline-block"></span>
                ERP & একাউন্টিং
              </p>
            </div>
          </div>
        </div>

        {/* User Role Card */}
        <div className="px-4 py-3 bg-white/[0.05] border border-white/10 backdrop-blur-xl mx-3 my-3 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500/30 to-teal-500/30 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold text-sm">
              {currentUser?.name ? currentUser.name.charAt(0) : 'ম'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser?.name || 'অ্যাডমিন ইউজার'}
              </p>
              <p className="text-[10px] text-emerald-300 font-medium truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {currentUser?.role || 'মুহতামিম / প্রধান'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            title="সেটিংস"
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu Items */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-2">
          <div className="px-3 pb-1 text-[11px] font-semibold text-white/40 uppercase tracking-widest">
            প্রধান মডিউলসমূহ
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full group text-left px-3.5 py-3 rounded-2xl flex items-center justify-between transition-all duration-200 border ${
                  isActive
                    ? 'bg-white/15 border-white/20 text-white font-semibold shadow-lg shadow-black/25 backdrop-blur-md'
                    : 'bg-transparent border-transparent text-white/65 hover:bg-white/[0.07] hover:text-white hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-xs'
                        : 'bg-white/5 border border-white/10 text-white/70 group-hover:text-emerald-300 group-hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm tracking-tight">{item.label}</div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-xs ${
                      isActive
                        ? 'bg-white text-slate-950 border-white font-extrabold'
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/10 space-y-1.5 bg-white/[0.02]">
          <button
            onClick={() => {
              setActiveTab('settings');
              setIsOpenMobile(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
              activeTab === 'settings'
                ? 'bg-white/15 border-white/20 text-white font-semibold'
                : 'border-transparent text-white/60 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-white/60" />
            <span>সিস্টেম ও ব্যাকআপ সেটিংস</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 border border-transparent hover:border-rose-500/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </aside>
    </>
  );
};
