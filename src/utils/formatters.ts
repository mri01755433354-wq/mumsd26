import { DepartmentId, DepartmentInfo } from '../types';

export const DEPARTMENTS: Record<DepartmentId, DepartmentInfo> = {
  nurani: {
    id: 'nurani',
    name: 'নূরানী বিভাগ',
    shortName: 'নূরানী',
    color: '#0284c7', // Sky blue
    bgLight: '#f0f9ff',
    borderLight: '#bae6fd',
    icon: 'Baby',
    description: 'নূরানী শিশু ও মক্তব শিক্ষা বিভাগ'
  },
  ebtedayi: {
    id: 'ebtedayi',
    name: 'এবতেদায়ী বিভাগ',
    shortName: 'এবতেদায়ী',
    color: '#16a34a', // Green
    bgLight: '#f0fdf4',
    borderLight: '#bbf7d0',
    icon: 'BookOpen',
    description: 'প্রাথমিক কিতাব ও সাধারণ শিক্ষা'
  },
  hefzo: {
    id: 'hefzo',
    name: 'হেফজ / নাজেরা বিভাগ',
    shortName: 'হেফজ/নাজেরা',
    color: '#9333ea', // Purple
    bgLight: '#faf5ff',
    borderLight: '#e9d5ff',
    icon: 'BookMarked',
    description: 'হিফজুল কুরআন ও নাজেরা শাখা'
  },
  boarding: {
    id: 'boarding',
    name: 'বোর্ডিং ও মেস বিভাগ',
    shortName: 'বোর্ডিং',
    color: '#d97706', // Amber
    bgLight: '#fffbeb',
    borderLight: '#fde68a',
    icon: 'Utensils',
    description: 'ছাত্রাবাস, লিল্লাহ বোর্ডিং ও খাদ্য ব্যবস্থা'
  },
  director: {
    id: 'director',
    name: 'পরিচালক ও সাধারণ তহবিল',
    shortName: 'পরিচালক',
    color: '#0f766e', // Teal
    bgLight: '#f0fdfa',
    borderLight: '#99f6e4',
    icon: 'Building2',
    description: 'পরিচালক ফান্ড, অবকাঠামো ও প্রশাসনিক তহবিল'
  }
};

export const INCOME_CATEGORIES = [
  '১. ছাত্র ভর্তি ফি',
  '২. মাসিক বেতন (টিউশন ফি)',
  '৩. খোরাকি বা বোর্ডিং ফি',
  '৪. পরীক্ষা ফি',
  '৫. জাকাত ফান্ড',
  '৬. সাধারণ সদকা ও দান',
  '৭. ফিতরা ও কোরবানির চামড়া',
  '৮. মানতের দান বা পশু',
  '৯. নিয়মিত চাঁদা (মুশাহারা)',
  '১০. বার্ষিক মাহফিলের কালেকশন',
  '১১. ওয়াকফ সম্পত্তির আয়',
  '১২. দোকান বা রুম ভাড়া',
  '১৩. মাদ্রাসা বুকস্টল ও লাইব্রেরি',
  '১৪. কেন্টিন পরিচালনা',
  '১৫. কম্পিউটার ও কালার প্রিন্টিং সেবা',
  '১৬. পুকুরে মাছ চাষ',
  '১৭. গবাদি পশু ও হাঁস-মুরগি পালন',
  '১৮. ফল ও বনজ গাছগাছালি বিক্রি',
  '১৯. মৌসুমি কৃষি ফসল',
  '২০. হস্তশিল্প ও টুপি বিক্রি'
];

export const EXPENSE_CATEGORIES = [
  '১. শিক্ষক ও কর্মচারীদের বেতন',
  '২. বোর্ডিংয়ের খাবার খরচ',
  '৩. বিদ্যুৎ, গ্যাস ও পানির বিল',
  '৪. ঘর/জমি ভাড়া',
  '৫. আসবাবপত্র ক্রয় ও মেরামত',
  '৬. ভবন নির্মাণ ও রক্ষণাবেক্ষণ',
  '৭. পরীক্ষা পরিচালনা ও ছাপা খরচ',
  '৮. অফিস ও প্রশাসনিক খরচ',
  '৯. স্বাস্থ্য ও চিকিৎসা খরচ',
  '১০. বার্ষিক মাহফিল ও অনুষ্ঠান',
  '১১. এতিম ও দরিদ্র ফান্ড (উপবৃত্তি)',
  '১২. বই ও শিক্ষা উপকরণ',
  '১৩. লাইব্রেরি পরিচালনা',
  '১৪. আইটি ও ইলেকট্রনিক্স মেরামত',
  '১৫. পরিচ্ছন্নতা ও স্যানিটেশন',
  '১৬. আপ্যায়ন খরচ',
  '১৭. যাতায়াত ভাতা (টিএ/ডিএ)',
  '১৮. সরকারি ও বোর্ড ফি',
  '১৯. প্রতিযোগিতা ও পুরস্কার',
  '২০. জরুরি বা আকস্মিক তহবিল'
];

export const MADRASA_CLASSES = [
  'প্লে',
  'নার্সারি',
  '১ম শ্রেণি',
  '২য় শ্রেণি',
  '৩য় শ্রেণি',
  '৪র্থ শ্রেণি',
  '৫ম শ্রেণি',
  '৬ষ্ঠ শ্রেণি',
  '৭ম শ্রেণি',
  '৮ম শ্রেণি',
  'হেফজ শাখা',
  'নাজেরা শাখা'
];

export const MADRASA_SUB_CLASSES = [
  'আবাসিক',
  'অনাবাসিক (সাধারণ)',
  'বোর্ডিং / মেস',
  'পরিবহন / ডে-কেয়ার',
  'অন্যান্য'
];


// Convert English numbers to Bengali numerals
export function toBengaliNumber(num: number | string): string {
  if (num === null || num === undefined) return '';
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d, 10)]);
}

// Format Taka with comma separator
export function formatTaka(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  return `৳ ${toBengaliNumber(formatted)}`;
}

// English plain taka for raw inputs
export function formatTakaEnglish(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format date to Bengali readable string
export function formatBengaliDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const day = toBengaliNumber(d.getDate());
    const month = months[d.getMonth()];
    const year = toBengaliNumber(d.getFullYear());
    return `${day} ${month}, ${year}`;
  } catch {
    return dateStr;
  }
}

export function generateReceiptNo(prefix = 'MR'): string {
  const date = new Date();
  const yearStr = date.getFullYear().toString().slice(-2);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${yearStr}${random}`;
}

export function generateVoucherNo(): string {
  const date = new Date();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(100 + Math.random() * 900);
  return `V-${month}${random}`;
}
