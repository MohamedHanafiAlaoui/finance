import React, { useState, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet,
  Pressable, RefreshControl, StatusBar, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useGoals } from '../../context/GoalsContext';
import { useTransactions } from '../../context/TransactionsContext';
import { useTheme } from '../../hooks/use-theme';
import { GoalCard } from '../../components/goals/GoalCard';
import { GoalFormSheet } from '../../components/goals/GoalFormSheet';
import { AddMoneySheet } from '../../components/goals/AddMoneySheet';
import { TransactionFormSheet } from '../../components/transactions/TransactionFormSheet';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { StatCard } from '../../components/ui/StatCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Avatar } from '../../components/ui/Avatar';
import type { GoalWithStats } from '../../types/goal';

const formatCurrency = (n: number) =>
  `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function HomeScreen() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { activeGoals, completedGoals, deleteGoal, archiveGoal } = useGoals();
  const { monthStats, recentTransactions, isLoading: txLoading } = useTransactions();
  const colors = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [newGoalVisible, setNewGoalVisible] = useState(false);
  const [addMoneyGoal, setAddMoneyGoal] = useState<GoalWithStats | null>(null);
  const [editGoal, setEditGoal] = useState<GoalWithStats | null>(null);
  const [txFormVisible, setTxFormVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const totalBalance = monthStats.income - monthStats.expenses - monthStats.savings;
  const totalSaved = activeGoals.reduce((s, g) => s + g.currentAmount, 0) +
    completedGoals.reduce((s, g) => s + g.currentAmount, 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E8B57" />}
      >
        {/* ── Hero Card ── */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()} 👋</Text>
              <Text style={styles.heroName}>{currentUser?.fullName || 'User'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Pressable onPress={() => logout().catch(console.error)}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>Logout</Text>
              </Pressable>
              <Avatar
                initials={currentUser?.initials || currentUser?.fullName?.[0] || '?'}
                size={50}
                color="rgba(255,255,255,0.3)"
              />
            </View>
          </View>

          {/* Balance */}
          <View style={styles.balanceBlock}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(monthStats.balance)}</Text>
            <Text style={styles.balanceSub}>
              📈 {monthStats.savingsRate}% savings rate this month
            </Text>
          </View>

          {/* Mini stats row */}
          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatIcon}>↑</Text>
              <Text style={styles.miniStatLabel}>Income</Text>
              <Text style={styles.miniStatVal}>{formatCurrency(monthStats.income)}</Text>
            </View>
            <View style={styles.miniDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatIcon}>↓</Text>
              <Text style={styles.miniStatLabel}>Expenses</Text>
              <Text style={styles.miniStatVal}>{formatCurrency(monthStats.expenses)}</Text>
            </View>
            <View style={styles.miniDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatIcon}>💎</Text>
              <Text style={styles.miniStatLabel}>Saved</Text>
              <Text style={styles.miniStatVal}>{formatCurrency(monthStats.savings)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Stat cards row */}
          <View style={styles.statsRow}>
            <StatCard
              label="Total Saved"
              value={formatCurrency(totalSaved)}
              icon="💰"
              color="#2E8B57"
              style={styles.statCardHalf}
            />
            <StatCard
              label="Active Goals"
              value={`${activeGoals.length}`}
              icon="🎯"
              color="#8E44AD"
              style={styles.statCardHalf}
            />
            <StatCard
              label="Completed"
              value={`${completedGoals.length}`}
              icon="✅"
              color="#2980B9"
              style={styles.statCardHalf}
            />
            <StatCard
              label="This Month"
              value={`${monthStats.savingsRate}%`}
              icon="📊"
              color="#E67E22"
              style={styles.statCardHalf}
            />
          </View>



          {/* Top Savings Goals */}
          <SectionHeader
            title="Savings Goals"
            actionLabel={activeGoals.length > 3 ? `See all (${activeGoals.length})` : undefined}
            onAction={() => router.push('/tabs/goals')}
          />
          {activeGoals.length === 0 ? (
            <EmptyState
              icon="🎯"
              title="No goals yet"
              subtitle="Create your first savings goal and start building wealth!"
              actionLabel="Create Goal"
              onAction={() => setNewGoalVisible(true)}
            />
          ) : (
            activeGoals.slice(0, 3).map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAddMoney={(g) => setAddMoneyGoal(g)}
                onEdit={(g) => setEditGoal(g)}
                onDelete={(g) => deleteGoal(g.id)}
                onPress={(g) => router.push(`/tabs/goal/${g.id}`)}
              />
            ))
          )}

          {/* Recent Transactions */}
          <SectionHeader
            title="Recent Transactions"
            actionLabel="See All"
            onAction={() => router.push('/tabs/transactions')}
          />
          {recentTransactions.length === 0 ? (
            <EmptyState
              icon="📭"
              title="No transactions yet"
              subtitle="Add your first income, expense, or savings deposit"
              actionLabel="Add Transaction"
              onAction={() => setTxFormVisible(true)}
            />
          ) : (
            recentTransactions.slice(0, 5).map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))
          )}

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>

      {/* Modals */}
      <GoalFormSheet visible={newGoalVisible} onClose={() => setNewGoalVisible(false)} />
      <GoalFormSheet
        visible={!!editGoal}
        onClose={() => setEditGoal(null)}
        editGoal={editGoal ?? undefined}
      />
      <AddMoneySheet
        visible={!!addMoneyGoal}
        onClose={() => setAddMoneyGoal(null)}
        goal={addMoneyGoal}
      />
      <TransactionFormSheet visible={txFormVisible} onClose={() => setTxFormVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: {
    backgroundColor: '#2E8B57',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  heroName: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 2 },
  balanceBlock: { marginBottom: 20 },
  balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  balanceAmount: { color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  balanceSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  miniStats: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18, padding: 14,
  },
  miniStat: { flex: 1, alignItems: 'center' },
  miniStatIcon: { fontSize: 14, marginBottom: 2, color: '#fff' },
  miniStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  miniStatVal: { fontSize: 14, fontWeight: '800', color: '#fff' },
  miniDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  content: { padding: 20 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  statCardHalf: { width: '47%' },

});