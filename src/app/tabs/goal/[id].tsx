import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGoals } from '../../../context/GoalsContext';
import { useTheme } from '../../../hooks/use-theme';
import { subscribeTransactionsByGoal } from '../../../services/transactionService';
import { useAuth } from '../../../context/AuthContext';
import { ProgressRing } from '../../../components/charts/ProgressRing';
import { AddMoneySheet } from '../../../components/goals/AddMoneySheet';
import { GoalFormSheet } from '../../../components/goals/GoalFormSheet';
import { TransactionItem } from '../../../components/transactions/TransactionItem';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Badge } from '../../../components/ui/Badge';
import type { Transaction } from '../../../types/transaction';

const fmt = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { goals, deleteGoal, archiveGoal } = useGoals();
  const { firebaseUser } = useAuth();
  const colors = useTheme();

  const [goalTxs, setGoalTxs] = useState<Transaction[]>([]);
  const [addMoneyVisible, setAddMoneyVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const goal = goals.find(g => g.id === id);

  useEffect(() => {
    if (!firebaseUser?.uid || !id) return;
    const unsub = subscribeTransactionsByGoal(firebaseUser.uid, id, setGoalTxs);
    return unsub;
  }, [firebaseUser?.uid, id]);

  if (!goal) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.notFound, { color: colors.textSecondary }]}>Goal not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      `Delete "${goal.title}" permanently?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await deleteGoal(goal.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive Goal',
      `Archive "${goal.title}"? You can restore it later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            await archiveGoal(goal.id);
            router.back();
          },
        },
      ]
    );
  };

  const statusColors: Record<string, string> = {
    active: '#2E8B57',
    completed: '#2980B9',
    archived: '#95A5A6',
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={goal.color} />

      {/* Green header */}
      <View style={[styles.heroHeader, { backgroundColor: goal.color }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.heroIcon}>
          <Text style={styles.heroEmoji}>{goal.icon}</Text>
        </View>
        <Text style={styles.heroTitle}>{goal.title}</Text>
        <Badge
          label={goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
          color={statusColors[goal.status] + '40'}
          textColor="#fff"
          style={styles.statusBadge}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress Ring + amounts */}
        <View style={styles.ringBlock}>
          <ProgressRing
            progress={goal.progress}
            size={160}
            strokeWidth={16}
            color={goal.color}
            centerLabel={`${goal.progress.toFixed(0)}%`}
            centerSub="Complete"
          />
          <View style={styles.amountsCol}>
            <View style={styles.amountItem}>
              <Text style={[styles.amtLabel, { color: colors.textSecondary }]}>Saved</Text>
              <Text style={[styles.amtVal, { color: goal.color }]}>{fmt(goal.currentAmount)}</Text>
            </View>
            <View style={styles.amountItem}>
              <Text style={[styles.amtLabel, { color: colors.textSecondary }]}>Target</Text>
              <Text style={[styles.amtVal, { color: colors.text }]}>{fmt(goal.targetAmount)}</Text>
            </View>
            <View style={styles.amountItem}>
              <Text style={[styles.amtLabel, { color: colors.textSecondary }]}>Remaining</Text>
              <Text style={[styles.amtVal, { color: colors.danger }]}>{fmt(goal.remainingAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Details card */}
        <View style={[styles.detailCard, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>📅 Deadline</Text>
            <Text style={[styles.detailVal, { color: colors.text }]}>
              {goal.deadline || 'No deadline'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>⏱️ Days Remaining</Text>
            <Text style={[styles.detailVal, { color: colors.text }]}>
              {goal.deadline ? `${goal.daysRemaining} days` : '—'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>📈 Est. Completion</Text>
            <Text style={[styles.detailVal, { color: colors.text }]}>
              {goal.estimatedCompletionDate ?? 'Not enough data'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>⭐ Priority</Text>
            <Text style={[styles.detailVal, { color: colors.text }]}>
              {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
            </Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>📊 Deposits</Text>
            <Text style={[styles.detailVal, { color: colors.text }]}>{goalTxs.length}</Text>
          </View>
        </View>

        {/* Action buttons */}
        {goal.status === 'active' && (
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: goal.color }]}
              onPress={() => setAddMoneyVisible(true)}
            >
              <Text style={styles.actionBtnText}>💵 Add Money</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.backgroundElement }]}
              onPress={() => setEditVisible(true)}
            >
              <Text style={[styles.actionBtnText, { color: colors.text }]}>✏️ Edit</Text>
            </Pressable>
          </View>
        )}
        <View style={styles.dangerRow}>
          {goal.status === 'active' && (
            <Pressable
              style={[styles.dangerBtn, { borderColor: colors.warning }]}
              onPress={handleArchive}
            >
              <Text style={[styles.dangerBtnText, { color: colors.warning }]}>Archive</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.dangerBtn, { borderColor: colors.danger }]}
            onPress={handleDelete}
          >
            <Text style={[styles.dangerBtnText, { color: colors.danger }]}>Delete Goal</Text>
          </Pressable>
        </View>

        {/* Goal Transactions */}
        <SectionHeader title={`Deposits (${goalTxs.length})`} />
        {goalTxs.length === 0 ? (
          <EmptyState
            icon="💸"
            title="No deposits yet"
            subtitle="Add money to this goal to see your deposit history"
          />
        ) : (
          goalTxs.map(tx => <TransactionItem key={tx.id} transaction={tx} />)
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <AddMoneySheet
        visible={addMoneyVisible}
        onClose={() => setAddMoneyVisible(false)}
        goal={goal}
      />
      <GoalFormSheet
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        editGoal={goal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: 16 },
  backLink: { marginTop: 12 },
  backLinkText: { color: '#2E8B57', fontSize: 15, fontWeight: '600' },
  heroHeader: {
    paddingTop: 16, paddingBottom: 28,
    paddingHorizontal: 20, alignItems: 'center',
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  backBtn: { position: 'absolute', top: 16, left: 16, padding: 8 },
  backArrow: { color: '#fff', fontSize: 22, fontWeight: '700' },
  heroIcon: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  heroEmoji: { fontSize: 36 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  statusBadge: { marginTop: 8 },
  content: { padding: 20 },
  ringBlock: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 20 },
  amountsCol: { flex: 1, gap: 12 },
  amountItem: {},
  amtLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  amtVal: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  detailCard: { borderRadius: 20, padding: 4, marginBottom: 20 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  detailLabel: { fontSize: 13 },
  detailVal: { fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  actionBtn: {
    flex: 1, padding: 14, borderRadius: 14,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  dangerRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  dangerBtn: {
    flex: 1, padding: 12, borderRadius: 14,
    alignItems: 'center', borderWidth: 1.5,
  },
  dangerBtnText: { fontSize: 14, fontWeight: '700' },
});
