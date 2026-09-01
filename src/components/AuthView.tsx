import React, { useState } from 'react';
import {
  Landmark,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
  UserCheck
} from 'lucide-react';
import { User as AppUser, MadrasaProfile } from '../types';
import { INITIAL_USERS } from '../utils/storage';

interface AuthViewProps {
  onLoginSuccess: (user: AppUser) => void;
  profile: MadrasaProfile;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  profile
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'মুহতামিম / প্রধান' | 'হিসাবরক্ষক / নাজের' | 'বিভাগীয় প্রধান'>('হিসাবরক্ষক / নাজের');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLoginMode) {
      const found = INITIAL_USERS.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (found) {
        onLoginSuccess(found);
      } else {
        // Create an ad-hoc session user if they typed a custom username
        const customUser: AppUser = {
          username: username.trim().toLowerCase(),
          name: username,
          role: 'হিসাবরক্ষক / নাজের'
        };
        onLoginSuccess(customUser);
      }
    } else {
      if (!fullName || !username) {
        setErrorMsg('অনুগ্রহ করে নাম এবং ইউজারনেম পূরণ করুন।');
        return;
      }
      const newUser: AppUser = {
        username: username.trim().toLowerCase(),
        name: fullName,
        role
      };
      onLoginSuccess(newUser);
    }
  };

  const handleQuickSelectUser = (u: AppUser) => {
    onLoginSuccess(u);
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Madrasa Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 items-center justify-center shadow-xl shadow-emerald-950/60 border border-emerald-400/40 text-white mb-3 backdrop-blur-md">
            <Landmark className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {profile.name}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-400 font-medium mt-1">
            মাদ্রাসার সমন্বিত হিসাব ও আধুনিক ERP ম্যানেজমেন্ট পোর্টাল
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/[0.05] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-white">
              {isLoginMode ? 'সিস্টেমে প্রবেশ / লগইন করুন' : 'নতুন একাউন্ট রেজিস্টার করুন'}
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              {isLoginMode
                ? 'আপনার ইউজারনেম ও পাসওয়ার্ড দিয়ে প্রবেশ করুন'
                : 'প্রশাসনিক একাউন্ট তৈরি করুন'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold backdrop-blur-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  আপনার পুরো নাম
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মাওলানা আব্দুল্লাহ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 rounded-xl p-3 text-white placeholder:text-white/30 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                ইউজারনেম (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="ইউজারনেম লিখুন (যেমন: admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 rounded-xl py-3 pl-10 pr-3 text-white placeholder:text-white/30 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="পাসওয়ার্ড লিখুন"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 rounded-xl py-3 pl-10 pr-3 text-white placeholder:text-white/30 focus:border-emerald-400 focus:bg-white/[0.09] focus:outline-hidden font-mono"
                />
              </div>
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  দায়িত্ব / পদবী
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-3 focus:border-emerald-400 focus:outline-hidden"
                >
                  <option value="মুহতামিম / প্রধান" className="bg-slate-900 text-white">মুহতামিম / প্রধান</option>
                  <option value="হিসাবরক্ষক / নাজের" className="bg-slate-900 text-white">হিসাবরক্ষক / নাজের</option>
                  <option value="বিভাগীয় প্রধান" className="bg-slate-900 text-white">বিভাগীয় প্রধান</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-2"
            >
              <span>{isLoginMode ? 'লগইন করুন' : 'নিবন্ধন সম্পন্ন করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Admin Access Box */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block text-center mb-2.5">
              অথবা সরাসরি অ্যাডমিন রোলে প্রবেশ করুন
            </span>

            <div className="space-y-2">
              {INITIAL_USERS.map((u, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickSelectUser(u)}
                  className="w-full text-left p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-400/40 flex items-center justify-between transition-all group backdrop-blur-xs active:scale-[0.99]"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-white/50 font-medium">
                        {u.role} ({u.username})
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    প্রবেশ →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-xs text-white/60 hover:text-emerald-300 font-semibold transition-colors"
            >
              {isLoginMode
                ? 'নতুন দায়িত্বশীল একাউন্ট তৈরি করতে চান? সাইনআপ করুন'
                : 'ইতিমধ্যে একাউন্ট আছে? লগইন করুন'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/40 mt-6">
          {profile.name} • মাদ্রাসা হিসাব ও ইআরপি সিস্টেম
        </p>
      </div>
    </div>
  );
};
