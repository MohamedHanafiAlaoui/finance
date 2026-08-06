import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import type { Transaction } from '../types/transaction';

const txCol = (uid: string) =>
  collection(firestore, 'users', uid, 'transactions');

const txDoc = (uid: string, txId: string) =>
  doc(firestore, 'users', uid, 'transactions', txId);

const parseTransaction = (id: string, data: any, uid: string): Transaction => ({
  id,
  userId: data.userId ?? uid,
  type: data.type ?? 'expense',
  amount: Number(data.amount ?? 0),
  category: data.category ?? '',
  note: data.note ?? data.description ?? '',
  date: data.date ?? '',
  goalId: data.goalId,
  createdAt: data.createdAt,
});

/** Create a new transaction */
export const createTransaction = async (
  uid: string,
  data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
): Promise<string> => {
  const ref = await addDoc(txCol(uid), {
    ...data,
    userId: uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

/** Update an existing transaction */
export const updateTransaction = async (
  uid: string,
  txId: string,
  updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  await updateDoc(txDoc(uid, txId), updates);
};

/** Delete a transaction */
export const deleteTransaction = async (uid: string, txId: string): Promise<void> => {
  await deleteDoc(txDoc(uid, txId));
};

/** One-time fetch of all transactions, sorted newest first */
export const getUserTransactions = async (uid: string): Promise<Transaction[]> => {
  const snap = await getDocs(txCol(uid));
  const txs: Transaction[] = [];
  snap.forEach((d) => txs.push(parseTransaction(d.id, d.data(), uid)));
  return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/** Subscribe to all transactions in real-time */
export const subscribeTransactions = (
  uid: string,
  callback: (txs: Transaction[]) => void
): (() => void) => {
  return onSnapshot(
    txCol(uid),
    (snap) => {
      const txs: Transaction[] = [];
      snap.forEach((d) => txs.push(parseTransaction(d.id, d.data(), uid)));
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(txs);
    },
    (err) => {
      console.error('[transactionService] Error:', err);
      callback([]);
    }
  );
};

/** Subscribe to transactions for a specific month/year, client-side filtered */
export const subscribeTransactionsByMonth = (
  uid: string,
  year: number,
  month: number, // 0-based (January = 0)
  callback: (txs: Transaction[]) => void
): (() => void) => {
  return onSnapshot(
    txCol(uid),
    (snap) => {
      const txs: Transaction[] = [];
      snap.forEach((d) => {
        const tx = parseTransaction(d.id, d.data(), uid);
        const txDate = new Date(tx.date);
        if (txDate.getFullYear() === year && txDate.getMonth() === month) {
          txs.push(tx);
        }
      });
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(txs);
    },
    (err) => {
      console.error('[transactionService] Monthly filter error:', err);
      callback([]);
    }
  );
};

/** Subscribe to transactions linked to a specific goal */
export const subscribeTransactionsByGoal = (
  uid: string,
  goalId: string,
  callback: (txs: Transaction[]) => void
): (() => void) => {
  return onSnapshot(
    txCol(uid),
    (snap) => {
      const txs: Transaction[] = [];
      snap.forEach((d) => {
        const tx = parseTransaction(d.id, d.data(), uid);
        if (tx.goalId === goalId) txs.push(tx);
      });
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(txs);
    },
    (err) => {
      console.error('[transactionService] Goal filter error:', err);
      callback([]);
    }
  );
};
