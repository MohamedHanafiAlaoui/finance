/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111827',
    background: '#F7FAFC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E5E7EB',
    textSecondary: '#6B7280',
    primary: '#27D3C3',
    primaryDark: '#0FA3B1',
    primaryLight: '#DDF8F5',
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
    income: '#22C55E',
    expense: '#EF4444',
    border: '#E5E7EB',
    accentBlue: '#0FA3B1',
    accentGreen: '#27D3C3',
  },
  dark: {
    text: '#F7FAFC',
    background: '#0B0F19',
    backgroundElement: '#111827',
    backgroundSelected: '#1F2937',
    textSecondary: '#9CA3AF',
    primary: '#27D3C3',
    primaryDark: '#0FA3B1',
    primaryLight: '#1F2937',
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
    income: '#22C55E',
    expense: '#EF4444',
    border: '#1F2937',
    accentBlue: '#0FA3B1',
    accentGreen: '#27D3C3',
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
