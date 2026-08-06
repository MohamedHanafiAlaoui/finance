import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface AvatarProps {
  initials: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials, size = 48, color = '#2E8B57', style,
}) => {
  const fontSize = size * 0.38;
  return (
    <View style={[
      styles.circle,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      style,
    ]}>
      <Text style={[styles.text, { fontSize, color: '#fff' }]}>{initials.slice(0, 2).toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: { justifyContent: 'center', alignItems: 'center' },
  text: { fontWeight: '800', letterSpacing: 0.5 },
});
