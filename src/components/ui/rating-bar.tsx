import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';

interface RatingBarProps {
  value: number; // 0..5
  max?: number;
  size?: 'small' | 'default' | 'large';
  color?: string;
}

const sizeMap = {
  small: 13,
  default: 17,
  large: 22,
};

export function RatingBar({ value, max = 5, size = 'small', color = '#FFB020' }: RatingBarProps) {
  const dim = sizeMap[size];
  return (
    <View style={styles.wrap}>
      {Array.from({ length: max }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < Math.round(value) ? 'star' : 'star-outline'}
          size={dim}
          color={i < Math.round(value) ? color : Colors.border}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.extraSmall,
  } as any,
});
