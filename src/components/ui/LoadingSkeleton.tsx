import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';

export const LoadingSkeleton: React.FC = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.cardSkeleton, { opacity }]} />
      <View style={styles.row}>
        <Animated.View style={[styles.statSkeleton, { opacity }]} />
        <Animated.View style={[styles.statSkeleton, { opacity }]} />
      </View>
      <Animated.View style={[styles.listSkeleton, { opacity }]} />
      <Animated.View style={[styles.listSkeleton, { opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  cardSkeleton: {
    height: 180,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  statSkeleton: {
    flex: 1,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  listSkeleton: {
    height: 70,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
});
