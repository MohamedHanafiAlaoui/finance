import { StyleSheet, Text, View } from "react-native";

type SavingsCardProps = {
  goalName: string;
  currentAmount: number;
  targetAmount: number;
};

export default function SavingsCard({ goalName, currentAmount, targetAmount }: SavingsCardProps) {
  const safeCurrent = Number(currentAmount || 0);
  const safeTarget = Number(targetAmount || 0);
  const progress = safeTarget > 0 ? Math.min((safeCurrent / safeTarget) * 100, 100) : 0;
  const remaining = Math.max(safeTarget - safeCurrent, 0);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>Savings Goal</Text>
          <Text style={styles.goalName}>{goalName || "My Goal"}</Text>
        </View>
        <Text style={styles.icon}>🎯</Text>
      </View>

      <View style={styles.goalRow}>
        <Text style={styles.goalAmount}>${safeCurrent.toFixed(0)}</Text>
        <Text style={styles.goalTarget}>of ${safeTarget.toFixed(0)}</Text>
      </View>

      <View style={styles.progressBackground}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
      </View>

      <View style={styles.goalFooter}>
        <Text style={styles.progressText}>{progress.toFixed(0)}% completed</Text>
        <Text style={styles.daysLeft}>${remaining.toFixed(0)} remaining</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },

  goalName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
  },

  icon: {
    fontSize: 28,
  },

  goalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
    gap: 8,
  },

  goalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2563EB",
  },

  goalTarget: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },

  progressBackground: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    marginBottom: 12,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 5,
  },

  goalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "500",
  },

  daysLeft: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "500",
  },
});