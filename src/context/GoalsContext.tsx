import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeGoals,
  createGoal as createGoalService,
  updateGoal as updateGoalService,
  deleteGoal as deleteGoalService,
  archiveGoal as archiveGoalService,
  addMoneyToGoal as addMoneyToGoalService,
} from '../services/goalService';
import type { Goal, GoalWithStats } from '../types/goal';

interface GoalsContextProps {
  goals: GoalWithStats[];
  activeGoals: GoalWithStats[];
  completedGoals: GoalWithStats[];
  isLoading: boolean;
  error: string | null;
  createGoal: (data: Omit<Goal, 'id' | 'userId' | 'currentAmount' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateGoal: (goalId: string, updates: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  archiveGoal: (goalId: string) => Promise<void>;
  addMoneyToGoal: (goalId: string, amount: number) => Promise<void>;
}

const GoalsContext = createContext<GoalsContextProps | undefined>(undefined);

/** Compute derived stats for a goal */
const deriveStats = (goal: Goal): GoalWithStats => {
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const progress = goal.targetAmount > 0
    ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
    : 0;
  const today = new Date();
  const deadlineDate = goal.deadline ? new Date(goal.deadline) : null;
  const daysRemaining = deadlineDate
    ? Math.max(0, Math.ceil((deadlineDate.getTime() - today.getTime()) / 86_400_000))
    : 0;
  // Estimate completion: if we're saving at a pace, extrapolate
  let estimatedCompletionDate: string | null = null;
  const createdAt = goal.createdAt?.toDate?.() ?? new Date();
  const daysSinceCreation = Math.max(1, Math.ceil((today.getTime() - createdAt.getTime()) / 86_400_000));
  const dailyRate = goal.currentAmount / daysSinceCreation;
  if (dailyRate > 0 && remaining > 0) {
    const daysNeeded = Math.ceil(remaining / dailyRate);
    const est = new Date(today);
    est.setDate(est.getDate() + daysNeeded);
    estimatedCompletionDate = est.toISOString().split('T')[0];
  }
  return { ...goal, remainingAmount: remaining, progress, daysRemaining, estimatedCompletionDate };
};

export const GoalsProvider = ({ children }: { children: ReactNode }) => {
  const { firebaseUser } = useAuth();
  const [rawGoals, setRawGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setRawGoals([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsub = subscribeGoals(
      firebaseUser.uid,
      (goals) => {
        setRawGoals(goals);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
    return unsub;
  }, [firebaseUser?.uid]);

  const goals = useMemo(() => rawGoals.map(deriveStats), [rawGoals]);
  const activeGoals = useMemo(() => goals.filter(g => g.status === 'active'), [goals]);
  const completedGoals = useMemo(() => goals.filter(g => g.status === 'completed'), [goals]);

  const createGoal = async (data: Omit<Goal, 'id' | 'userId' | 'currentAmount' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (!firebaseUser?.uid) throw new Error('Not authenticated');
    return createGoalService(firebaseUser.uid, data);
  };

  const updateGoal = async (goalId: string, updates: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>) => {
    if (!firebaseUser?.uid) throw new Error('Not authenticated');
    await updateGoalService(firebaseUser.uid, goalId, updates);
  };

  const deleteGoal = async (goalId: string) => {
    if (!firebaseUser?.uid) throw new Error('Not authenticated');
    await deleteGoalService(firebaseUser.uid, goalId);
  };

  const archiveGoal = async (goalId: string) => {
    if (!firebaseUser?.uid) throw new Error('Not authenticated');
    await archiveGoalService(firebaseUser.uid, goalId);
  };

  const addMoneyToGoal = async (goalId: string, amount: number) => {
    if (!firebaseUser?.uid) throw new Error('Not authenticated');
    await addMoneyToGoalService(firebaseUser.uid, goalId, amount);
  };

  return (
    <GoalsContext.Provider value={{
      goals, activeGoals, completedGoals, isLoading, error,
      createGoal, updateGoal, deleteGoal, archiveGoal, addMoneyToGoal,
    }}>
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = (): GoalsContextProps => {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error('useGoals must be used within GoalsProvider');
  return ctx;
};
