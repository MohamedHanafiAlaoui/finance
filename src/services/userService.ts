import { firestore } from '../../config/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { AppUser } from '../types/user';

// Create user document (called after Firebase Auth registration)
export const createUserProfile = async (uid: string, fullName: string, email: string) => {
  const userRef = doc(firestore, 'users', uid);
  const payload: AppUser = {
    uid,
    fullName,
    email,
    onboardingCompleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as any;
  await setDoc(userRef, payload);
};

export const getUserProfile = async (uid: string): Promise<AppUser | null> => {
  const userRef = doc(firestore, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return snap.data() as AppUser;
  return null;
};

export const updateUserProfile = async (uid: string, updates: Partial<Omit<AppUser, 'uid' | 'createdAt'>> ) => {
  const userRef = doc(firestore, 'users', uid);
  await updateDoc(userRef, { ...updates, updatedAt: serverTimestamp() });
};
