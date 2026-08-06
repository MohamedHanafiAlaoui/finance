import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/use-theme';

interface ProgressBarProps {
  progress: number;  // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress, color = '#27D3C3', height = 8, showLabel = false, style,
}) => {
  const colors = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const clamped = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    Animated.spring(anim, {
      toValue: clamped,
      useNativeDriver: false,
      tension: 60,
      friction: 8,
    }).start();
  }, [clamped]);

  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={style}>
      {showLabel && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{clamped.toFixed(0)}%</Text>
      )}
      <View style={[
        styles.track, { backgroundColor: colors.backgroundSelected, height, borderRadius: height / 2 },
      ]}>
        <Animated.View style={[
          styles.fill,
          { width, backgroundColor: color, height, borderRadius: height / 2 },
        ]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '600', textAlign: 'right', marginBottom: 4 },
  track: { overflow: 'hidden' },
  fill: {},
});
