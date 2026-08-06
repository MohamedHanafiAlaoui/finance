import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert, Pressable,
} from 'react-native';
import { BottomSheet } from '../ui/BottomSheet';
import { AppButton } from '../ui/AppButton';
import { useTheme } from '../../hooks/use-theme';
import { useGoals } from '../../context/GoalsContext';
import { useTransactions } from '../../context/TransactionsContext';
import type { GoalWithStats } from '../../types/goal';

interface AddMoneySheetProps {
  visible: boolean;
  onClose: () => void;
  goal: GoalWithStats | null;
}

const QUICK_AMOUNTS = [50, 100, 250, 500];

export const AddMoneySheet: React.FC<AddMoneySheetProps> = ({ visible, onClose, goal }) => {
  const colors = useTheme();
  const { addMoneyToGoal } = useGoals();
  const { addTransaction } = useTransactions();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid positive amount');
      return;
    }
    if (!goal) return;

    setLoading(true);
    try {
      // Add to goal's currentAmount
      await addMoneyToGoal(goal.id, parsed);
      // Record a saving transaction linked to this goal
      await addTransaction({
        type: 'saving',
        amount: parsed,
        category: 'Goal Deposit',
        note: note.trim() || `Deposit to ${goal.title}`,
        date: new Date().toISOString().split('T')[0],
        goalId: goal.id,
      });
      setAmount('');
      setNote('');
      onClose();
      Alert.alert('Success! 🎉', `$${parsed.toFixed(2)} added to "${goal.title}"`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to add money');
    } finally {
      setLoading(false);
    }
  };

  if (!goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <BottomSheet visible={visible} onClose={onClose} snapHeight={480}>
      <View style={styles.goalHeader}>
        <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
          <Text style={styles.goalEmoji}>{goal.icon}</Text>
        </View>
        <View style={styles.goalInfo}>
          <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</Text>
          <Text style={[styles.goalRemaining, { color: colors.textSecondary }]}>
            ${remaining.toLocaleString()} remaining
          </Text>
        </View>
      </View>

      <Text style={[styles.sheetTitle, { color: colors.text }]}>💵 Add Money</Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text,
            borderColor: colors.backgroundSelected }]}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.quickAmounts}>
        {QUICK_AMOUNTS.map((qa) => (
          <Pressable
            key={qa}
            style={[styles.qaBtn, { backgroundColor: colors.backgroundElement }]}
            onPress={() => setAmount(qa.toString())}
          >
            <Text style={[styles.qaBtnText, { color: colors.text }]}>${qa}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Note (optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text,
            borderColor: colors.backgroundSelected }]}
          placeholder="e.g. Monthly contribution"
          placeholderTextColor={colors.textSecondary}
          value={note}
          onChangeText={setNote}
        />
      </View>

      <AppButton
        title={loading ? 'Adding...' : 'Add Money ✓'}
        onPress={handleAdd}
        loading={loading}
        style={styles.submitBtn}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  goalIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  goalEmoji: { fontSize: 22 },
  goalInfo: { marginLeft: 12 },
  goalTitle: { fontSize: 16, fontWeight: '700' },
  goalRemaining: { fontSize: 12, marginTop: 2 },
  sheetTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderRadius: 12, borderWidth: 1.5, padding: 14, fontSize: 16 },
  quickAmounts: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  qaBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  qaBtnText: { fontSize: 14, fontWeight: '700' },
  submitBtn: { marginTop: 8 },
});
