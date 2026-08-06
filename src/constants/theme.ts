/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1F2937',
    background: '#F9FAFB',
    backgroundElement: '#F3F4F6',
    backgroundSelected: '#E5E7EB',
    textSecondary: '#6B7280',
    primary: '#2563EB',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    income: '#059669',
    expense: '#DC2626',
    accentBlue: '#3B82F6',
    accentGreen: '#34D399',
  },
  dark: {
    text: '#F9FAFB',
    background: '#111827',
    backgroundElement: '#1F2937',
    backgroundSelected: '#374151',
    textSecondary: '#D1D5DB',
    primary: '#3B82F6',
    success: '#10B981',
    danger: '#F87171',
    warning: '#FBBF24',
    income: '#6EE7B7',
    expense: '#FCA5A5',
    accentBlue: '#60A5FA',
    accentGreen: '#6EE7B7',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
