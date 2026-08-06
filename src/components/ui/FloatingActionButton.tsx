import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';

interface FABProps {
  onPress: () => void;
  icon?: string;
  label?: string;
  style?: ViewStyle;
  color?: string;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  onPress, icon = '+', label, style, color = '#2E8B57',
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.fab,
      { backgroundColor: color },
      label ? styles.extended : {},
      pressed && styles.pressed,
      style,
    ]}
    onPress={onPress}
  >
    <Text style={styles.icon}>{icon}</Text>
    {label && <Text style={styles.label}>{label}</Text>}
  </Pressable>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#2E8B57', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
    flexDirection: 'row',
  },
  extended: { width: 'auto', paddingHorizontal: 20, borderRadius: 28 },
  icon: { fontSize: 22, color: '#fff', fontWeight: '700' },
  label: { color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 15 },
  pressed: { transform: [{ scale: 0.95 }] },
});
