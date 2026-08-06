import { firestore } from '../../config/firebase';
import { collection, addDoc, doc, getDocs, query, orderBy, onSnapshot, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { Transaction } from '../types/transaction';

/**
 * Create a transaction in the user's subcollection: users/{uid}/transactions
 */
export const createTransaction = async (
  uid: string,
  data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
) => {
  const txColRef = collection(firestore, 'users', uid, 'transactions');
  const txRef = await addDoc(txColRef, {
    ...data,
    userId: uid,
    createdAt: serverTimestamp(),
  });
  return txRef.id;
};

/**
 * Get all transactions for a user (one-time fetch).
 * Sorted descending by date locally to avoid requiring a composite Firestore index.
 */
export const getUserTransactions = async (uid: string): Promise<Transaction[]> => {
  const txColRef = collection(firestore, 'users', uid, 'transactions');
  const q = query(txColRef);
  const snap = await getDocs(q);
  const txs: Transaction[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    txs.push({
      id: docSnap.id,
      userId: data.userId ?? uid,
      type: data.type ?? 'expense',
      amount: Number(data.amount ?? 0),
      category: data.category ?? '',
      description: data.description ?? '',
      date: data.date ?? '',
      createdAt: data.createdAt,
    });
  });
  // Sort descending by date locally
  return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Subscribe to real-time transaction updates for a user.
 * Sorted descending by date locally.
 */
export const subscribeTransactions = (
  uid: string,
  callback: (transactions: Transaction[]) => void,
) => {
  const txColRef = collection(firestore, 'users', uid, 'transactions');
  const q = query(txColRef);
  return onSnapshot(q, (snap) => {
    const txs: Transaction[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      txs.push({
        id: docSnap.id,
        userId: data.userId ?? uid,
        type: data.type ?? 'expense',
        amount: Number(data.amount ?? 0),
        category: data.category ?? '',
        description: data.description ?? '',
        date: data.date ?? '',
        createdAt: data.createdAt,
      });
    });
    // Sort descending by date locally
    txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(txs);
  }, (error) => {
    console.error('[transactionService] Error subscribing to transactions:', error);
    callback([]);
  });
};

/**
 * Delete a transaction from the user's subcollection.
 */
export const deleteTransaction = async (uid: string, txId: string) => {
  const txRef = doc(firestore, 'users', uid, 'transactions', txId);
  await deleteDoc(txRef);
};
