import { Transaction, Student, AdvanceSettlement, User, MadrasaProfile, HawlatLoan } from '../types';

export const DEFAULT_MADRASA_PROFILE: MadrasaProfile = {
  name: 'মদিনাতুল উলূম মাদ্রাসা',
  tagline: 'দ্বীনি ও আধুনিক শিক্ষার এক অনন্য আদর্শ প্রতিষ্ঠান',
  address: 'হাতীমাড়া , ঘাটাইল, টাঙ্গাইল',
  phone: '01730605662, 01728422999',
  email: 'madinatululoom.ghatail@gmail.com',
  director: 'হাফেজ মাওলানা মোঃ হাবিবুল্লাহ বাহার এম এ',
  regNo: 'REG-GH-2015-884',
  established: '২০১৫ খ্রিষ্টাব্দ'
};

export const INITIAL_USERS: User[] = [
  {
    username: 'admin',
    name: 'হাফেজ মাওলানা মোঃ হাবিবুল্লাহ বাহার এম এ',
    role: 'পরিচালক / মুহতামিম',
    phone: '01730605662'
  },
  {
    username: 'accountant',
    name: 'হিসাবরক্ষক ও নাজের',
    role: 'হিসাবরক্ষক / নাজের',
    phone: '01728422999'
  }
];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_ADVANCES: AdvanceSettlement[] = [];

export const INITIAL_HAWLAT: HawlatLoan[] = [];

// Helper functions for local storage operations
const STORAGE_KEYS = {
  TRANSACTIONS: 'madrasa_erp_txns',
  STUDENTS: 'madrasa_erp_students',
  ADVANCES: 'madrasa_erp_advances',
  HAWLAT: 'madrasa_erp_hawlat',
  USERS: 'madrasa_erp_users',
  ACTIVE_USER: 'madrasa_erp_active_user',
  PROFILE: 'madrasa_erp_profile'
};

export function getStoredTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data !== null ? JSON.parse(data) : INITIAL_TRANSACTIONS;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(txns: Transaction[]) {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
}

export function getStoredStudents(): Student[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data !== null ? JSON.parse(data) : INITIAL_STUDENTS;
  } catch {
    return INITIAL_STUDENTS;
  }
}

export function saveStudents(students: Student[]) {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function getStoredAdvances(): AdvanceSettlement[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ADVANCES);
    return data !== null ? JSON.parse(data) : INITIAL_ADVANCES;
  } catch {
    return INITIAL_ADVANCES;
  }
}

export function saveAdvances(advs: AdvanceSettlement[]) {
  localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(advs));
}

export function getStoredHawlatLoans(): HawlatLoan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HAWLAT);
    return data !== null ? JSON.parse(data) : INITIAL_HAWLAT;
  } catch {
    return INITIAL_HAWLAT;
  }
}

export function saveHawlatLoans(loans: HawlatLoan[]) {
  localStorage.setItem(STORAGE_KEYS.HAWLAT, JSON.stringify(loans));
}

export function getStoredUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data !== null ? JSON.parse(data) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getActiveUser(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    return data !== null ? JSON.parse(data) : INITIAL_USERS[0];
  } catch {
    return INITIAL_USERS[0];
  }
}

export function setActiveUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  }
}

export function getMadrasaProfile(): MadrasaProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data !== null ? JSON.parse(data) : DEFAULT_MADRASA_PROFILE;
  } catch {
    return DEFAULT_MADRASA_PROFILE;
  }
}

export function saveMadrasaProfile(profile: MadrasaProfile) {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}
