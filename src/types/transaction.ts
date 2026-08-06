export type TransactionType = 'income' | 'expense' | 'saving';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  goalId?: string; // optional link to a savings goal
  receiptUrl?: string; // optional image receipt URL
  createdAt: any; // Firestore Timestamp
}

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Rental', 'Bonus', 'Gift', 'Other Income'
] as const;

export const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities',
  'Health', 'Education', 'Entertainment', 'Travel', 'Housing', 'Other'
] as const;

export const SAVING_CATEGORIES = [
  'Goal Deposit', 'Emergency Fund', 'Investment', 'Other Savings'
] as const;

export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type SavingCategory = typeof SAVING_CATEGORIES[number];

export interface CategoryMeta {
  icon: string;
  color: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  // Income
  'Salary': { icon: '💼', color: '#22C55E' },
  'Freelance': { icon: '💻', color: '#10B981' },
  'Investment': { icon: '📈', color: '#059669' },
  'Rental': { icon: '🏠', color: '#16A34A' },
  'Bonus': { icon: '🎁', color: '#15803D' },
  'Gift': { icon: '🎀', color: '#34D399' },
  'Other Income': { icon: '💵', color: '#4ADE80' },

  // Expenses
  'Food & Dining': { icon: '🍔', color: '#EF4444' },
  'Transport': { icon: '🚗', color: '#F97316' },
  'Shopping': { icon: '🛍️', color: '#EC4899' },
  'Bills & Utilities': { icon: '💡', color: '#EAB308' },
  'Health': { icon: '🏥', color: '#06B6D4' },
  'Education': { icon: '🎓', color: '#8B5CF6' },
  'Entertainment': { icon: '🎬', color: '#A855F7' },
  'Travel': { icon: '✈️', color: '#3B82F6' },
  'Housing': { icon: '🏡', color: '#6366F1' },
  'Other': { icon: '📦', color: '#6B7280' },

  // Savings
  'Goal Deposit': { icon: '🎯', color: '#0FA3B1' },
  'Emergency Fund': { icon: '🛡️', color: '#2563EB' },
  'Other Savings': { icon: '🏦', color: '#0D9488' },
};

export const getCategoryMeta = (category: string, type: TransactionType = 'expense'): CategoryMeta => {
  if (CATEGORY_META[category]) return CATEGORY_META[category];
  if (type === 'income') return { icon: '💵', color: '#22C55E' };
  if (type === 'saving') return { icon: '🏦', color: '#0FA3B1' };
  return { icon: '💸', color: '#EF4444' };
};
