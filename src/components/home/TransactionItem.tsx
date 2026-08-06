import { StyleSheet, Text, View } from "react-native";

type TransactionItemProps = {
  title: string;
  date: string;
  amount: string;
  type: "income" | "expense" | "saving";
};

export default function TransactionItem({
  title,
  date,
  amount,
  type,
}: TransactionItemProps) {
  const getIcon = (title: string) => {
    // Income
    if (title.includes("Salary")) return "💼";
    if (title.includes("Freelance")) return "💻";
    if (title.includes("Bonus")) return "🎁";
    if (title.includes("Payment")) return "💵";
    
    // Food & Dining
    if (title.includes("Coffee")) return "☕";
    if (title.includes("Restaurant")) return "🍽️";
    if (title.includes("Grocery")) return "🛒";
    
    // Transport & Gas
    if (title.includes("Gas")) return "⛽";
    if (title.includes("Transport")) return "🚗";
    
    // Entertainment
    if (title.includes("Movie")) return "🎬";
    if (title.includes("Entertainment")) return "🎭";
    
    // Bills & Utilities
    if (title.includes("Electricity") || title.includes("Bill")) return "💡";
    if (title.includes("Insurance")) return "🛡️";
    
    // Health
    if (title.includes("Gym")) return "💪";
    if (title.includes("Health")) return "🏥";
    
    // Shopping
    if (title.includes("Shopping") || title.includes("Online")) return "🛍️";
    
    // Default
    return type === "income" ? "📥" : "📤";
  };

  return (
    <View style={styles.transaction}>
      <View style={[styles.iconContainer, { backgroundColor: type === "income" ? "#DCFCE7" : "#FEE2E2" }]}>
        <Text style={styles.transactionIcon}>{getIcon(title)}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.transactionTitle}>{title}</Text>
        <Text style={styles.transactionDate}>{date}</Text>
      </View>

      <Text
        style={
          type === "income"
            ? styles.income
            : styles.expense
        }
      >
        {amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  transaction: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  transactionIcon: {
    fontSize: 20,
  },

  details: {
    flex: 1,
  },

  transactionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },

  transactionDate: {
    color: "#9CA3AF",
    fontSize: 13,
  },

  income: {
    color: "#059669",
    fontSize: 15,
    fontWeight: "700",
  },

  expense: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "700",
  },
});