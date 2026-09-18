import React from 'react';
  import { StyleSheet, View, ViewStyle } from 'react-native';
  import { Colors } from '@/constants/colors';
  import { Radius, Spacing } from '@/constants/theme';

  interface CustomCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    elevation?: number;
    bordered?: boolean;
    padded?: boolean;
    glow?: boolean;
  }

  /**
   * Aurora card — soft white surface with a layered violet-tinted shadow,
   * generous rounding, and an optional glow ring for hero blocks.
   */
  export function CustomCard({
    children,
    style,
    elevation = 2,
    bordered = true,
    padded = true,
    glow = false,
  }: CustomCardProps) {
    return (
      <View
        style={[
          styles.card,
          padded && styles.padded,
          bordered && styles.bordered,
          { elevation, shadowColor: Colors.shadow, shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
          glow && styles.glow,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  const styles = StyleSheet.create({
    card: {
      backgroundColor: Colors.card,
      borderRadius: Radius.large,
    } as ViewStyle,
    padded: {
      padding: Spacing.default,
    } as ViewStyle,
    bordered: {
      borderWidth: 1,
      borderColor: Colors.border,
    } as ViewStyle,
    glow: {
      shadowColor: Colors.primary,
      shadowOpacity: 0.28,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    } as ViewStyle,
  });
