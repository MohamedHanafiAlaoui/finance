import React, { useState } from 'react';
import {
  View, Text, TextInput, TextInputProps,
  StyleSheet, Pressable, ViewStyle
} from 'react-native';
import { useTheme } from '../../hooks/use-theme';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
  label, error, leftIcon, rightIcon, onRightIconPress,
  containerStyle, style, ...rest
}) => {
  const colors = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View style={[
        styles.inputWrap,
        { backgroundColor: colors.backgroundElement, borderColor: error ? colors.danger : focused ? '#27D3C3' : colors.border },
      ]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            { color: colors.text, flex: 1 },
            leftIcon ? { paddingLeft: 4 } : {},
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {rightIcon && (
          <Pressable style={styles.iconRight} onPress={onRightIconPress}>
            {rightIcon}
          </Pressable>
        )}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, letterSpacing: 0.2 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, height: 54,
  },
  input: { fontSize: 15, paddingVertical: 0 },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8, padding: 4 },
  error: { fontSize: 12, marginTop: 4 },
});
