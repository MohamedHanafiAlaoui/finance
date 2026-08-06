import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../../context/TransactionsContext';
import { useTheme } from '../../hooks/use-theme';
import { BarChart } from '../../components/charts/BarChart';
import { PieChart } from '../../components/charts/PieChart';
import { LineChart } from '../../components/charts/LineChart';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

export default function StatisticsScreen() {
  const { transactions, monthStats } = useTransactions();
  const colors = useTheme();

  const hasData = transactions.length > 0;

  // 1. Income vs Expense Bar Data (Last 6 months)
  const barData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
      const mYear = d.getFullYear();
      const mMonth = d.getMonth();

      const txs = transactions.filter(t => {
        const td = new Date(t.date);
        return td.getFullYear() === mYear && td.getMonth() === mMonth;
      });

      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      data.push({ label: monthLabel, income, expense });
    }
    return data;
  }, [transactions]);

  // 2. Spending Categories Pie Data (Current Month)
  const pieData = useMemo(() => {
    const now = new Date();
    const txs = transactions.filter(t => {
      const td = new Date(t.date);
      return t.type === 'expense' && td.getFullYear() === now.getFullYear() && td.getMonth() === now.getMonth();
    });
    const map = new Map<string, number>();
    txs.forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    
    const palette = ['#E74C3C', '#9B59B6', '#3498DB', '#F1C40F', '#E67E22', '#1ABC9C'];
    return Array.from(map.entries())
      .map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // 3. Savings Growth Line Data (Last 6 months cumulative)
  const lineData = useMemo(() => {
    const data = [];
    const now = new Date();
    let cumulative = transactions
      .filter(t => t.type === 'saving' && new Date(t.date) < new Date(now.getFullYear(), now.getMonth() - 5, 1))
      .reduce((s, t) => s + t.amount, 0);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
      const mYear = d.getFullYear();
      const mMonth = d.getMonth();

      const monthSaved = transactions
        .filter(t => t.type === 'saving')
        .filter(t => {
          const td = new Date(t.date);
          return td.getFullYear() === mYear && td.getMonth() === mMonth;
        })
        .reduce((s, t) => s + t.amount, 0);

      cumulative += monthSaved;
      data.push({ label: monthLabel, value: cumulative });
    }
    return data;
  }, [transactions]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>
      </View>

      {!hasData ? (
        <EmptyState
          icon="📊"
          title="Not enough data"
          subtitle="Add more transactions to see your financial statistics."
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Income vs Expense */}
          <SectionHeader title="Income vs Expenses" />
          <Card padding={20} style={styles.card}>
            <BarChart data={barData} width={310} height={200} />
          </Card>

          {/* Spending Categories */}
          <SectionHeader title="Spending (This Month)" />
          <Card padding={20} style={styles.card}>
            {pieData.length > 0 ? (
              <PieChart data={pieData} size={150} />
            ) : (
              <Text style={[styles.noData, { color: colors.textSecondary }]}>No expenses this month.</Text>
            )}
          </Card>

          {/* Savings Growth */}
          <SectionHeader title="Savings Growth" />
          <Card padding={20} style={styles.card}>
            <LineChart data={lineData} width={310} height={180} />
          </Card>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '900' },
  content: { paddingHorizontal: 20 },
  card: { marginBottom: 24, alignItems: 'center' },
  noData: { textAlign: 'center', paddingVertical: 20, fontSize: 14 },
});
