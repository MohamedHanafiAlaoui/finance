import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { BottomSheet } from '../ui/BottomSheet';
import { AppButton } from '../ui/AppButton';
import { useTheme } from '../../hooks/use-theme';
import { useTransactions } from '../../context/TransactionsContext';
import { useGoals as useGoalsHook } from '../../context/GoalsContext';
import { addMoneyToGoal } from '../../services/goalService';
import { useAuth } from '../../context/AuthContext';
import type { Transaction, TransactionType } from '../../types/transaction';
import {
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, SAVING_CATEGORIES,
} from '../../types/transaction';

interface TransactionFormSheetProps {
  visible: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  editTx?: Transaction | null;
}

const TYPE_OPTIONS: { type: TransactionType; label: string; icon: string; color: string }[] = [
  { type: 'income', label: 'Income', icon: '💵', color: '#2E8B57' },
  { type: 'expense', label: 'Expense', icon: '💸', color: '#E74C3C' },
  { type: 'saving', label: 'Saving', icon: '🏦', color: '#2980B9' },
];

export const TransactionFormSheet: React.FC<TransactionFormSheetProps> = ({
  visible, onClose, defaultType = 'income', editTx,
}) => {
  const colors = useTheme();
  const { addTransaction, editTransaction } = useTransactions();
  const { goals } = useGoalsHook();
  const { firebaseUser } = useAuth();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTx) {
      setType(editTx.type);
      setAmount(String(editTx.amount));
      setCategory(editTx.category);
      setNote(editTx.note || '');
      setDate(editTx.date || new Date().toISOString().split('T')[0]);
      setSelectedGoalId(editTx.goalId || '');
    } else {
      setType(defaultType);
      resetForm();
    }
  }, [editTx, visible, defaultType]);

  const getCategoryList = (): readonly string[] => {
    if (type === 'income') return INCOME_CATEGORIES;
    if (type === 'expense') return EXPENSE_CATEGORIES;
    return SAVING_CATEGORIES;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) newErrors.amount = 'Enter a valid positive amount';
    if (!category) newErrors.category = 'Select a category';
    if (!date) newErrors.date = 'Enter a date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const parsed = parseFloat(amount);
      const payload = {
        type,
        amount: parsed,
        category,
        note: note.trim(),
        date,
        goalId: type === 'saving' && selectedGoalId ? selectedGoalId : undefined,
      };

      if (editTx) {
        await editTransaction(editTx.id, payload);
      } else {
        await addTransaction(payload);
        // If saving type with a goal, update goal's currentAmount
        if (type === 'saving' && selectedGoalId && firebaseUser?.uid) {
          await addMoneyToGoal(firebaseUser.uid, selectedGoalId, parsed);
        }
      }

      resetForm();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount(''); setCategory(''); setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedGoalId(''); setErrors({});
  };

  const typeOpt = TYPE_OPTIONS.find(t => t.type === type) ?? TYPE_OPTIONS[0];

  return (
    <BottomSheet visible={visible} onClose={onClose} snapHeight={680}>
      <Text style={[styles.sheetTitle, { color: colors.text }]}>
        {editTx ? 'Edit Transaction' : 'Add Transaction'}
      </Text>

      {/* Type selector */}
      <View style={styles.typeRow}>
        {TYPE_OPTIONS.map((opt) => (
          <Pressable
            key={opt.type}
            onPress={() => { setType(opt.type); setCategory(''); }}
            style={[styles.typeBtn,
              { backgroundColor: type === opt.type ? opt.color : colors.backgroundElement }]}
          >
            <Text style={styles.typeIcon}>{opt.icon}</Text>
            <Text style={[styles.typeLabel,
              { color: type === opt.type ? '#fff' : colors.textSecondary }]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Amount */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Amount *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text,
            borderColor: errors.amount ? colors.danger : typeOpt.color }]}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        {errors.amount && <Text style={[styles.err, { color: colors.danger }]}>{errors.amount}</Text>}
      </View>

      {/* Category chips */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          <View style={styles.chips}>
            {getCategoryList().map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.chip,
                  { backgroundColor: category === cat ? typeOpt.color : colors.backgroundElement }]}
              >
                <Text style={[styles.chipText,
                  { color: category === cat ? '#fff' : colors.textSecondary }]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        {errors.category && <Text style={[styles.err, { color: colors.danger }]}>{errors.category}</Text>}
      </View>

      {/* Goal picker (only for saving type) */}
      {type === 'saving' && goals.filter(g => g.status === 'active').length > 0 && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Link to Goal (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chips}>
              <Pressable
                onPress={() => setSelectedGoalId('')}
                style={[styles.chip,
                  { backgroundColor: !selectedGoalId ? typeOpt.color : colors.backgroundElement }]}
              >
                <Text style={[styles.chipText,
                  { color: !selectedGoalId ? '#fff' : colors.textSecondary }]}>None</Text>
              </Pressable>
              {goals.filter(g => g.status === 'active').map(g => (
                <Pressable
                  key={g.id}
                  onPress={() => setSelectedGoalId(g.id)}
                  style={[styles.chip,
                    { backgroundColor: selectedGoalId === g.id ? typeOpt.color : colors.backgroundElement }]}
                >
                  <Text style={[styles.chipText,
                    { color: selectedGoalId === g.id ? '#fff' : colors.textSecondary }]}>
                    {g.icon} {g.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Note */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Note (optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text,
            borderColor: colors.backgroundSelected }]}
          placeholder="Add a note..."
          placeholderTextColor={colors.textSecondary}
          value={note}
          onChangeText={setNote}
        />
      </View>

      {/* Date */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Date *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text,
            borderColor: errors.date ? colors.danger : colors.backgroundSelected }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
          value={date}
          onChangeText={setDate}
        />
        {errors.date && <Text style={[styles.err, { color: colors.danger }]}>{errors.date}</Text>}
      </View>

      <AppButton
        title={loading ? 'Saving...' : editTx ? 'Update Transaction' : 'Save Transaction'}
        onPress={handleSubmit}
        loading={loading}
        style={[styles.submitBtn, { backgroundColor: typeOpt.color }]}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetTitle: { fontSize: 22, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  typeIcon: { fontSize: 16 },
  typeLabel: { fontSize: 13, fontWeight: '700' },
  field: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderRadius: 12, borderWidth: 1.5, padding: 14, fontSize: 15 },
  err: { fontSize: 11, marginTop: 4 },
  chipsScroll: { marginTop: 2 },
  chips: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: '600' },
  submitBtn: { marginTop: 8 },
});
