import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, G, Circle, Text as SvgText, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../../hooks/use-theme';

interface LineData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineData[];
  width?: number;
  height?: number;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data, width = 340, height = 160, color = '#2E8B57',
}) => {
  const colors = useTheme();
  const padL = 8; const padR = 8; const padT = 14; const padB = 28;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const maxVal = Math.max(1, ...data.map(d => d.value));
  const pts = data.map((d, i) => ({
    x: padL + (i / Math.max(1, data.length - 1)) * chartW,
    y: padT + chartH - (d.value / maxVal) * chartH,
    label: d.label,
    value: d.value,
  }));
  const polylinePoints = pts.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.2" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <G>
        {pts.length > 1 && (
          <Polyline
            points={polylinePoints}
            fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          />
        )}
        {pts.map((p, i) => (
          <G key={i}>
            <Circle cx={p.x} cy={p.y} r={4} fill={color} />
            <SvgText x={p.x} y={height - 8} textAnchor="middle" fontSize="9" fill={colors.textSecondary}>
              {p.label}
            </SvgText>
          </G>
        ))}
      </G>
    </Svg>
  );
};
