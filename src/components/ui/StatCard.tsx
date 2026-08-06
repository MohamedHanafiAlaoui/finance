import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/use-theme';

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, style }) => {
  const colors = useTheme();
  return (
    <View style={[
      styles.card, { backgroundColor: colors.backgroundElement }, style,
    ]}>
      <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0FA3B1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  iconWrap: { borderRadius: 12, padding: 8, marginBottom: 12 },
  icon: { fontSize: 20 },
  value: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  label: { fontSize: 12, fontWeight: '600' },
});
