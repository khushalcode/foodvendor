import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

type Variant = 'default' | 'backgroundElement' | 'card';

interface ThemedViewProps extends ViewProps {
  type?: Variant;
}

export function ThemedView({ type = 'default', style, ...rest }: ThemedViewProps) {
  const colors = useThemeColors();
  const bg =
    type === 'backgroundElement' ? colors.surfaceAlt : type === 'card' ? colors.card : colors.background;
  return <View style={[{ backgroundColor: bg }, style]} {...rest} />;
}
