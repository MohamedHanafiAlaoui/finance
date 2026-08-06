export type GoalStatus = 'active' | 'completed' | 'archived';
export type GoalPriority = 'low' | 'medium' | 'high';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  icon: string;        // emoji string e.g. '🏠'
  color: string;       // hex color e.g. '#2E8B57'
  targetAmount: number;
  currentAmount: number;
  deadline: string;    // ISO date string YYYY-MM-DD
  priority: GoalPriority;
  status: GoalStatus;
  createdAt: any;      // Firestore Timestamp
  updatedAt: any;      // Firestore Timestamp
}

// Derived fields (computed, not stored in Firestore)
export interface GoalWithStats extends Goal {
  remainingAmount: number;    // targetAmount - currentAmount
  progress: number;           // 0-100 percentage
  daysRemaining: number;      // days until deadline
  estimatedCompletionDate: string | null;
}

export const GOAL_ICONS = [
  '🏠', '🚗', '✈️', '💻', '🎓', '📱', '💍', '🏋️',
  '🎮', '🎵', '📚', '🏖️', '🛍️', '🏥', '💰', '🎯',
] as const;

export const GOAL_COLORS = [
  '#2E8B57', '#E67E22', '#8E44AD', '#2980B9',
  '#C0392B', '#16A085', '#F39C12', '#7F8C8D',
  '#1ABC9C', '#E74C3C', '#3498DB', '#9B59B6',
] as const;
