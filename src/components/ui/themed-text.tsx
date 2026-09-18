import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { FontSize, FontWeight } from '@/constants/theme';

type Variant = 'title' | 'subtitle' | 'default' | 'small' | 'code' | 'caption';

interface ThemedTextProps extends TextProps {
  type?: Variant;
}

const variantStyle: Record<Variant, any> = {
  title: { fontSize: FontSize.extraLarge, fontWeight: FontWeight.bold as any },
  subtitle: { fontSize: FontSize.large, fontWeight: FontWeight.semiBold as any },
  default: { fontSize: FontSize.default, fontWeight: FontWeight.regular as any },
  small: { fontSize: FontSize.small, fontWeight: FontWeight.regular as any },
  caption: { fontSize: FontSize.extraSmall, fontWeight: FontWeight.regular as any },
  code: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium as any,
    fontFamily: 'RobotoMono',
  },
};

export function ThemedText({ type = 'default', style, ...rest }: ThemedTextProps) {
  const colors = useThemeColors();
  return <Text style={[{ color: colors.textPrimary }, variantStyle[type], style]} {...rest} />;
}
