import { StyleSheet, Text, View } from "react-native";

interface BalanceCardProps {
  currentSavings: number;
  goalAmount: number;
}

export default function BalanceCard({ currentSavings, goalAmount }: BalanceCardProps) {
  const safeSavings = Number(currentSavings || 0);
  const safeGoal = Number(goalAmount || 0);
  const remaining = Math.max(safeGoal - safeSavings, 0);
  const progress = safeGoal > 0 ? Math.min((safeSavings / safeGoal) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Total Balance</Text>
        <Text style={styles.icon}>💳</Text>
      </View>

      <Text style={styles.balance}>${safeSavings.toFixed(2)}</Text>

      {/* Progress Bar */}
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{progress.toFixed(0)}% of goal</Text>

      <View style={styles.footer}>
        <View>
          <Text style={styles.subLabel}>Goal</Text>
          <Text style={styles.income}>${safeGoal.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View>
          <Text style={styles.subLabel}>Remaining</Text>
          <Text style={styles.expense}>${remaining.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  label: {
    color: "#DBEAFE",
    fontSize: 14,
    fontWeight: "600",
  },

  icon: {
    fontSize: 24,
  },

  balance: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 16,
  },

  progressBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#86EFAC",
    borderRadius: 4,
  },

  progressText: {
    color: "#DBEAFE",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 16,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },

  subLabel: {
    color: "#DBEAFE",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },

  income: {
    color: "#86EFAC",
    fontSize: 16,
    fontWeight: "700",
  },

  expense: {
    color: "#FCA5A5",
    fontSize: 16,
    fontWeight: "700",
  },

  divider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});