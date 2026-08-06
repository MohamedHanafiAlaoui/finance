import React, { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import BalanceCard from '../../components/home/BalanceCard';
import SavingsCard from '../../components/home/SavingsCard';
import TransactionItem from '../../components/home/TransactionItem';
import { useAuth } from '../../context/AuthContext';
import { subscribeTransactions } from '../../services/transactionService';
import { Transaction } from '../../types/transaction';
import { AddMoneyModal } from '../../components/AddMoneyModal';
import { NewGoalModal } from '../../components/NewGoalModal';

export default function HomeScreen() {
  const { currentUser, firebaseUser, logout } = useAuth();
  const uid = firebaseUser?.uid;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [addMoneyVisible, setAddMoneyVisible] = useState(false);
  const [newGoalVisible, setNewGoalVisible] = useState(false);

  useEffect(() => {
    if (uid) {
      const unsubTx = subscribeTransactions(uid, setTransactions);
      return () => {
        unsubTx();
      };
    }
  }, [uid]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to log out.');
    }
  };

  // Safe values from user profile
  const safeSavings = Number(currentUser?.currentSavings ?? 0);
  const safeGoal = Number(currentUser?.goalAmount ?? 0);

  if (!uid) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()} 👋</Text>
              <Text style={styles.name}>{currentUser?.fullName || 'User'}</Text>
            </View>
            <Pressable style={styles.profileButton} onPress={handleLogout}>
              <Text style={styles.profileText}>
                {currentUser?.initials || currentUser?.fullName?.[0] || '?'}
              </Text>
            </Pressable>
          </View>

          {/* Balance Card */}
          <BalanceCard
            currentSavings={safeSavings}
            goalAmount={safeGoal}
          />

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Pressable style={styles.quickAction} onPress={() => setAddMoneyVisible(true)}>
              <Text style={styles.quickActionIcon}>➕</Text>
              <Text style={styles.quickActionText}>Add Money</Text>
            </Pressable>
            <Pressable style={styles.quickAction} onPress={() => setNewGoalVisible(true)}>
              <Text style={styles.quickActionIcon}>🎯</Text>
              <Text style={styles.quickActionText}>New Goal</Text>
            </Pressable>
            <Pressable style={styles.quickAction} onPress={handleLogout}>
              <Text style={styles.quickActionIcon}>🚪</Text>
              <Text style={styles.quickActionText}>Logout</Text>
            </Pressable>
          </View>

          {/* Savings Goals Section */}
          {currentUser?.savingsGoal ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Savings Goal</Text>
              </View>
              <SavingsCard
                goalName={currentUser.savingsGoal}
                currentAmount={safeSavings}
                targetAmount={safeGoal}
              />
            </>
          ) : null}

          {/* Recent Transactions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Text style={styles.seeAll}>{transactions.length} total</Text>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Tap "Add Money" to record your first transaction
              </Text>
            </View>
          ) : (
            transactions.slice(0, 10).map((transaction) => (
              <TransactionItem
                key={transaction.id}
                title={transaction.category}
                date={transaction.date}
                amount={`${transaction.type === 'income' ? '+' : '-'}$${Number(transaction.amount || 0).toFixed(2)}`}
                type={transaction.type}
              />
            ))
          )}
        </View>
      </ScrollView>
      <AddMoneyModal
        visible={addMoneyVisible}
        onClose={() => setAddMoneyVisible(false)}
        currentSavings={safeSavings}
      />
      <NewGoalModal
        visible={newGoalVisible}
        onClose={() => setNewGoalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20, paddingBottom: 30 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6B7280' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  greeting: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  name: { fontSize: 28, fontWeight: '800', color: '#1F2937', marginTop: 4 },
  profileButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 },
  profileText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28, gap: 12 },
  quickAction: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  quickActionIcon: { fontSize: 28, marginBottom: 6 },
  quickActionText: { fontSize: 12, color: '#1F2937', fontWeight: '600', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
  seeAll: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 24 },
});