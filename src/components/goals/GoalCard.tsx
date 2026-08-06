import React, { useState, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, Alert,
  Animated, ViewStyle, Platform,
} from 'react-native';
import { useTheme } from '../../hooks/use-theme';
import { ProgressBar } from '../ui/ProgressBar';
import type { GoalWithStats } from '../../types/goal';

interface GoalCardProps {
  goal: GoalWithStats;
  onAddMoney: (goal: GoalWithStats) => void;
  onEdit: (goal: GoalWithStats) => void;
  onDelete: (goal: GoalWithStats) => void;
  onPress: (goal: GoalWithStats) => void;
  style?: ViewStyle;
}

const formatCurrency = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const GoalCard: React.FC<GoalCardProps> = ({
  goal, onAddMoney, onEdit, onDelete, onPress, style,
}) => {
  const colors = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: Platform.OS !== 'web', tension: 200 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web', tension: 200 }).start();

  const handleDelete = () => {
    setMenuOpen(false);
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(goal) },
      ]
    );
  };

  const progressColor = goal.status === 'completed' ? '#22C55E' : goal.color || '#27D3C3';
  const bgGradient = `${goal.color || '#27D3C3'}10`;

  return (
    <Animated.View style={{ transform: [{ scale }], ...style as object }}>
      <Pressable
        onPress={() => onPress(goal)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.card, { backgroundColor: colors.backgroundElement }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: bgGradient }]}>
            <Text style={styles.icon}>{goal.icon}</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {goal.title}
            </Text>
            <Text style={[styles.deadline, { color: colors.textSecondary }]}>
              {goal.status === 'completed'
                ? '✅ Completed!'
                : goal.daysRemaining > 0
                ? `${goal.daysRemaining}d remaining`
                : goal.deadline
                ? 'Past deadline'
                : 'No deadline'}
            </Text>
          </View>
          <Pressable style={styles.menuBtn} onPress={() => setMenuOpen(v => !v)}>
            <Text style={[styles.menuDots, { color: colors.textSecondary }]}>⋮</Text>
          </Pressable>
        </View>

        {/* Dropdown menu */}
        {menuOpen && (
          <View style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}>
            <Pressable
              style={styles.dropItem}
              onPress={() => { setMenuOpen(false); onAddMoney(goal); }}
            >
              <Text style={styles.dropIcon}>💵</Text>
              <Text style={[styles.dropLabel, { color: colors.text }]}>Add Money</Text>
            </Pressable>
            <Pressable
              style={styles.dropItem}
              onPress={() => { setMenuOpen(false); onEdit(goal); }}
            >
              <Text style={styles.dropIcon}>✏️</Text>
              <Text style={[styles.dropLabel, { color: colors.text }]}>Edit Goal</Text>
            </Pressable>
            <Pressable style={styles.dropItem} onPress={handleDelete}>
              <Text style={styles.dropIcon}>🗑️</Text>
              <Text style={[styles.dropLabel, { color: colors.danger }]}>Delete Goal</Text>
            </Pressable>
          </View>
        )}

        {/* Amounts */}
        <View style={styles.amounts}>
          <View>
            <Text style={[styles.savedLabel, { color: colors.textSecondary }]}>Saved</Text>
            <Text style={[styles.savedAmount, { color: progressColor }]}>
              {formatCurrency(goal.currentAmount)}
            </Text>
          </View>
          <View style={styles.targetBlock}>
            <Text style={[styles.savedLabel, { color: colors.textSecondary }]}>Target</Text>
            <Text style={[styles.targetAmount, { color: colors.text }]}>
              {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <ProgressBar
          progress={goal.progress}
          color={progressColor}
          height={8}
          style={styles.progressBar}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.pct, { color: progressColor }]}>
            {goal.progress.toFixed(0)}%
          </Text>
          <Text style={[styles.remaining, { color: colors.textSecondary }]}>
            {formatCurrency(goal.remainingAmount)} to go
          </Text>
          {goal.status === 'active' && (
            <Pressable
              style={[styles.addBtn, { backgroundColor: '#27D3C320', borderColor: '#27D3C3' }]}
              onPress={() => onAddMoney(goal)}
            >
              <Text style={[styles.addBtnText, { color: '#0FA3B1' }]}>+ Add</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0FA3B1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconWrap: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 22 },
  titleBlock: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, fontWeight: '700' },
  deadline: { fontSize: 12, marginTop: 2 },
  menuBtn: { padding: 8 },
  menuDots: { fontSize: 20, fontWeight: '700' },
  dropdown: {
    position: 'absolute', top: 52, right: 12, zIndex: 100,
    borderRadius: 14, padding: 8, minWidth: 160,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 10,
  },
  dropItem: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10, borderRadius: 8 },
  dropIcon: { fontSize: 16 },
  dropLabel: { fontSize: 14, fontWeight: '600' },
  amounts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  savedLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  savedAmount: { fontSize: 20, fontWeight: '800' },
  targetBlock: { alignItems: 'flex-end' },
  targetAmount: { fontSize: 16, fontWeight: '600' },
  progressBar: { marginBottom: 12 },
  footer: { flexDirection: 'row', alignItems: 'center' },
  pct: { fontSize: 14, fontWeight: '800', marginRight: 8 },
  remaining: { flex: 1, fontSize: 12 },
  addBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5,
  },
  addBtnText: { fontSize: 13, fontWeight: '700' },
});
