
import { auth, firestore } from "../../config/firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import type { AppUser } from "../types/user";

/**
 * Generate initials from a full name (up to 2 characters).
 */
const generateInitials = (fullName: string): string => {
  return fullName
    .trim()
    .split(/\s+/)
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Map Firebase error codes to user-friendly messages.
 */
const getFirebaseErrorMessage = (error: any): string => {
  const code = error?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/invalid-credential":
      return "Email or password is incorrect.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return error?.message ?? "An unexpected error occurred. Please try again.";
  }
};

/**
 * Register a new user with email/password
 * and create a Firestore user profile.
 */
export const registerUser = async (
  fullName: string,
  email: string,
  password: string
): Promise<AppUser> => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const firebaseUser = userCredential.user;

    // Save full name in Firebase Authentication
    await updateProfile(firebaseUser, {
      displayName: fullName.trim(),
    });

    // Generate initials
    const initials = generateInitials(fullName);

    // Build user profile with safe defaults
    const profile: AppUser = {
      uid: firebaseUser.uid,
      fullName: fullName.trim(),
      email: firebaseUser.email ?? email.trim(),
      initials,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
      savingsGoal: "",
      currentSavings: 0,
      goalAmount: 0,
    };

    // Store profile in Firestore
    await setDoc(doc(firestore, "users", firebaseUser.uid), {
      ...profile,
      createdAt: serverTimestamp(),
    });

    return profile;
  } catch (error: any) {
    throw new Error(getFirebaseErrorMessage(error));
  }
};

/**
 * Login a user with email/password
 * and retrieve their Firestore profile.
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<AppUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const firebaseUser = userCredential.user;

    // Fetch user profile from Firestore
    const profileRef = doc(firestore, "users", firebaseUser.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      throw new Error("User profile not found in Firestore.");
    }

    const data = profileSnap.data();
    // Return with safe defaults for numeric fields
    return {
      uid: data.uid ?? firebaseUser.uid,
      fullName: data.fullName ?? "",
      email: data.email ?? firebaseUser.email ?? "",
      initials: data.initials ?? "",
      onboardingCompleted: data.onboardingCompleted ?? false,
      savingsGoal: data.savingsGoal ?? "",
      currentSavings: Number(data.currentSavings ?? 0),
      goalAmount: Number(data.goalAmount ?? 0),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as AppUser;
  } catch (error: any) {
    // Re-throw if already a friendly message
    if (error.code) {
      throw new Error(getFirebaseErrorMessage(error));
    }
    throw error;
  }
};

/**
 * Logout the currently authenticated user.
 */
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Get the currently authenticated user's Firestore profile.
 */
export const getCurrentUser = async (): Promise<AppUser | null> => {
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    return null;
  }

  const profileRef = doc(firestore, "users", firebaseUser.uid);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    return null;
  }

  const data = profileSnap.data();
  return {
    uid: data.uid ?? firebaseUser.uid,
    fullName: data.fullName ?? "",
    email: data.email ?? firebaseUser.email ?? "",
    initials: data.initials ?? "",
    onboardingCompleted: data.onboardingCompleted ?? false,
    savingsGoal: data.savingsGoal ?? "",
    currentSavings: Number(data.currentSavings ?? 0),
    goalAmount: Number(data.goalAmount ?? 0),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as AppUser;
};

/**
 * Send a password reset email to the user.
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    throw new Error(getFirebaseErrorMessage(error));
  }
};

/**
 * Mark onboarding as completed in Firestore and save financial data.
 */
export const completeOnboarding = async (
  uid: string
): Promise<void> => {
  const userRef = doc(firestore, "users", uid);
  await updateDoc(userRef, {
    onboardingCompleted: true,
    updatedAt: serverTimestamp(),
  });
};