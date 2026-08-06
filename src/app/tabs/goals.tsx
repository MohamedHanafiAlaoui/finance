import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, Pressable, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGoals } from '../../context/GoalsContext';
import { useTheme } from '../../hooks/use-theme';
import { GoalCard } from '../../components/goals/GoalCard';
import { GoalFormSheet } from '../../components/goals/GoalFormSheet';
import { AddMoneySheet } from '../../components/goals/AddMoneySheet';
import { EmptyState } from '../../components/ui/EmptyState';
import { FloatingActionButton } from '../../components/ui/FloatingActionButton';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import type { GoalWithStats } from '../../types/goal';

type FilterType = 'active' | 'completed' | 'all';

export default function GoalsScreen() {
  const router = useRouter();
  const { goals, activeGoals, completedGoals, isLoading, deleteGoal, archiveGoal } = useGoals();
  const colors = useTheme();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('active');
  const [newGoalVisible, setNewGoalVisible] = useState(false);
  const [editGoal, setEditGoal] = useState<GoalWithStats | null>(null);
  const [addMoneyGoal, setAddMoneyGoal] = useState<GoalWithStats | null>(null);

  const filteredGoals = (() => {
    let list: GoalWithStats[];
    if (filter === 'active') list = activeGoals;
    else if (filter === 'completed') list = completedGoals;
    else list = goals;
    if (search.trim()) {
      list = list.filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  })();

  const totalTarget = activeGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = activeGoals.reduce((s, g) => s + g.currentAmount, 0);
  const avgProgress = activeGoals.length > 0
    ? activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length
    : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Goals</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {activeGoals.length} active · {completedGoals.length} completed
          </Text>
        </View>
        <Pressable
          style={styles.addBtn}
          onPress={() => setNewGoalVisible(true)}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </Pressable>
      </View>

      {/* Summary strip */}
      {activeGoals.length > 0 && (
        <View style={[styles.summary, { backgroundColor: '#2E8B57' }]}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>
              ${totalSaved.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Text>
            <Text style={styles.summaryLabel}>Total Saved</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>
              ${totalTarget.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Text>
            <Text style={styles.summaryLabel}>Total Target</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{avgProgress.toFixed(0)}%</Text>
            <Text style={styles.summaryLabel}>Avg Progress</Text>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.backgroundElement }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search goals..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {(['active', 'all', 'completed'] as FilterType[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip,
              { backgroundColor: filter === f ? '#2E8B57' : colors.backgroundElement }]}
          >
            <Text style={[styles.filterLabel,
              { color: filter === f ? '#fff' : colors.textSecondary }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Goals list */}
      {isLoading ? (
        <LoadingOverlay />
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={filter === 'completed' ? '🏆' : '🎯'}
          title={search ? 'No matching goals' : filter === 'completed' ? 'No completed goals yet' : 'No goals yet'}
          subtitle={search ? 'Try a different search term' : 'Create your first savings goal to get started!'}
          actionLabel={!search && filter === 'active' ? 'Create Goal' : undefined}
          onAction={() => setNewGoalVisible(true)}
        />
      ) : (
        <FlatList
          data={filteredGoals}
          keyExtractor={(g) => g.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GoalCard
              goal={item}
              onAddMoney={(g) => setAddMoneyGoal(g)}
              onEdit={(g) => setEditGoal(g)}
              onDelete={(g) => deleteGoal(g.id)}
              onPress={(g) => router.push(`/tabs/goal/${g.id}`)}
            />
          )}
        />
      )}

      <FloatingActionButton
        onPress={() => setNewGoalVisible(true)}
        icon="+"
        label="New Goal"
      />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: '900' },
  headerSub: { fontSize: 13, marginTop: 2 },
  addBtn: {
    backgroundColor: '#2E8B57', paddingHorizontal: 16,
    paddingVertical: 10, borderRadius: 20,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  summary: {
    flexDirection: 'row', paddingVertical: 16,
    paddingHorizontal: 20, marginHorizontal: 20,
    borderRadius: 16, marginBottom: 12,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { color: '#fff', fontSize: 16, fontWeight: '800' },
  summaryLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 4 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, borderRadius: 14,
    paddingHorizontal: 14, height: 46, marginBottom: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterLabel: { fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
});
