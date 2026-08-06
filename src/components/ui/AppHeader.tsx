import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/use-theme';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, showBack = false, rightAction, style }) => {
  const router = useRouter();
  const colors = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.background }, style]}>
      {showBack ? (
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primaryDark }]}>←</Text>
        </Pressable>
      ) : (
        <View style={styles.empty} />
      )}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>
        {rightAction || <View style={styles.empty} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    height: 60,
  },
  backBtn: {
    paddingRight: 16,
    paddingVertical: 4,
  },
  backText: {
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  right: {
    minWidth: 32,
    alignItems: 'flex-end',
  },
  empty: {
    width: 32,
  },
});
