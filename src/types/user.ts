export interface AppUser {
  uid: string;
  fullName: string;
  email: string;
  initials: string;
  onboardingCompleted: boolean;
  savingsGoal: string;
  currentSavings: number;
  goalAmount: number;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any;
}
