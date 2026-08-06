import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeTransactions,
  createTransaction,
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService,
} from '../services/transactionService';
import { addMoneyToGoal } from '../services/goalService';
import type { Transaction } from '../types/transaction';

interface MonthStats {
  income: number;
  expenses: number;
  savings: number;
  balance: number;
  savingsRate: number;
}

interface TransactionsContextProps {
  transactions: Transaction[];
  recentTransactions: Transaction[];
  monthStats: MonthStats;
  isLoading: boolean;
  error: string | null;
  addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  editTransaction: (txId: string, updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteTransaction: (txId: string) => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextProps | undefined>(undefined);

const computeMonthStats = (txs: Transaction[]): MonthStats => {
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();
  const monthTxs = txs.filter(tx => {
    const d = new Date(tx.date);
    return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
  });
  const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = monthTxs.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses - savings;
  const savingsRate = income > 0 ? Math.round(((savings) / income) * 100) : 0;
  return { income, expenses, savings, balance, savingsRate };
};

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const { firebaseUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsub = subscribeTransactions(firebaseUser.uid, (txs) => {
      setTransactions(txs);
      setIsLoading(false);
      setError(null);
    });
    return unsub;
  }, [firebaseUser?.uid]);

  const monthStats = useMemo(() => computeMonthStats(transactions), [transactions]);
  const recentTransactions = useMemo(() => transactions.slice(0, 10), [transactions]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!firebaseUser?.uid) throw new Error('Not authenticated');
    return createTransaction(firebaseUser.uid, data);
  };

  const editTransaction = async (txId: string, updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => {
    if (!firebaseUser?.uid) throw new Error('Not authenticated');
    
    // Find old transaction to sync linked goal if amount or goal changed
    const oldTx = transactions.find(t => t.id === txId);

    await updateTransactionService(firebaseUser.uid, txId, updates);

    // Sync goal amounts if this was a saving transaction linked to a goal
    if (oldTx && firebaseUser.uid) {
      const oldGoalId = oldTx.goalId;
      const newGoalId = updates.goalId !== undefined ? updates.goalId : oldGoalId;
      const oldAmt = oldTx.type === 'saving' ? oldTx.amount : 0;
      const newAmt = (updates.type ?? oldTx.type) === 'saving' ? (updates.amount ?? oldTx.amount) : 0;

      if (oldGoalId && oldGoalId === newGoalId) {
        // Same goal, diff amount
        const diff = newAmt - oldAmt;
        if (diff !== 0) {
          await addMoneyToGoal(firebaseUser.uid, oldGoalId, diff).catch(console.error);
        }
      } else {
        // Different goals
        if (oldGoalId && oldAmt > 0) {
          await addMoneyToGoal(firebaseUser.uid, oldGoalId, -oldAmt).catch(console.error);
        }
        if (newGoalId && newAmt > 0) {
          await addMoneyToGoal(firebaseUser.uid, newGoalId, newAmt).catch(console.error);
        }
      }
    }
  };

  const deleteTransaction = async (txId: string) => {
    if (!firebaseUser?.uid) throw new Error('Not authenticated');
    
    const oldTx = transactions.find(t => t.id === txId);
    
    await deleteTransactionService(firebaseUser.uid, txId);

    // If deleting a saving transaction linked to a goal, deduct the amount from goal
    if (oldTx && oldTx.type === 'saving' && oldTx.goalId && firebaseUser.uid) {
      await addMoneyToGoal(firebaseUser.uid, oldTx.goalId, -oldTx.amount).catch(console.error);
    }
  };

  return (
    <TransactionsContext.Provider value={{
      transactions, recentTransactions, monthStats, isLoading, error,
      addTransaction, editTransaction, deleteTransaction,
    }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = (): TransactionsContextProps => {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionsProvider');
  return ctx;
};
