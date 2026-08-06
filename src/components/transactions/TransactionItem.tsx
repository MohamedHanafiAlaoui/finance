import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/use-theme';
import type { Transaction } from '../../types/transaction';
import { getCategoryMeta } from '../../types/transaction';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (tx: Transaction) => void;
  onLongPress?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
}

const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction, onPress, onLongPress, onDelete,
}) => {
  const colors = useTheme();
  const meta = getCategoryMeta(transaction.category, transaction.type);
  const isIncome = transaction.type === 'income';
  const isSaving = transaction.type === 'saving';
  const prefix = isIncome || isSaving ? '+' : '-';
  const amountColor = isIncome ? '#22C55E' : isSaving ? '#0FA3B1' : '#EF4444';

  return (
    <Pressable
      onPress={() => onPress?.(transaction)}
      onLongPress={() => onLongPress?.(transaction)}
      delayLongPress={400}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.backgroundElement },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${meta.color}15` }]}>
        <Text style={styles.icon}>{meta.icon}</Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.category, { color: colors.text }]} numberOfLines={1}>
          {transaction.category}
        </Text>
        <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={1}>
          {transaction.note || formatDate(transaction.date)}
          {transaction.note ? ` · ${formatDate(transaction.date)}` : ''}
        </Text>
      </View>

      <Text style={[styles.amount, { color: amountColor }]}>
        {prefix}${Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
    </Pressable>
  );
};

export const TransactionCard = TransactionItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    elevation: 1,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  iconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 20 },
  info: { flex: 1, marginLeft: 12 },
  category: { fontSize: 15, fontWeight: '700' },
  note: { fontSize: 12, marginTop: 3 },
  amount: { fontSize: 16, fontWeight: '800' },
});
