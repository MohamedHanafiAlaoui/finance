export interface FinanceProfile {
  userId: string;
  monthlyIncome: number;
  monthlySavingsTarget: number;
  goalName: string;
  goalAmount: number;
  currentSavings: number;
  createdAt: any; // Firestore Timestamp
  updatedAt: any;
}
