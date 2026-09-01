export type DepartmentId = 'nurani' | 'ebtedayi' | 'hefzo' | 'boarding' | 'director';

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  shortName: string;
  color: string;
  bgLight: string;
  borderLight: string;
  icon: string;
  description: string;
}

export type TransactionType =
  | 'income'
  | 'expense'
  | 'advance_given'
  | 'advance_settled'
  | 'fund_transfer'
  | 'hawlat_given'
  | 'hawlat_repay';

export type PaymentMethod =
  | 'নগদ (Cash)'
  | 'ব্যাংক ট্রান্সফার'
  | 'বিকাশ/নগদ (MFS)'
  | 'চেক (Cheque)';

export interface Transaction {
  id: string;
  receiptNo: string;
  date: string;
  type: TransactionType;
  departmentId: DepartmentId;
  category: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  payerOrPayee: string;
  contactNumber?: string;
  studentId?: string;
  voucherNo?: string;
  entryBy: string;
  remarks?: string;
  fromDepartmentId?: DepartmentId;
  toDepartmentId?: DepartmentId;
  hawlatLoanId?: string;
  createdAt: number;
}

export type StudentSubCategory =
  | 'আবাসিক'
  | 'অনাবাসিক (সাধারণ)'
  | 'বোর্ডিং / মেস'
  | 'পরিবহন / ডে-কেয়ার'
  | 'অন্যান্য';

export interface Student {
  id: string;
  roll: number;
  name: string;
  guardianName: string;
  phone: string;
  departmentId: DepartmentId;
  classGroup: string;
  subCategory?: StudentSubCategory;
  monthlyFee: number;
  boardingFee: number;
  discount: number;
  address: string;
  status: 'active' | 'inactive';
  joinedDate: string;
}

export interface AdvanceSettlement {
  id: string;
  date: string;
  departmentId: DepartmentId;
  personName: string;
  purpose: string;
  advanceAmount: number;
  actualExpense: number;
  difference: number; // positive = refund to cash, negative = additional payment from cash
  status: 'settled' | 'pending';
  receiptNo: string;
  voucherNo: string;
  createdAt: number;
}

export interface HawlatLoan {
  id: string;
  voucherNo: string;
  date: string;
  fromDepartmentId: DepartmentId; // যে বিভাগ ফান্ড দিয়েছে
  toDepartmentId: DepartmentId;   // যে বিভাগে ফান্ড ধার নেওয়া হয়েছে
  amount: number;
  repaidAmount: number;
  purpose: string;
  status: 'active' | 'repaid' | 'partial';
  createdAt: number;
  repaidAt?: number;
}

export interface User {
  username: string;
  name: string;
  role: 'পরিচালক / মুহতামিম' | 'হিসাবরক্ষক / নাজের' | 'বিভাগীয় প্রধান';
  phone?: string;
  password?: string;
}

export interface MadrasaProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  director: string;
  regNo: string;
  established: string;
}

