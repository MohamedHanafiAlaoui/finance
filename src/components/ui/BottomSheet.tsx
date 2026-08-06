import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Animated, Pressable, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { useTheme } from '../../hooks/use-theme';

const { height: SCREEN_H } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapHeight?: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible, onClose, children, snapHeight = SCREEN_H * 0.75,
}) => {
  const colors = useTheme();
  const anim = useRef(new Animated.Value(snapHeight)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(anim, { toValue: 0, useNativeDriver: Platform.OS !== 'web', tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(anim, { toValue: snapHeight, duration: 220, useNativeDriver: Platform.OS !== 'web' }).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[
          styles.sheet,
          { backgroundColor: colors.background, maxHeight: snapHeight, transform: [{ translateY: anim }] },
        ]}>
          <View style={[styles.handle, { backgroundColor: colors.backgroundSelected }]} />
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 20,
  },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 16 },
});
