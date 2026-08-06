import React from 'react';
import {
  Pressable, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle, PressableProps, StyleProp,
} from 'react-native';
import { useTheme } from '../../hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface AppButtonProps extends PressableProps {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title, variant = 'primary', size = 'md', loading = false,
  leftIcon, style, textStyle, fullWidth = true, ...rest
}) => {
  const colors = useTheme();

  const bgMap: Record<Variant, string> = {
    primary: '#27D3C3',
    secondary: colors.primaryLight,
    danger: colors.danger,
    outline: 'transparent',
    ghost: 'transparent',
  };
  const textColorMap: Record<Variant, string> = {
    primary: '#FFFFFF',
    secondary: colors.primaryDark,
    danger: '#FFFFFF',
    outline: '#27D3C3',
    ghost: '#27D3C3',
  };
  const borderMap: Record<Variant, string | undefined> = {
    primary: undefined,
    secondary: undefined,
    danger: undefined,
    outline: '#27D3C3',
    ghost: undefined,
  };
  const padMap: Record<Size, { paddingVertical: number; paddingHorizontal: number }> = {
    sm: { paddingVertical: 10, paddingHorizontal: 18 },
    md: { paddingVertical: 14, paddingHorizontal: 22 },
    lg: { paddingVertical: 18, paddingHorizontal: 26 },
  };
  const fontMap: Record<Size, number> = { sm: 13, md: 15, lg: 17 };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bgMap[variant], ...padMap[size] },
        borderMap[variant] ? { borderWidth: 1.5, borderColor: borderMap[variant] } : {},
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        rest.disabled && styles.disabled,
        style as any,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColorMap[variant]} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text style={[
            styles.text,
            { color: textColorMap[variant], fontSize: fontMap[size] },
            leftIcon ? { marginLeft: 8 } : {},
            textStyle,
          ]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '700', letterSpacing: 0.2 },
});
