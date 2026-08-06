import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { BottomSheet } from '../ui/BottomSheet';
import { useTheme } from '../../hooks/use-theme';
import { useGoals } from '../../context/GoalsContext';
import type { Transaction } from '../../types/transaction';

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

const TYPE_META: Record<string, { label: string; icon: string; color: string; bg: string; prefix: string }> = {
  income: { label: 'Income', icon: '💵', color: '#22C55E', bg: '#22C55E15', prefix: '+' },
  expense: { label: 'Expense', icon: '💸', color: '#EF4444', bg: '#EF444415', prefix: '-' },
  saving: { label: 'Saving', icon: '🏦', color: '#0FA3B1', bg: '#0FA3B115', prefix: '+' },
};

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  onClose,
  onEdit,
  onDelete,
}) => {
  const colors = useTheme();
  const { goals } = useGoals();

  if (!transaction) return null;

  const meta = TYPE_META[transaction.type] ?? TYPE_META.expense;
  const linkedGoal = transaction.goalId ? goals.find(g => g.id === transaction.goalId) : null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete this ${transaction.type} of $${transaction.amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onClose();
            onDelete(transaction);
          },
        },
      ]
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapHeight={520}>
      <View style={styles.container}>
        {/* Header Icon + Type Badge */}
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
            <Text style={styles.icon}>{meta.icon}</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.typeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        {/* Amount */}
        <Text style={[styles.amount, { color: meta.color }]}>
          {meta.prefix}${Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>

        {/* Category Title */}
        <Text style={[styles.category, { color: colors.text }]}>
          {transaction.category}
        </Text>

        {/* Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>📅 Date</Text>
            <Text style={[styles.value, { color: colors.text }]}>{transaction.date}</Text>
          </View>
          {transaction.note ? (
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>📝 Note</Text>
              <Text style={[styles.value, { color: colors.text }]}>{transaction.note}</Text>
            </View>
          ) : null}
          {linkedGoal ? (
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>🎯 Linked Goal</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {linkedGoal.icon} {linkedGoal.title}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.btn, styles.editBtn, { backgroundColor: colors.backgroundElement }]}
            onPress={() => {
              onClose();
              onEdit(transaction);
            }}
          >
            <Text style={[styles.btnText, { color: colors.text }]}>✏️ Edit</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.deleteBtn, { backgroundColor: '#FEE2E2' }]}
            onPress={handleDelete}
          >
            <Text style={[styles.btnText, { color: colors.danger }]}>🗑️ Delete</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  iconWrap: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 24 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  typeText: { fontSize: 13, fontWeight: '700' },
  amount: { fontSize: 36, fontWeight: '900', marginBottom: 4, letterSpacing: -0.5 },
  category: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  detailsCard: { width: '100%', borderRadius: 16, padding: 16, gap: 14, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600' },
  value: { fontSize: 14, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  actionsRow: { flexDirection: 'row', gap: 12, width: '100%' },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  editBtn: {},
  deleteBtn: {},
  btnText: { fontSize: 15, fontWeight: '700' },
});
