import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => (
  <View style={styles.overlay}>
    <ActivityIndicator size="large" color="#2E8B57" />
    {message && <Text style={styles.msg}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999,
  },
  msg: { marginTop: 12, fontSize: 14, color: '#fff', fontWeight: '600' },
});
