import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppButton } from './AppButton';
import { useTheme } from '../../hooks/use-theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon, title, subtitle, actionLabel, onAction,
}) => {
  const colors = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElement }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.sub, { color: colors.textSecondary }]}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <AppButton title={actionLabel} onPress={onAction} size="sm" style={styles.btn} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0FA3B1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  icon: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 18 },
  btn: { marginTop: 4, paddingHorizontal: 24 },
});
