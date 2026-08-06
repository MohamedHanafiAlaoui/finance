// Mock Data Service for Finance App

export type Transaction = {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  time: string;
};

export type SavingsGoal = {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  daysLeft: number;
  category: string;
};

export type UserData = {
  name: string;
  email: string;
  initials: string;
  totalBalance: number;
  income: number;
  expenses: number;
};

// Mock User Data
export const mockUser: UserData = {
  name: "Sarah",
  email: "sarah@example.com",
  initials: "S",
  totalBalance: 12458.50,
  income: 2500.00,
  expenses: 345.20,
};

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: "1",
    title: "Salary Deposit",
    date: "Today",
    amount: 2500,
    type: "income",
    category: "Salary",
    time: "2:30 PM",
  },
  {
    id: "2",
    title: "Coffee Shop",
    date: "Today",
    amount: 5.5,
    type: "expense",
    category: "Food & Drinks",
    time: "10:45 AM",
  },
  {
    id: "3",
    title: "Grocery Shopping",
    date: "Yesterday",
    amount: 85.3,
    type: "expense",
    category: "Groceries",
    time: "6:20 PM",
  },
  {
    id: "4",
    title: "Gas Station",
    date: "2 days ago",
    amount: 45.0,
    type: "expense",
    category: "Transportation",
    time: "3:15 PM",
  },
  {
    id: "5",
    title: "Freelance Payment",
    date: "2 days ago",
    amount: 350,
    type: "income",
    category: "Freelance",
    time: "11:30 AM",
  },
  {
    id: "6",
    title: "Restaurant Dinner",
    date: "3 days ago",
    amount: 65.75,
    type: "expense",
    category: "Dining",
    time: "7:45 PM",
  },
  {
    id: "7",
    title: "Electricity Bill",
    date: "3 days ago",
    amount: 125.0,
    type: "expense",
    category: "Utilities",
    time: "1:00 PM",
  },
  {
    id: "8",
    title: "Online Shopping",
    date: "4 days ago",
    amount: 89.99,
    type: "expense",
    category: "Shopping",
    time: "5:22 PM",
  },
  {
    id: "9",
    title: "Bonus Payment",
    date: "5 days ago",
    amount: 500,
    type: "income",
    category: "Bonus",
    time: "9:00 AM",
  },
  {
    id: "10",
    title: "Gym Membership",
    date: "5 days ago",
    amount: 50,
    type: "expense",
    category: "Health & Fitness",
    time: "4:30 PM",
  },
  {
    id: "11",
    title: "Movie Tickets",
    date: "6 days ago",
    amount: 28.5,
    type: "expense",
    category: "Entertainment",
    time: "6:00 PM",
  },
  {
    id: "12",
    title: "Insurance Payment",
    date: "1 week ago",
    amount: 200,
    type: "expense",
    category: "Insurance",
    time: "10:00 AM",
  },
];

// Mock Savings Goals
export const mockSavingsGoals: SavingsGoal[] = [
  {
    id: "1",
    name: "New Laptop",
    emoji: "💻",
    targetAmount: 1500,
    currentAmount: 750,
    daysLeft: 122,
    category: "Technology",
  },
  {
    id: "2",
    name: "Summer Vacation",
    emoji: "✈️",
    targetAmount: 3000,
    currentAmount: 1850,
    daysLeft: 65,
    category: "Travel",
  },
  {
    id: "3",
    name: "New Car",
    emoji: "🚗",
    targetAmount: 25000,
    currentAmount: 8500,
    daysLeft: 365,
    category: "Vehicles",
  },
  {
    id: "4",
    name: "Home Renovation",
    emoji: "🏠",
    targetAmount: 10000,
    currentAmount: 4200,
    daysLeft: 200,
    category: "Home",
  },
  {
    id: "5",
    name: "Emergency Fund",
    emoji: "🛡️",
    targetAmount: 5000,
    currentAmount: 3500,
    daysLeft: 90,
    category: "Safety",
  },
];

// Helper function to get expense summary by category
export const getExpensesByCategory = () => {
  const categories: { [key: string]: number } = {};
  mockTransactions.forEach((transaction) => {
    if (transaction.type === "expense") {
      categories[transaction.category] =
        (categories[transaction.category] || 0) + transaction.amount;
    }
  });
  return categories;
};

// Helper function to get recent transactions (limited number)
export const getRecentTransactions = (limit: number = 10): Transaction[] => {
  return mockTransactions.slice(0, limit);
};

// Helper function to calculate statistics
export const getFinancialStats = () => {
  const totalIncome = mockTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = mockTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    netSavings,
    averageExpense: totalExpenses / mockTransactions.filter((t) => t.type === "expense").length,
  };
};
