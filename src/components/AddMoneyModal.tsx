import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { createTransaction } from '../services/transactionService';
import { updateUserProfile } from '../services/userService';

interface AddMoneyModalProps {
  visible: boolean;
  onClose: () => void;
  currentSavings: number;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ visible, onClose, currentSavings }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { firebaseUser } = useAuth();

  const handleAdd = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid amount', 'Please enter a positive number');
      return;
    }
    const uid = firebaseUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      // 1. Create a transaction in user's subcollection
      await createTransaction(uid, {
        type: 'income',
        amount: parsed,
        category: 'Add Money',
        note: 'Manual add money',
        date: new Date().toISOString().split('T')[0],
      });
      // 2. Update user profile's currentSavings
      const safeSavings = Number(currentSavings || 0);
      const newSavings = safeSavings + parsed;
      await updateUserProfile(uid, { currentSavings: newSavings });
      Alert.alert('Success', `$${parsed.toFixed(2)} added successfully`);
      setAmount('');
      onClose();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message || 'Failed to add money');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Add Money</Text>
          <Text style={styles.subtitle}>Add to your savings balance</Text>
          <TextInput
            placeholder="Amount ($)"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
          />
          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAdd}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Add</Text>
              )}
            </Pressable>
            <Pressable style={[styles.button, styles.cancel]} onPress={onClose} disabled={loading}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    color: '#1F2937',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  cancel: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
