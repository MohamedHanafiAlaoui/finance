import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  increment,
  getDoc,
} from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import type { Goal, GoalPriority, GoalStatus } from '../types/goal';

const goalsRef = (uid: string) =>
  collection(firestore, 'users', uid, 'goals');

const goalDoc = (uid: string, goalId: string) =>
  doc(firestore, 'users', uid, 'goals', goalId);

/**
 * Parse a raw Firestore document into a Goal object with safe defaults.
 */
const parseGoal = (id: string, data: any): Goal => ({
  id,
  userId: data.userId ?? '',
  title: data.title ?? '',
  icon: data.icon ?? '🎯',
  color: data.color ?? '#2E8B57',
  targetAmount: Number(data.targetAmount ?? 0),
  currentAmount: Number(data.currentAmount ?? 0),
  deadline: data.deadline ?? '',
  priority: (data.priority ?? 'medium') as GoalPriority,
  status: (data.status ?? 'active') as GoalStatus,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
});

/**
 * Create a new savings goal for the given user.
 */
export const createGoal = async (
  uid: string,
  data: Omit<Goal, 'id' | 'userId' | 'currentAmount' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ref = await addDoc(goalsRef(uid), {
    ...data,
    userId: uid,
    currentAmount: 0,
    status: 'active' as GoalStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Update an existing savings goal.
 */
export const updateGoal = async (
  uid: string,
  goalId: string,
  updates: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  await updateDoc(goalDoc(uid, goalId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a savings goal permanently.
 */
export const deleteGoal = async (uid: string, goalId: string): Promise<void> => {
  await deleteDoc(goalDoc(uid, goalId));
};

/**
 * Add money to a goal. Automatically marks as completed when target is reached.
 */
export const addMoneyToGoal = async (
  uid: string,
  goalId: string,
  amount: number
): Promise<void> => {
  const ref = goalDoc(uid, goalId);
  // Fetch current state to check completion
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Goal not found');
  const goal = parseGoal(snap.id, snap.data());
  const newAmount = goal.currentAmount + amount;
  const isCompleted = newAmount >= goal.targetAmount;
  await updateDoc(ref, {
    currentAmount: increment(amount),
    status: isCompleted ? 'completed' : goal.status,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Archive a goal (soft delete).
 */
export const archiveGoal = async (uid: string, goalId: string): Promise<void> => {
  await updateDoc(goalDoc(uid, goalId), {
    status: 'archived' as GoalStatus,
    updatedAt: serverTimestamp(),
  });
};

/**
 * One-time fetch of all user goals, sorted by createdAt descending.
 */
export const getGoals = async (uid: string): Promise<Goal[]> => {
  const snap = await getDocs(goalsRef(uid));
  const goals: Goal[] = [];
  snap.forEach((d) => goals.push(parseGoal(d.id, d.data())));
  return goals.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
};

/**
 * Subscribe to real-time goal updates.
 * Returns an unsubscribe function.
 */
export const subscribeGoals = (
  uid: string,
  callback: (goals: Goal[]) => void,
  onError?: (err: Error) => void
): (() => void) => {
  const q = query(goalsRef(uid));
  return onSnapshot(
    q,
    (snap) => {
      const goals: Goal[] = [];
      snap.forEach((d) => goals.push(parseGoal(d.id, d.data())));
      goals.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
      callback(goals);
    },
    (err) => {
      console.error('[goalService] Error:', err);
      onError?.(err);
    }
  );
};
