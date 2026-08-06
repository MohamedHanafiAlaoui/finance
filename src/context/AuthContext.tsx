import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, firestore } from '../../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { AppUser } from '../types/user';
import {
  registerUser as registerUserService,
  loginUser as loginUserService,
  logoutUser as logoutUserService,
  resetPassword as resetPasswordService,
  completeOnboarding as completeOnboardingService,
} from '../services/authService';

interface AuthContextProps {
  currentUser: AppUser | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  register: (fullName: string, email: string, password: string) => Promise<AppUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

/**
 * Helper to safely parse a Firestore user document into AppUser,
 * guaranteeing no undefined numeric fields.
 */
const parseUserDoc = (data: any, uid: string): AppUser => ({
  uid: data.uid ?? uid,
  fullName: data.fullName ?? '',
  email: data.email ?? '',
  initials: data.initials ?? '',
  onboardingCompleted: data.onboardingCompleted ?? false,
  savingsGoal: data.savingsGoal ?? '',
  currentSavings: Number(data.currentSavings ?? 0),
  goalAmount: Number(data.goalAmount ?? 0),
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);

      // Unsubscribe from any previous profile listener
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (user) {
        // Subscribe to the user's Firestore profile in real-time
        const userDocRef = doc(firestore, 'users', user.uid);
        unsubProfile = onSnapshot(
          userDocRef,
          (snap) => {
            if (snap.exists()) {
              setCurrentUser(parseUserDoc(snap.data(), user.uid));
            } else {
              // Profile missing — shouldn't happen for registered users
              setCurrentUser(null);
            }
            setIsLoading(false);
          },
          (error) => {
            console.error('[AuthContext] Error listening to user profile:', error);
            setCurrentUser(null);
            setIsLoading(false);
          }
        );
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsub();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AppUser> => {
    const profile = await loginUserService(email, password);
    setCurrentUser(profile);
    return profile;
  };

  const register = async (fullName: string, email: string, password: string): Promise<AppUser> => {
    const profile = await registerUserService(fullName, email, password);
    setCurrentUser(profile);
    return profile;
  };

  const logout = async () => {
    await logoutUserService();
    setCurrentUser(null);
  };

  const resetPassword = async (email: string) => {
    await resetPasswordService(email);
  };

  const completeOnboarding = async () => {
    if (!firebaseUser) throw new Error('Not authenticated');
    await completeOnboardingService(firebaseUser.uid);
    // The onSnapshot listener will automatically update currentUser
  };

  const value: AuthContextProps = {
    currentUser,
    firebaseUser,
    isAuthenticated: !!firebaseUser,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
