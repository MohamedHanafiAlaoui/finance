import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, SectionList,
  Pressable, ScrollView, StatusBar, TextInput, RefreshControl, Alert, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../../context/TransactionsContext';
import { useTheme } from '../../hooks/use-theme';
import { TransactionItem } from '../../components/transactions/TransactionItem';
import { TransactionFormSheet } from '../../components/transactions/TransactionFormSheet';
import { TransactionDetailModal } from '../../components/transactions/TransactionDetailModal';
import { FloatingActionButton } from '../../components/ui/FloatingActionButton';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { EmptyState } from '../../components/ui/EmptyState';
import { exportTransactionsToCSV } from '../../services/csvExportService';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, SAVING_CATEGORIES } from '../../types/transaction';
import type { Transaction, TransactionType } from '../../types/transaction';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type DateFilterType = 'all' | 'today' | 'this_week' | 'this_month' | 'custom';
type SortType = 'newest' | 'oldest' | 'highest' | 'lowest';

interface TransactionSection {
  title: string;
  monthKey: string;
  income: number;
  expense: number;
  saving: number;
  data: Transaction[];
}

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, ...SAVING_CATEGORIES];

export default function TransactionsScreen() {
  const { transactions, isLoading, error, deleteTransaction } = useTransactions();
  const colors = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');

  // Advanced Filters state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [formVisible, setFormVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const categoriesForCurrentType = useMemo(() => {
    if (typeFilter === 'income') return INCOME_CATEGORIES;
    if (typeFilter === 'expense') return EXPENSE_CATEGORIES;
    if (typeFilter === 'saving') return SAVING_CATEGORIES;
    return ALL_CATEGORIES;
  }, [typeFilter]);

  // Date range predicate
  const isWithinDateRange = useCallback((dateStr: string, range: DateFilterType) => {
    if (range === 'all') return true;
    const txDate = new Date(dateStr);
    const now = new Date();

    if (range === 'today') {
      return (
        txDate.getFullYear() === now.getFullYear() &&
        txDate.getMonth() === now.getMonth() &&
        txDate.getDate() === now.getDate()
      );
    }

    if (range === 'this_week') {
      const startOfWeek = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      return txDate >= startOfWeek;
    }

    if (range === 'this_month') {
      return (
        txDate.getFullYear() === now.getFullYear() &&
        txDate.getMonth() === now.getMonth()
      );
    }

    if (range === 'custom') {
      if (startDate && new Date(dateStr) < new Date(startDate)) return false;
      if (endDate && new Date(dateStr) > new Date(endDate)) return false;
      return true;
    }

    return true;
  }, [startDate, endDate]);

  // Filter & Sort
  const filteredTxs = useMemo(() => {
    let list = transactions;

    if (typeFilter !== 'all') {
      list = list.filter((t) => t.type === typeFilter);
    }

    if (catFilter !== 'all') {
      list = list.filter((t) => t.category === catFilter);
    }

    if (dateFilter !== 'all') {
      list = list.filter((t) => isWithinDateRange(t.date, dateFilter));
    }

    // Min / Max amount filters
    const min = parseFloat(minAmount);
    if (!isNaN(min) && min > 0) {
      list = list.filter((t) => t.amount >= min);
    }
    const max = parseFloat(maxAmount);
    if (!isNaN(max) && max > 0) {
      list = list.filter((t) => t.amount <= max);
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q)) ||
          t.amount.toString().includes(q)
      );
    }

    // Sort
    const sorted = [...list];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'highest') {
      sorted.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'lowest') {
      sorted.sort((a, b) => a.amount - b.amount);
    }

    return sorted;
  }, [transactions, typeFilter, catFilter, dateFilter, isWithinDateRange, minAmount, maxAmount, search, sortBy]);

  // Monthly Grouping Sections
  const sections = useMemo(() => {
    const map = new Map<string, TransactionSection>();

    filteredTxs.forEach((tx) => {
      let d = new Date(tx.date);
      if (isNaN(d.getTime())) d = new Date();
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthTitle = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!map.has(monthKey)) {
        map.set(monthKey, {
          title: monthTitle,
          monthKey,
          income: 0,
          expense: 0,
          saving: 0,
          data: [],
        });
      }

      const sec = map.get(monthKey)!;
      sec.data.push(tx);
      if (tx.type === 'income') sec.income += tx.amount;
      else if (tx.type === 'expense') sec.expense += tx.amount;
      else if (tx.type === 'saving') sec.saving += tx.amount;
    });

    return Array.from(map.values());
  }, [filteredTxs]);

  // Filtered totals
  const summaryStats = useMemo(() => {
    const income = filteredTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filteredTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const saving = filteredTxs.filter((t) => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
    const net = income - expense - saving;
    return { income, expense, saving, net };
  }, [filteredTxs]);

  // Handlers
  const handleItemPress = (tx: Transaction) => {
    setSelectedTx(tx);
    setDetailModalVisible(true);
  };

  const handleItemLongPress = (tx: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Delete ${tx.type} of $${tx.amount.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              await deleteTransaction(tx.id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const handleEditFromModal = (tx: Transaction) => {
    setEditTx(tx);
    setFormVisible(true);
  };

  const handleDeleteFromModal = async (tx: Transaction) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await deleteTransaction(tx.id);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete transaction');
    }
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTxs);
  };

  const hasActiveAdvancedFilters = minAmount !== '' || maxAmount !== '' || startDate !== '' || endDate !== '';

  const clearAllFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCatFilter('all');
    setDateFilter('all');
    setMinAmount('');
    setMaxAmount('');
    setStartDate('');
    setEndDate('');
    setShowAdvanced(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {filteredTxs.length} records · {sections.length} months
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={[styles.exportBtn, { backgroundColor: colors.backgroundElement }]}
            onPress={handleExportCSV}
          >
            <Text style={[styles.exportBtnText, { color: colors.text }]}>📊 CSV</Text>
          </Pressable>

          <Pressable
            style={[styles.addBtn, { backgroundColor: '#2E8B57' }]}
            onPress={() => {
              setEditTx(null);
              setFormVisible(true);
            }}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </Pressable>
        </View>
      </View>

      {/* Search Bar + Filter Toggle */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchWrap, { backgroundColor: colors.backgroundElement }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search category, note, amount..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} style={styles.clearSearch}>
              <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>✕</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          style={[
            styles.filterToggleBtn,
            {
              backgroundColor: hasActiveAdvancedFilters ? colors.primaryLight : colors.backgroundElement,
              borderColor: hasActiveAdvancedFilters ? '#2E8B57' : 'transparent',
            },
          ]}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={styles.filterToggleIcon}>⚙️</Text>
        </Pressable>
      </View>

      {/* Advanced Filter Collapsible Section */}
      {showAdvanced && (
        <View style={[styles.advancedBox, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.advancedTitle, { color: colors.text }]}>Advanced Filters</Text>

          {/* Amount range */}
          <View style={styles.advancedRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Min Amount ($)</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={minAmount}
                onChangeText={setMinAmount}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Max Amount ($)</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="No limit"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={maxAmount}
                onChangeText={setMaxAmount}
              />
            </View>
          </View>

          {/* Custom Date range */}
          <View style={styles.advancedRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Start Date</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={startDate}
                onChangeText={(val) => {
                  setStartDate(val);
                  setDateFilter('custom');
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>End Date</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={endDate}
                onChangeText={(val) => {
                  setEndDate(val);
                  setDateFilter('custom');
                }}
              />
            </View>
          </View>

          {hasActiveAdvancedFilters && (
            <Pressable onPress={clearAllFilters} style={styles.resetBtn}>
              <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 12 }}>Reset All Filters</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Filter Chips */}
      <View style={styles.filterSection}>
        {/* Type Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
          <View style={styles.chipRow}>
            {(['all', 'income', 'expense', 'saving'] as const).map((t) => (
              <Pressable
                key={t}
                style={[
                  styles.chip,
                  { backgroundColor: typeFilter === t ? '#2E8B57' : colors.backgroundElement },
                ]}
                onPress={() => {
                  setTypeFilter(t);
                  setCatFilter('all');
                }}
              >
                <Text style={[styles.chipText, { color: typeFilter === t ? '#fff' : colors.textSecondary }]}>
                  {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Date Range Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
          <View style={styles.chipRow}>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
            ].map((r) => (
              <Pressable
                key={r.id}
                style={[
                  styles.chipOutline,
                  {
                    backgroundColor: dateFilter === r.id ? colors.primaryLight : colors.backgroundElement,
                    borderColor: dateFilter === r.id ? '#2E8B57' : colors.backgroundSelected,
                  },
                ]}
                onPress={() => setDateFilter(r.id as DateFilterType)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: dateFilter === r.id ? '#2E8B57' : colors.textSecondary },
                  ]}
                >
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Sort Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
          <View style={styles.chipRow}>
            <Text style={[styles.sortPrefix, { color: colors.textSecondary }]}>Sort:</Text>
            {[
              { id: 'newest', label: 'Newest' },
              { id: 'oldest', label: 'Oldest' },
              { id: 'highest', label: 'Highest $' },
              { id: 'lowest', label: 'Lowest $' },
            ].map((s) => (
              <Pressable
                key={s.id}
                style={[
                  styles.chipSmall,
                  { backgroundColor: sortBy === s.id ? colors.backgroundSelected : colors.backgroundElement },
                ]}
                onPress={() => setSortBy(s.id as SortType)}
              >
                <Text
                  style={[
                    styles.chipTextSmall,
                    { color: sortBy === s.id ? colors.text : colors.textSecondary },
                  ]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Summary Strip */}
      <View style={[styles.summaryStrip, { backgroundColor: colors.backgroundElement }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Income</Text>
          <Text style={[styles.summaryValue, { color: '#22C55E' }]}>
            +${summaryStats.income.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.backgroundSelected }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Expense</Text>
          <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
            -${summaryStats.expense.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.backgroundSelected }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Net</Text>
          <Text
            style={[
              styles.summaryValue,
              { color: summaryStats.net >= 0 ? colors.text : colors.danger },
            ]}
          >
            {summaryStats.net >= 0 ? '+' : '-'}$
            {Math.abs(summaryStats.net).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
        </View>
      </View>

      {/* Main List with Sticky Month Headers */}
      {isLoading ? (
        <LoadingOverlay />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={{ color: colors.danger, fontWeight: '700' }}>{error}</Text>
        </View>
      ) : filteredTxs.length === 0 ? (
        <EmptyState
          icon={search || typeFilter !== 'all' || dateFilter !== 'all' ? '🔍' : '💸'}
          title={search || typeFilter !== 'all' ? 'No matching transactions' : 'No transactions yet'}
          subtitle={
            search || typeFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your search query or filters'
              : 'Add your first income, expense, or savings deposit!'
          }
          actionLabel={search || hasActiveAdvancedFilters ? 'Clear All Filters' : 'Add Transaction'}
          onAction={() => {
            if (search || hasActiveAdvancedFilters) {
              clearAllFilters();
            } else {
              setEditTx(null);
              setFormVisible(true);
            }
          }}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E8B57" />
          }
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              <Text style={[styles.sectionStats, { color: colors.textSecondary }]}>
                +{section.income.toFixed(0)} · -{section.expense.toFixed(0)}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              onPress={handleItemPress}
              onLongPress={handleItemLongPress}
            />
          )}
        />
      )}

      {/* FAB */}
      <FloatingActionButton
        onPress={() => {
          setEditTx(null);
          setFormVisible(true);
        }}
        icon="+"
      />

      {/* Form Sheet */}
      <TransactionFormSheet
        visible={formVisible}
        onClose={() => {
          setFormVisible(false);
          setEditTx(null);
        }}
        defaultType={typeFilter === 'all' ? 'expense' : typeFilter}
        editTx={editTx}
      />

      {/* Detail Modal */}
      <TransactionDetailModal
        visible={detailModalVisible}
        transaction={selectedTx}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedTx(null);
        }}
        onEdit={handleEditFromModal}
        onDelete={handleDeleteFromModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '900' },
  sub: { fontSize: 13, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  exportBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 },
  exportBtnText: { fontSize: 13, fontWeight: '700' },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  searchContainer: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 8 },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  clearSearch: { padding: 4 },
  filterToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleIcon: { fontSize: 18 },
  advancedBox: { marginHorizontal: 20, borderRadius: 16, padding: 14, marginBottom: 10, gap: 10 },
  advancedTitle: { fontSize: 14, fontWeight: '700' },
  advancedRow: { flexDirection: 'row', gap: 12 },
  fieldLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  fieldInput: { borderRadius: 10, padding: 10, fontSize: 13 },
  resetBtn: { alignSelf: 'flex-end', marginTop: 4 },
  filterSection: { marginBottom: 6 },
  scrollRow: { paddingHorizontal: 20, marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  chipOutline: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '700' },
  sortPrefix: { fontSize: 12, fontWeight: '700', marginRight: 4 },
  chipSmall: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  chipTextSmall: { fontSize: 11, fontWeight: '700' },
  summaryStrip: {
    flexDirection: 'row',
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  summaryDivider: { width: 1, height: 20, marginHorizontal: 8 },
  errorBox: { padding: 20, alignItems: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionStats: { fontSize: 12, fontWeight: '600' },
});
