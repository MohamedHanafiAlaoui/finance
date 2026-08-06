import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../hooks/use-theme';

interface BarData {
  label: string;
  income: number;
  expense: number;
}

interface BarChartProps {
  data: BarData[];
  width?: number;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, width = 340, height = 180 }) => {
  const colors = useTheme();
  const padL = 8; const padR = 8; const padT = 10; const padB = 28;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const maxVal = Math.max(1, ...data.map(d => Math.max(d.income, d.expense)));
  const barW = (chartW / data.length) * 0.3;
  const groupW = chartW / data.length;

  return (
    <View>
      <Svg width={width} height={height}>
        <G x={padL} y={padT}>
          {data.map((d, i) => {
            const incH = (d.income / maxVal) * chartH;
            const expH = (d.expense / maxVal) * chartH;
            const x = i * groupW + groupW * 0.15;
            return (
              <G key={i}>
                {/* Income bar */}
                <Rect
                  x={x} y={chartH - incH}
                  width={barW} height={incH}
                  rx={4} fill="#2E8B57" opacity={0.85}
                />
                {/* Expense bar */}
                <Rect
                  x={x + barW + 3} y={chartH - expH}
                  width={barW} height={expH}
                  rx={4} fill="#E74C3C" opacity={0.75}
                />
                <SvgText
                  x={x + barW}
                  y={chartH + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill={colors.textSecondary}
                >{d.label}</SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#2E8B57' }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#E74C3C' }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Expenses</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, fontWeight: '500' },
});
