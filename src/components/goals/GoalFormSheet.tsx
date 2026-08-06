import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { BottomSheet } from '../ui/BottomSheet';
import { AppButton } from '../ui/AppButton';
import { useTheme } from '../../hooks/use-theme';
import { useGoals } from '../../context/GoalsContext';
import type { Goal, GoalWithStats } from '../../types/goal';
import { GOAL_ICONS, GOAL_COLORS } from '../../types/goal';

interface GoalFormSheetProps {
  visible: boolean;
  onClose: () => void;
  editGoal?: GoalWithStats; // if provided, edit mode
}

export const GoalFormSheet: React.FC<GoalFormSheetProps> = ({
  visible, onClose, editGoal,
}) => {
  const colors = useTheme();
  const { createGoal, updateGoal } = useGoals();
  const isEdit = !!editGoal;

  const [title, setTitle] = useState(editGoal?.title ?? '');
  const [targetAmount, setTargetAmount] = useState(editGoal?.targetAmount?.toString() ?? '');
  const [deadline, setDeadline] = useState(editGoal?.deadline ?? '');
  const [icon, setIcon] = useState(editGoal?.icon ?? GOAL_ICONS[0]);
  const [color, setColor] = useState(editGoal?.color ?? GOAL_COLORS[0]);
  const [priority, setPriority] = useState<Goal['priority']>(editGoal?.priority ?? 'medium');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Goal name is required';
    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) newErrors.targetAmount = 'Enter a valid target amount';
    if (deadline) {
      const d = new Date(deadline);
      if (isNaN(d.getTime())) newErrors.deadline = 'Enter a valid date (YYYY-MM-DD)';
      else if (!isEdit && d <= new Date()) newErrors.deadline = 'Deadline must be in the future';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = {
        title: title.trim(),
        icon,
        color,
        targetAmount: parseFloat(targetAmount),
        deadline,
        priority,
      };
      if (isEdit && editGoal) {
        await updateGoal(editGoal.id, data);
      } else {
        await createGoal(data);
      }
      onClose();
      resetForm();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (!isEdit) {
      setTitle(''); setTargetAmount(''); setDeadline('');
      setIcon(GOAL_ICONS[0]); setColor(GOAL_COLORS[0]); setPriority('medium');
      setErrors({});
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapHeight={680}>
      <Text style={[styles.sheetTitle, { color: colors.text }]}>
        {isEdit ? '✏️ Edit Goal' : '🎯 New Goal'}
      </Text>

      {/* Goal name */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Goal Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text,
            borderColor: errors.title ? colors.danger : colors.backgroundSelected }]}
          placeholder="e.g. Buy a House"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />
        {errors.title && <Text style={[styles.err, { color: colors.danger }]}>{errors.title}</Text>}
      </View>

      {/* Target amount */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Target Amount *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text,
            borderColor: errors.targetAmount ? colors.danger : colors.backgroundSelected }]}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={targetAmount}
          onChangeText={setTargetAmount}
        />
        {errors.targetAmount && <Text style={[styles.err, { color: colors.danger }]}>{errors.targetAmount}</Text>}
      </View>

      {/* Deadline */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Deadline (optional, YYYY-MM-DD)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text,
            borderColor: errors.deadline ? colors.danger : colors.backgroundSelected }]}
          placeholder="2026-12-31"
          placeholderTextColor={colors.textSecondary}
          value={deadline}
          onChangeText={setDeadline}
        />
        {errors.deadline && <Text style={[styles.err, { color: colors.danger }]}>{errors.deadline}</Text>}
      </View>

      {/* Icon picker */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Icon</Text>
        <View style={styles.iconGrid}>
          {GOAL_ICONS.map((ic) => (
            <Pressable
              key={ic}
              onPress={() => setIcon(ic)}
              style={[styles.iconOpt, { backgroundColor: icon === ic ? color + '30' : colors.backgroundElement,
                borderColor: icon === ic ? color : 'transparent', borderWidth: 2 }]}
            >
              <Text style={styles.iconEmoji}>{ic}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Color picker */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
        <View style={styles.colorGrid}>
          {GOAL_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[styles.colorOpt, { backgroundColor: c,
                transform: [{ scale: color === c ? 1.25 : 1 }],
                borderWidth: color === c ? 3 : 0, borderColor: '#fff' }]}
            />
          ))}
        </View>
      </View>

      {/* Priority */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
        <View style={styles.priorityRow}>
          {(['low', 'medium', 'high'] as const).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              style={[styles.priorityBtn,
                { backgroundColor: priority === p ? '#2E8B57' : colors.backgroundElement }]}
            >
              <Text style={[styles.priorityTxt,
                { color: priority === p ? '#fff' : colors.textSecondary }]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <AppButton
        title={loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Goal 🚀'}
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitBtn}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderRadius: 12, borderWidth: 1.5, padding: 14, fontSize: 15 },
  err: { fontSize: 11, marginTop: 4 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconOpt: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconEmoji: { fontSize: 20 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorOpt: { width: 30, height: 30, borderRadius: 15 },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  priorityTxt: { fontSize: 13, fontWeight: '700' },
  submitBtn: { marginTop: 8, marginBottom: 16 },
});
