import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, FontSize, FontWeight, Layout } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'transparent' | 'danger' | 'glass';

interface CustomButtonProps {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function CustomButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
  fullWidth = true,
  icon,
}: CustomButtonProps) {
  const isDisabled = disabled || loading;
  const containerStyle = [
    styles.base,
    styles[variant],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={labelColor(variant)} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: labelColor(variant) }, textStyle]}>{label}</Text>
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <View style={[containerStyle, { padding: 0, overflow: 'hidden', backgroundColor: 'transparent' }]}>
        <LinearGradient
          colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <TouchableHighlight
          underlayColor="rgba(255,255,255,0.12)"
          activeOpacity={0.85}
          onPress={onPress}
          disabled={isDisabled}
          style={[styles.base, styles.fullWidth, styles.touchInside]}
        >
          {content}
        </TouchableHighlight>
      </View>
    );
  }

  return (
    <TouchableHighlight
      underlayColor="transparent"
      activeOpacity={0.75}
      onPress={onPress}
      disabled={isDisabled}
      style={containerStyle}
    >
      {content}
    </TouchableHighlight>
  );
}

function labelColor(variant: Variant): string {
  switch (variant) {
    case 'primary':
      return Colors.textOnPrimary;
    case 'danger':
      return Colors.textOnPrimary;
    case 'outline':
      return Colors.primary;
    case 'transparent':
      return Colors.primary;
    case 'glass':
      return Colors.primary;
    case 'secondary':
      return Colors.textPrimary;
  }
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.small,
  } as ViewStyle,
  base: {
    height: Layout.buttonHeight,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.small,
    paddingHorizontal: Spacing.large,
  } as ViewStyle,
  touchInside: {
    backgroundColor: 'transparent',
  } as ViewStyle,
  fullWidth: {
    alignSelf: 'stretch',
  } as ViewStyle,
  primary: {
    // gradient drawn by LinearGradient child
    backgroundColor: 'transparent',
    shadowColor: Colors.primary,
    shadowOpacity: 0.38,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  } as ViewStyle,
  secondary: {
    backgroundColor: Colors.surfaceAlt,
  } as ViewStyle,
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  } as ViewStyle,
  transparent: {
    backgroundColor: 'transparent',
  } as ViewStyle,
  glass: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  } as ViewStyle,
  danger: {
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  } as ViewStyle,
  disabled: {
    opacity: 0.5,
  } as ViewStyle,
  label: {
    fontSize: FontSize.default,
    fontWeight: FontWeight.bold as TextStyle['fontWeight'],
    letterSpacing: 0.3,
  } as TextStyle,
});
