import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/use-theme';

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieSlice[];
  size?: number;
  strokeWidth?: number;
}

const polarToCartesian = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const buildArc = (cx: number, cy: number, r: number, start: number, end: number): string => {
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
};

export const PieChart: React.FC<PieChartProps> = ({ data, size = 160, strokeWidth = 28 }) => {
  const colors = useTheme();
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2; const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  let angle = 0;
  const slices = data.map(d => {
    const deg = (d.value / Math.max(1, total)) * 360;
    const s = { start: angle, end: angle + deg, ...d };
    angle += deg;
    return s;
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G>
          {slices.map((s, i) => (
            <Path
              key={i}
              d={buildArc(cx, cy, r, s.start, Math.min(s.end, s.start + 359.9))}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
            />
          ))}
          <Circle cx={cx} cy={cy} r={r - strokeWidth / 2 + 2} fill={colors.backgroundElement} />
        </G>
      </Svg>
      <View style={styles.legend}>
        {data.map((d, i) => (
          <View key={i} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: d.color }]} />
            <Text style={[styles.legendLabel, { color: colors.text }]} numberOfLines={1}>{d.label}</Text>
            <Text style={[styles.legendVal, { color: colors.textSecondary }]}>
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 12, fontWeight: '500' },
  legendVal: { fontSize: 12, fontWeight: '700' },
});
