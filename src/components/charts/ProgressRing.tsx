import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  progress: number;  // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  centerLabel?: string;
  centerSub?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress, size = 120, strokeWidth = 12,
  color = '#2E8B57', bgColor = '#E5E7EB',
  centerLabel, centerSub,
}) => {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, progress));
  const dash = (clamped / 100) * circumference;
  const gap = circumference - dash;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
        <Circle
          cx={cx} cy={cy} r={r}
          stroke={bgColor} strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx} cy={cy} r={r}
          stroke={color} strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.center}>
        {centerLabel && <Text style={[styles.label, { color }]}>{centerLabel}</Text>}
        {centerSub && <Text style={styles.sub}>{centerSub}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  label: { fontSize: 17, fontWeight: '800' },
  sub: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
});
