import React, { useState } from 'react';
import {
  Building2,
  Save,
  CheckCircle2,
  Upload,
  Download,
  AlertTriangle,
  FileJson,
  FileSpreadsheet,
  Trash2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Landmark,
  UserCheck,
  Settings
} from 'lucide-react';
import {
  MadrasaProfile,
  Transaction,
  Student,
  AdvanceSettlement,
  User
} from '../types';
import { DEPARTMENTS, formatTaka } from '../utils/formatters';

interface SettingsModalProps {
  profile: MadrasaProfile;
  onUpdateProfile: (profile: MadrasaProfile) => void;
  transactions: Transaction[];
  students: Student[];
  advances: AdvanceSettlement[];
  onRestoreAllData: (data: {
    transactions: Transaction[];
    students: Student[];
    advances: AdvanceSettlement[];
    profile: MadrasaProfile;
  }) => void;
  currentUser: User | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  onUpdateProfile,
  transactions,
  students,
  advances,
  onRestoreAllData,
  currentUser
}) => {
  const [name, setName] = useState(profile.name);
  const [tagline, setTagline] = useState(profile.tagline);
  const [address, setAddress] = useState(profile.address);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [director, setDirector] = useState(
    profile.director || 'হাফেজ মাওলানা মোঃ হাবিবুল্লাহ বাহার এম এ'
  );
  const [regNo, setRegNo] = useState(profile.regNo);
  const [established, setEstablished] = useState(profile.established);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: MadrasaProfile = {
      name,
      tagline,
      address,
      phone,
      email,
      director,
      regNo,
      established
    };
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Export full system backup JSON
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      profile: {
        name,
        tagline,
        address,
        phone,
        email,
        director,
        regNo,
        established
      },
      transactions,
      students,
      advances
    };

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `madrasa_erp_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.transactions)) {
            const confirmed = window.confirm(
              `ব্যাকআপ ফাইল হতে ${parsed.transactions.length}টি লেনদেন ও ${
                parsed.students?.length || 0
              } জন শিক্ষার্থীর তথ্য রিস্টোর করতে চান? এটি বর্তমান তথ্য প্রতিস্থাপন করবে।`
            );
            if (confirmed) {
              onRestoreAllData({
                transactions: parsed.transactions || [],
                students: parsed.students || [],
                advances: parsed.advances || [],
                profile: parsed.profile || profile
              });
              alert('সিস্টেম সফলভাবে রিস্টোর হয়েছে!');
            }
          } else {
            alert('ভুল ব্যাকআপ ফাইল ফরম্যাট।');
          }
        } catch {
          alert('ফাইল লোড করতে সমস্যা হয়েছে। দয়া করে সঠিক JSON ফাইল নির্বাচন করুন।');
        }
      };
    }
  };

  // Fresh Start State
  const [openingBalance, setOpeningBalance] = useState<string>('0');
  const [clearStudentsChoice, setClearStudentsChoice] = useState(false);
  const [showCleanModal, setShowCleanModal] = useState(false);

  const handleStartFreshAccount = () => {
    const obAmount = parseFloat(openingBalance) || 0;

    let newTxns: Transaction[] = [];
    if (obAmount > 0) {
      newTxns = [
        {
          id: `TXN-OB-${Date.now()}`,
          receiptNo: 'OB-001',
          date: new Date().toISOString().split('T')[0],
          type: 'income',
          departmentId: 'director',
          category: '২০. অন্যান্য প্রাপ্তি / বিশেষ অনুদান',
          description: 'হিসাব শুরুর নগদ প্রারম্ভিক জের / Opening Balance',
          amount: obAmount,
          paymentMethod: 'নগদ (Cash)',
          payerOrPayee: 'মাদ্রাসার মূল ক্যাশ ফান্ড',
          entryBy: currentUser?.username || 'admin',
          createdAt: Date.now()
        }
      ];
    }

    onRestoreAllData({
      transactions: newTxns,
      students: clearStudentsChoice ? [] : students,
      advances: [],
      profile: {
        name,
        tagline,
        address,
        phone,
        email,
        director,
        regNo,
        established
      }
    });

    setShowCleanModal(false);
    alert(
      `অভিনন্দন! আপনার মাদ্রাসার জন্য সম্পূর্ণ ফ্রেশ ও পরিষ্কার হিসাব শুরু হয়েছে।\nমোট ক্যাশ স্থিতি: ৳${obAmount.toLocaleString(
        'en-BD'
      )}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 text-white flex items-center justify-center font-bold">
            <Settings className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white">
              সিস্টেম ও মাদ্রাসার অফিশিয়াল কনফিগারেশন
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              মানি রসিদ ও অডিট রিপোর্টের নাম, ঠিকানা এবং ডাটা ব্যাকআপ সংরক্ষণ
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-2 rounded-xl backdrop-blur-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>সফলভাবে সংরক্ষিত হয়েছে!</span>
          </span>
        )}
      </div>

      {/* PROMINENT FRESH START CARD */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-teal-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>বাস্তব হিসাব শুরুর সুবিধা (Fresh Clean Ledger)</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              সকল ডেমো হিসাব মুছে আপনার মাদ্রাসার আসল হিসাব শুরু করুন
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              পূর্বের ডেমো ডাটাগুলো আপনার মাদ্রাসার সাথে মিলবে না। তাই এক ক্লিকে সমস্ত পূর্ববর্তী ডেমো লেনদেন মুছে ০ ব্যালেন্স অথবা আপনার বর্তমান ক্যাশ টাকা দিয়ে ফ্রেশ হিসাব খতিয়ান চালু করুন।
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCleanModal(true)}
            className="shrink-0 px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-950/50 border border-emerald-300/40 flex items-center justify-center gap-2.5 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>সম্পূর্ণ ফ্রেশ নতুন হিসাব শুরু করুন</span>
          </button>
        </div>
      </div>

      {/* Fresh Start Confirmation & Configuration Modal */}
      {showCleanModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">
                  ফ্রেশ হিসাব সেটআপ ও ডেমো ডাটা ক্লিন
                </h4>
                <p className="text-xs text-white/60">
                  সিস্টেমের সমস্ত পূর্বের লেনদেন রিসেট হবে
                </p>
              </div>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-300">
                <AlertTriangle className="w-4 h-4" />
                <span>সতর্কবার্তা:</span>
              </div>
              <p>
                এই বাটনে চাপ দিলে বর্তমানের সকল আয়, ব্যয় এবং অগ্রিম সমন্বয় ভাউচার মুছে যাবে।
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1.5">
                  আজকের বাস্তব উদ্বৃত্ত / প্রারম্ভিক ক্যাশ ব্যালেন্স (যদি থাকে)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">
                    ৳
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="w-full bg-white/[0.06] border border-emerald-400/30 text-white rounded-xl py-2.5 pl-8 pr-3 font-mono font-bold focus:outline-hidden focus:border-emerald-400"
                  />
                </div>
                <span className="text-[11px] text-white/50 mt-1 block">
                  হাতে থাকা ক্যাশ টাকা দিয়ে শুরু করতে চাইলে টাকার পরিমাণ লিখুন, অথবা ০ রাখুন।
                </span>
              </div>

              <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="clearStudents"
                  checked={clearStudentsChoice}
                  onChange={(e) => setClearStudentsChoice(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-0 focus:outline-hidden cursor-pointer"
                />
                <label
                  htmlFor="clearStudents"
                  className="text-xs text-white/80 cursor-pointer"
                >
                  শিক্ষার্থী তালিকাও সম্পূর্ণ খালি করে নতুন করে এন্ট্রি করতে চান
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCleanModal(false)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white/80 text-xs font-semibold rounded-xl transition-all"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleStartFreshAccount}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all active:scale-95"
              >
                হ্যাঁ, ক্লিন হিসাব শুরু করুন
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Edit Form (7 cols) */}
        <div className="lg:col-span-7 bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 bg-white/[0.03] border-b border-white/10 text-white flex items-center justify-between">
            <h4 className="font-bold text-sm sm:text-base flex items-center gap-2.5">
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>মাদ্রাসার পরিচয় ও রসিদের হেডার তথ্য</span>
            </h4>
          </div>

          <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                মাদ্রাসার পুরো নাম <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 rounded-xl p-3 font-bold text-white focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                মুহতামিম / পরিচালকের নাম <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 rounded-xl p-3 text-white focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                স্লোগান / ট্যাগলাইন
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 rounded-xl p-3 text-white focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                ঠিকানা ও অবস্থান <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 rounded-xl p-3 text-white focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  মোবাইল / হেল্পলাইন নম্বর
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 rounded-xl p-3 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  ইমেইল অ্যাড্রেস
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 rounded-xl p-3 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  রেজিস্ট্রেশন / স্বীকৃতি নম্বর
                </label>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 rounded-xl p-3 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  স্থাপিত সাল
                </label>
                <input
                  type="text"
                  value={established}
                  onChange={(e) => setEstablished(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 rounded-xl p-3 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-2"
            >
              <Save className="w-4 h-4" />
              <span>প্রতিষ্ঠান তথ্য সংরক্ষণ করুন</span>
            </button>
          </form>
        </div>

        {/* Data Backup & Restore & Security (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Backup & Export Box */}
          <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl space-y-4">
            <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <FileJson className="w-4 h-4 text-emerald-400" />
              <span>নিরাপদ ডাটা ব্যাকআপ ও এক্সপোর্ট</span>
            </h4>
            <p className="text-xs text-white/60 leading-relaxed">
              মাদ্রাসার সমস্ত হিসাব, শিক্ষার্থী তথ্য ও ভাউচার এক ক্লিকে অফলাইন JSON ফাইল হিসেবে ডাউনলোড করে নিজের কম্পিউটার বা পেনড্রাইভে সুরক্ষিত রাখুন।
            </p>

            <button
              onClick={handleExportBackup}
              className="w-full py-3 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/15 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>ব্যাকআপ JSON ফাইল ডাউনলোড করুন</span>
            </button>
          </div>

          {/* Restore Box */}
          <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl space-y-4">
            <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-400" />
              <span>ডাটা রিস্টোর (Restore from Backup)</span>
            </h4>
            <p className="text-xs text-white/60 leading-relaxed">
              পূর্বে ডাউনলোড করা কোনো ব্যাকআপ JSON ফাইল আপলোড করে সিস্টেম ফিরিয়ে আনুন।
            </p>

            <label className="w-full py-3 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/15 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98">
              <Upload className="w-4 h-4 text-teal-400" />
              <span>ব্যাকআপ ফাইল আপলোড করুন</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
