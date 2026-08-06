import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/use-theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({ children, style, padding = 16 }) => {
  const colors = useTheme();
  return (
    <View style={[
      styles.card,
      { backgroundColor: colors.backgroundElement, borderColor: colors.border, padding },
      style,
    ]}>
      {children}
    </View>
  );
};

export const AppCard = Card;

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#0FA3B1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
});
