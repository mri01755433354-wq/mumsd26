import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  Phone,
  BookOpen,
  DollarSign,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Home,
  Bus
} from 'lucide-react';
import { DepartmentId, Student, StudentSubCategory, Transaction, User } from '../types';
import {
  DEPARTMENTS,
  MADRASA_CLASSES,
  MADRASA_SUB_CLASSES,
  formatTaka,
  generateReceiptNo,
  toBengaliNumber,
  formatBengaliDate
} from '../utils/formatters';

interface StudentsFeeViewProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onAddTransaction: (txn: Transaction) => void;
  transactions: Transaction[];
  onSelectReceipt: (txn: Transaction) => void;
  currentUser: User | null;
}

export const StudentsFeeView: React.FC<StudentsFeeViewProps> = ({
  students,
  onAddStudent,
  onAddTransaction,
  transactions,
  onSelectReceipt,
  currentUser
}) => {
  const currentMonthYear = new Date().toISOString().substring(0, 7); // e.g. "2026-09"
  const todayStr = new Date().toISOString().split('T')[0];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [quickPayStudent, setQuickPayStudent] = useState<Student | null>(null);
  const [quickPayAmount, setQuickPayAmount] = useState<string>('');
  const [quickPayMonth, setQuickPayMonth] = useState<string>('চলতি মাসের বেতন ও মেস ফি');

  // New Student Form state
  const [newRoll, setNewRoll] = useState<number>(students.length + 1);
  const [newName, setNewName] = useState('');
  const [newGuardian, setNewGuardian] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDept, setNewDept] = useState<DepartmentId>('nurani');
  const [newClass, setNewClass] = useState(MADRASA_CLASSES[0]);
  const [newSubCategory, setNewSubCategory] = useState<StudentSubCategory>('আবাসিক');
  const [newMonthlyFee, setNewMonthlyFee] = useState<string>('1500');
  const [newBoardingFee, setNewBoardingFee] = useState<string>('2000');
  const [newDiscount, setNewDiscount] = useState<string>('0');
  const [newAddress, setNewAddress] = useState('হাতীমাড়া, ঘাটাইল, টাঙ্গাইল');

  // Check paid students for the current month
  const paidStudentIdsThisMonth = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.type === 'income' && t.studentId && t.date.startsWith(currentMonthYear)) {
        set.add(t.studentId);
      }
    });
    return set;
  }, [transactions, currentMonthYear]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchDept = selectedDept === 'all' || s.departmentId === selectedDept;
      const matchClass = selectedClass === 'all' || s.classGroup === selectedClass;
      const matchSub = selectedSubCategory === 'all' || s.subCategory === selectedSubCategory;
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm) ||
        s.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll.toString().includes(searchTerm);
      return matchDept && matchClass && matchSub && matchSearch;
    });
  }, [students, selectedDept, selectedClass, selectedSubCategory, searchTerm]);

  // Summary Metrics
  const totalMonthlyReceivable = useMemo(() => {
    return students.reduce((acc, s) => {
      const net = s.monthlyFee + s.boardingFee - s.discount;
      return acc + (net > 0 ? net : 0);
    }, 0);
  }, [students]);

  const handleOpenQuickPay = (s: Student) => {
    setQuickPayStudent(s);
    const net = s.monthlyFee + s.boardingFee - s.discount;
    setQuickPayAmount(net > 0 ? net.toString() : '0');
  };

  const handleConfirmQuickPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPayStudent) return;
    const numAmount = parseFloat(quickPayAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('সঠিক ফি পরিমাণ উল্লেখ করুন।');
      return;
    }

    const newTxn: Transaction = {
      id: `TXN-ST-${Date.now()}`,
      receiptNo: generateReceiptNo('ST'),
      date: todayStr,
      type: 'income',
      departmentId: quickPayStudent.departmentId,
      category: '২. মাসিক বেতন (টিউশন ফি)',
      description: `${quickPayStudent.name} (রোল: ${toBengaliNumber(quickPayStudent.roll)}, ${quickPayStudent.classGroup} - ${quickPayStudent.subCategory || 'সাধারণ'}) - ${quickPayMonth}`,
      amount: numAmount,
      paymentMethod: 'নগদ (Cash)',
      payerOrPayee: quickPayStudent.guardianName || quickPayStudent.name,
      contactNumber: quickPayStudent.phone,
      studentId: quickPayStudent.id,
      entryBy: currentUser?.username || 'admin',
      createdAt: Date.now()
    };

    onAddTransaction(newTxn);
    setQuickPayStudent(null);
    onSelectReceipt(newTxn);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: `ST-${Date.now().toString().slice(-4)}`,
      roll: Number(newRoll) || students.length + 1,
      name: newName,
      guardianName: newGuardian,
      phone: newPhone,
      departmentId: newDept,
      classGroup: newClass,
      subCategory: newSubCategory,
      monthlyFee: parseFloat(newMonthlyFee) || 0,
      boardingFee: parseFloat(newBoardingFee) || 0,
      discount: parseFloat(newDiscount) || 0,
      address: newAddress,
      status: 'active',
      joinedDate: todayStr
    };

    onAddStudent(newStudent);
    setShowAddModal(false);

    // Reset Form
    setNewName('');
    setNewGuardian('');
    setNewPhone('');
    setNewRoll(students.length + 2);
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-1.5">
            মোট নথিভুক্ত শিক্ষার্থী
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {toBengaliNumber(students.length)}
            </span>
            <span className="text-xs text-white/60 font-medium">জন ছাত্র</span>
          </div>
          <p className="text-xs text-emerald-400 font-medium mt-1.5">
            সক্রিয় ক্লাসে উপস্থিত
          </p>
        </div>

        <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-1.5">
            চলতি মাসের নির্ধারিত পাওনা (Budgeted)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {formatTaka(totalMonthlyReceivable)}
            </span>
          </div>
          <p className="text-xs text-white/60 mt-1.5">টিউশন ও মেস ফি বাবদ</p>
        </div>

        <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-1.5">
            চলতি মাসের ফি পরিশোধ
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
              {toBengaliNumber(paidStudentIdsThisMonth.size)}
            </span>
            <span className="text-xs text-white/60 font-medium">
              / {toBengaliNumber(students.length)} জন ছাত্র
            </span>
          </div>
          <p className="text-xs text-amber-300 font-medium mt-1.5">
            বকেয়া: {toBengaliNumber(students.length - paidStudentIdsThisMonth.size)} জন
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        {/* Header and Filter */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02]">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2.5">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>শিক্ষার্থী তালিকা ও ফি কালেকশন</span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              শ্রেণি ও সাব-শ্রেণি (আবাসিক/অনাবাসিক/পরিবহন/বোর্ডিং) ভিত্তিক শিক্ষার্থী ডাটাবেস
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg border border-emerald-400/30 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>নতুন শিক্ষার্থী ভর্তি</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-white/[0.02] border-b border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ছাত্রের নাম / রোল / অভিভাবক / মোবাইল..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-hidden focus:border-emerald-400"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-white/[0.06] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-emerald-400"
            >
              <option value="all">সকল বিভাগ</option>
              {(Object.keys(DEPARTMENTS) as DepartmentId[]).map((k) => (
                <option key={k} value={k}>
                  {DEPARTMENTS[k].name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-white/[0.06] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-emerald-400"
            >
              <option value="all">সকল শ্রেণি</option>
              {MADRASA_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-white/[0.06] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-emerald-400"
            >
              <option value="all">সকল সাব-শ্রেণি (আবাসিক/অনাবাসিক)</option>
              {MADRASA_SUB_CLASSES.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">রোল</th>
                <th className="px-5 py-3.5">শিক্ষার্থীর নাম</th>
                <th className="px-5 py-3.5">বিভাগ ও শ্রেণি</th>
                <th className="px-5 py-3.5">সাব শ্রেণি</th>
                <th className="px-5 py-3.5">অভিভাবক ও মোবাইল</th>
                <th className="px-5 py-3.5 text-right">মাসিক ফি</th>
                <th className="px-5 py-3.5 text-center">চলতি মাসের স্ট্যাটাস</th>
                <th className="px-5 py-3.5 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-white/40">
                    কোনো শিক্ষার্থী পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const dept = DEPARTMENTS[s.departmentId];
                  const netFee = s.monthlyFee + s.boardingFee - s.discount;
                  const isPaidThisMonth = paidStudentIdsThisMonth.has(s.id);

                  return (
                    <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-white">
                        {toBengaliNumber(s.roll)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm">{s.name}</div>
                        <div className="text-[11px] text-white/50">{s.address}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-block px-2 py-0.5 rounded-lg text-[11px] font-semibold border"
                          style={{
                            backgroundColor: `${dept?.color}20`,
                            borderColor: `${dept?.color}40`,
                            color: '#ffffff'
                          }}
                        >
                          {dept?.shortName}
                        </span>
                        <div className="text-xs text-white/80 mt-0.5 font-medium">
                          {s.classGroup}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[11px] text-teal-300 font-medium">
                          {s.subCategory || 'আবাসিক'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-white font-medium">{s.guardianName}</div>
                        <div className="text-xs text-white/50 flex items-center gap-1 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-white/40" />
                          {s.phone}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="font-bold text-white font-mono">{formatTaka(netFee)}</div>
                        {s.discount > 0 && (
                          <div className="text-[10px] text-emerald-400 font-medium">
                            ছাড়: {formatTaka(s.discount)}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {isPaidThisMonth ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>পরিশোধিত</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span>বকেয়া</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenQuickPay(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>ফি গ্রহণ</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Pay Modal */}
      {quickPayStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c0d1e]/95 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-white/15 animate-in zoom-in-95">
            <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>মাসিক ফি গ্রহণ ও রসিদ তৈরি</span>
            </h3>
            <p className="text-xs text-white/60 mb-5">
              ছাত্র: <span className="font-bold text-white">{quickPayStudent.name}</span> (রোল: {toBengaliNumber(quickPayStudent.roll)}, {quickPayStudent.classGroup} - {quickPayStudent.subCategory || 'আবাসিক'})
            </p>

            <form onSubmit={handleConfirmQuickPay} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  ফি গ্রহণের বিবরণ / মাস
                </label>
                <input
                  type="text"
                  required
                  value={quickPayMonth}
                  onChange={(e) => setQuickPayMonth(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-emerald-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  টাকার পরিমাণ (টাকা)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={quickPayAmount}
                  onChange={(e) => setQuickPayAmount(e.target.value)}
                  className="w-full text-base font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 focus:border-emerald-400 focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setQuickPayStudent(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg border border-emerald-400/30 transition-all active:scale-95"
                >
                  জমা নিশ্চিত ও রসিদ প্রিন্ট
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c0d1e]/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-white/15 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2.5">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <span>নতুন শিক্ষার্থী ভর্তি ও তথ্য সংরক্ষণ</span>
            </h3>
            <p className="text-xs text-white/60 mb-5">
              মাদ্রাসার নতুন ছাত্রের নাম, বিভাগ, শ্রেণি ও সাব-শ্রেণি পূরণ করুন
            </p>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    রোল নং
                  </label>
                  <input
                    type="number"
                    required
                    value={newRoll}
                    onChange={(e) => setNewRoll(parseInt(e.target.value, 10))}
                    className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-emerald-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    বিভাগ
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as DepartmentId)}
                    className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-emerald-400 focus:outline-hidden"
                  >
                    {(Object.keys(DEPARTMENTS) as DepartmentId[]).map((k) => (
                      <option key={k} value={k} className="bg-slate-900 text-white">
                        {DEPARTMENTS[k].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Class and Sub-Class */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    শ্রেণি <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-emerald-400 focus:outline-hidden"
                  >
                    {MADRASA_CLASSES.map((cls) => (
                      <option key={cls} value={cls} className="bg-slate-900 text-white">
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    সাব শ্রেণি <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value as StudentSubCategory)}
                    className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white rounded-xl p-2.5 focus:border-emerald-400 focus:outline-hidden"
                  >
                    {MADRASA_SUB_CLASSES.map((sub) => (
                      <option key={sub} value={sub} className="bg-slate-900 text-white">
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  ছাত্রের পুরো নাম <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মুহাম্মাদ তালহা"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 rounded-xl p-2.5 focus:border-emerald-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    অভিভাবকের নাম
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোঃ নজরুল ইসলাম"
                    value={newGuardian}
                    onChange={(e) => setNewGuardian(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 rounded-xl p-2.5 focus:border-emerald-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 rounded-xl p-2.5 font-mono focus:border-emerald-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 mb-1.5">
                    মাসিক টিউশন ফি
                  </label>
                  <input
                    type="number"
                    value={newMonthlyFee}
                    onChange={(e) => setNewMonthlyFee(e.target.value)}
                    className="w-full text-xs bg-white/[0.06] border border-white/15 text-white rounded-xl p-2 font-mono focus:border-emerald-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 mb-1.5">
                    মেস / বোর্ডিং ফি
                  </label>
                  <input
                    type="number"
                    value={newBoardingFee}
                    onChange={(e) => setNewBoardingFee(e.target.value)}
                    className="w-full text-xs bg-white/[0.06] border border-white/15 text-white rounded-xl p-2 font-mono focus:border-emerald-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 mb-1.5">
                    বিশেষ ছাড় (Discount)
                  </label>
                  <input
                    type="number"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(e.target.value)}
                    className="w-full text-xs bg-white/[0.06] border border-white/15 text-white rounded-xl p-2 font-mono focus:border-emerald-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  ঠিকানা
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 rounded-xl p-2.5 focus:border-emerald-400 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg border border-emerald-400/30 transition-all active:scale-95"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
