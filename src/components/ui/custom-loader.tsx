import React from 'react';
import { Modal, StyleSheet, View, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/theme';

interface CustomLoaderProps {
  visible?: boolean;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
  style?: ViewStyle;
}

export function CustomLoader({ visible = true, size = 'large', color, overlay, style }: CustomLoaderProps) {
  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade" onRequestClose={() => {}}>
        <View style={styles.overlay}>
          <View style={styles.box}>
            <LinearGradient
              colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <ActivityIndicator size={size} color={color ?? '#FFFFFF'} />
          </View>
        </View>
      </Modal>
    );
  }
  if (!visible) return null;
  return (
    <View style={[styles.inline, style]}>
      <ActivityIndicator size={size} color={color ?? Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 20, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  box: {
    width: 108,
    height: 108,
    borderRadius: Radius.extraLarge,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
  } as ViewStyle,
  inline: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
});
