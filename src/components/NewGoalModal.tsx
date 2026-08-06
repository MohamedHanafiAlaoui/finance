import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/userService';

interface NewGoalModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NewGoalModal: React.FC<NewGoalModalProps> = ({ visible, onClose }) => {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { firebaseUser, currentUser } = useAuth();

  const handleSave = async () => {
    setError('');

    if (!goalName.trim()) {
      setError('Please enter a goal name.');
      return;
    }

    const parsed = parseFloat(targetAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid target amount.');
      return;
    }

    const uid = firebaseUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile(uid, {
        savingsGoal: goalName.trim(),
        goalAmount: parsed,
      });
      Alert.alert('Goal Set!', `"${goalName.trim()}" — $${parsed.toFixed(2)}`);
      setGoalName('');
      setTargetAmount('');
      setError('');
      onClose();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to save goal.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGoalName('');
    setTargetAmount('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Header Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.headerIcon}>🎯</Text>
            </View>

            <Text style={styles.title}>New Savings Goal</Text>
            <Text style={styles.subtitle}>
              Set a new target to stay motivated
            </Text>

            {/* Current Goal Indicator */}
            {currentUser?.savingsGoal ? (
              <View style={styles.currentGoalBanner}>
                <Text style={styles.currentGoalLabel}>Current goal</Text>
                <Text style={styles.currentGoalName}>
                  {currentUser.savingsGoal} — ${Number(currentUser.goalAmount || 0).toFixed(0)}
                </Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Goal Name</Text>
              <TextInput
                placeholder="e.g. Vacation Fund, New Car, Emergency"
                placeholderTextColor="#9CA3AF"
                value={goalName}
                onChangeText={(text) => {
                  setGoalName(text);
                  setError('');
                }}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Target Amount ($)</Text>
              <TextInput
                placeholder="e.g. 5000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={targetAmount}
                onChangeText={(text) => {
                  setTargetAmount(text);
                  setError('');
                }}
                style={styles.input}
              />
            </ScrollView>

            <View style={styles.buttons}>
              <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Set Goal</Text>
                )}
              </Pressable>
              <Pressable
                style={[styles.button, styles.cancel]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  currentGoalBanner: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  currentGoalLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  currentGoalName: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '700',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  buttons: {
    marginTop: 8,
    gap: 10,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  cancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 16,
  },
});
