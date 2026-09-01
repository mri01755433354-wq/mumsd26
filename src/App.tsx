import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { IncomeView } from './components/IncomeView';
import { ExpenseView } from './components/ExpenseView';
import { HawlatTransferView } from './components/HawlatTransferView';
import { AdjustmentView } from './components/AdjustmentView';
import { StudentsFeeView } from './components/StudentsFeeView';
import { CashBookView } from './components/CashBookView';
import { ReportsView } from './components/ReportsView';
import { SettingsModal } from './components/SettingsModal';
import { MoneyReceiptModal } from './components/MoneyReceiptModal';
import { AuthView } from './components/AuthView';
import {
  Transaction,
  Student,
  AdvanceSettlement,
  User,
  MadrasaProfile,
  HawlatLoan
} from './types';
import {
  getStoredTransactions,
  saveTransactions,
  getStoredStudents,
  saveStudents,
  getStoredAdvances,
  saveAdvances,
  getStoredHawlatLoans,
  saveHawlatLoans,
  getActiveUser,
  setActiveUser,
  getMadrasaProfile,
  saveMadrasaProfile
} from './utils/storage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getActiveUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core Datasets
  const [transactions, setTransactions] = useState<Transaction[]>(() => getStoredTransactions());
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [advances, setAdvances] = useState<AdvanceSettlement[]>(() => getStoredAdvances());
  const [hawlatLoans, setHawlatLoans] = useState<HawlatLoan[]>(() => getStoredHawlatLoans());
  const [profile, setProfile] = useState<MadrasaProfile>(() => getMadrasaProfile());

  // Modal for Money Receipt / Voucher Printing
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState<Transaction | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveAdvances(advances);
  }, [advances]);

  useEffect(() => {
    saveHawlatLoans(hawlatLoans);
  }, [hawlatLoans]);

  useEffect(() => {
    saveMadrasaProfile(profile);
  }, [profile]);

  useEffect(() => {
    setActiveUser(currentUser);
  }, [currentUser]);

  // Overall Total Cash in Hand
  const totalCashInHand = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      else if (t.type === 'expense') exp += t.amount;
    });
    return inc - exp;
  }, [transactions]);

  // Pending Advances Count
  const pendingAdvanceCount = useMemo(() => {
    return advances.filter((a) => a.status === 'pending').length;
  }, [advances]);

  // Active Hawlat Loans Count
  const activeHawlatCount = useMemo(() => {
    return hawlatLoans.filter(
      (l) => l.status === 'active' || l.status === 'partial'
    ).length;
  }, [hawlatLoans]);

  // Recent Incomes & Expenses
  const recentIncomes = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 10);
  }, [transactions]);

  const recentExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 10);
  }, [transactions]);

  // Handlers
  const handleAddTransaction = (newTxn: Transaction) => {
    setTransactions((prev) => [newTxn, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
  };

  const handleAddAdvanceSettlement = (
    settlement: AdvanceSettlement,
    autoTxn?: Transaction
  ) => {
    setAdvances((prev) => [settlement, ...prev]);
    if (autoTxn) {
      handleAddTransaction(autoTxn);
    }
  };

  const handleAddHawlatLoan = (loan: HawlatLoan) => {
    setHawlatLoans((prev) => [loan, ...prev]);
  };

  const handleRepayHawlatLoan = (
    loanId: string,
    repayAmount: number
  ) => {
    setHawlatLoans((prev) =>
      prev.map((loan) => {
        if (loan.id === loanId) {
          const newRepaid = loan.repaidAmount + repayAmount;
          const isFullyRepaid = newRepaid >= loan.amount;
          return {
            ...loan,
            repaidAmount: newRepaid,
            status: isFullyRepaid ? 'repaid' : 'partial'
          };
        }
        return loan;
      })
    );
  };

  const handleRestoreAllData = (data: {
    transactions: Transaction[];
    students: Student[];
    advances: AdvanceSettlement[];
    profile: MadrasaProfile;
    hawlatLoans?: HawlatLoan[];
  }) => {
    setTransactions(data.transactions);
    setStudents(data.students);
    setAdvances(data.advances);
    setProfile(data.profile);
    if (data.hawlatLoans) {
      setHawlatLoans(data.hawlatLoans);
    }
  };

  const handleLogout = () => {
    if (window.confirm('আপনি কি নিশ্চিতভাবে সিস্টেমে লগআউট করতে চান?')) {
      setCurrentUser(null);
    }
  };

  // If unauthenticated, show Auth Screen
  if (!currentUser) {
    return (
      <AuthView
        profile={profile}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white flex flex-col antialiased relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Ambient Frosted Glow Orbs */}
      <div className="fixed top-[-180px] left-[-150px] w-[550px] h-[550px] bg-purple-600/20 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-[30%] right-[15%] w-[380px] h-[380px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[20%] left-[20%] w-[320px] h-[320px] bg-teal-500/10 rounded-full blur-[90px] pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        profile={profile}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        pendingAdvanceCount={pendingAdvanceCount}
        activeHawlatCount={activeHawlatCount}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen relative z-10">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          totalCashInHand={totalCashInHand}
          currentUser={currentUser}
          profile={profile}
          onOpenQuickIncome={() => setActiveTab('income')}
          onOpenQuickExpense={() => setActiveTab('expense')}
          onQuickPrintReport={() => setActiveTab('reports')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              advances={advances}
              profile={profile}
              setActiveTab={setActiveTab}
              onSelectReceipt={(txn) => setSelectedReceiptTxn(txn)}
              onOpenQuickIncome={() => setActiveTab('income')}
              onOpenQuickExpense={() => setActiveTab('expense')}
            />
          )}

          {activeTab === 'income' && (
            <IncomeView
              students={students}
              onAddTransaction={handleAddTransaction}
              recentIncomes={recentIncomes}
              onSelectReceipt={(txn) => setSelectedReceiptTxn(txn)}
              currentUser={currentUser}
              hawlatLoans={hawlatLoans}
              onRepayHawlatLoan={handleRepayHawlatLoan}
            />
          )}

          {activeTab === 'expense' && (
            <ExpenseView
              onAddTransaction={handleAddTransaction}
              recentExpenses={recentExpenses}
              onSelectReceipt={(txn) => setSelectedReceiptTxn(txn)}
              currentUser={currentUser}
              totalCashInHand={totalCashInHand}
              transactions={transactions}
              hawlatLoans={hawlatLoans}
              onAddHawlatLoan={handleAddHawlatLoan}
              onNavigateToHawlat={() => setActiveTab('hawlat')}
            />
          )}

          {activeTab === 'hawlat' && (
            <HawlatTransferView
              transactions={transactions}
              hawlatLoans={hawlatLoans}
              onAddHawlatLoan={handleAddHawlatLoan}
              onRepayHawlatLoan={handleRepayHawlatLoan}
              profile={profile}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'adjustment' && (
            <AdjustmentView
              advances={advances}
              onAddAdvanceSettlement={handleAddAdvanceSettlement}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'students' && (
            <StudentsFeeView
              students={students}
              onAddStudent={handleAddStudent}
              onAddTransaction={handleAddTransaction}
              transactions={transactions}
              onSelectReceipt={(txn) => setSelectedReceiptTxn(txn)}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'cashbook' && (
            <CashBookView
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onSelectReceipt={(txn) => setSelectedReceiptTxn(txn)}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              transactions={transactions}
              profile={profile}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsModal
              profile={profile}
              onUpdateProfile={(p) => setProfile(p)}
              transactions={transactions}
              students={students}
              advances={advances}
              onRestoreAllData={handleRestoreAllData}
              currentUser={currentUser}
            />
          )}
        </main>
      </div>

      {/* Printable Money Receipt Modal */}
      {selectedReceiptTxn && (
        <MoneyReceiptModal
          transaction={selectedReceiptTxn}
          profile={profile}
          onClose={() => setSelectedReceiptTxn(null)}
        />
      )}
    </div>
  );
}
