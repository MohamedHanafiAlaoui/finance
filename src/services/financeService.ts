import { firestore } from '../../config/firebase';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp, onSnapshot, DocumentData } from 'firebase/firestore';
import type { FinanceProfile } from '../types/finance';

export const createFinanceProfile = async (uid: string, data: Omit<FinanceProfile, 'userId' | 'createdAt' | 'updatedAt'>) => {
  const profileRef = doc(firestore, 'financeProfiles', uid);
  const payload: FinanceProfile = {
    userId: uid,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as any;
  await setDoc(profileRef, payload);
};

export const getFinanceProfile = async (uid: string): Promise<FinanceProfile | null> => {
  const profileRef = doc(firestore, 'financeProfiles', uid);
  const snap = await getDoc(profileRef);
  if (snap.exists()) return snap.data() as FinanceProfile;
  return null;
};

export const updateFinanceProfile = async (uid: string, updates: Partial<Omit<FinanceProfile, 'userId' | 'createdAt'>> ) => {
  const profileRef = doc(firestore, 'financeProfiles', uid);
  await setDoc(profileRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
};

export const deleteFinanceProfile = async (uid: string) => {
  const profileRef = doc(firestore, 'financeProfiles', uid);
  await deleteDoc(profileRef);
};

export const subscribeFinanceProfile = (uid: string, callback: (profile: FinanceProfile | null) => void) => {
  const profileRef = doc(firestore, 'financeProfiles', uid);
  return onSnapshot(profileRef, (snap) => {
    if (snap.exists()) callback(snap.data() as FinanceProfile);
    else callback(null);
  });
};
