import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import type { OrderStatus } from '@/types';

interface StatusBadgeProps {
  status: OrderStatus | string;
  small?: boolean;
  style?: ViewStyle;
}

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: '#B45309', bg: Colors.warningSoft, label: 'Pending' },
  confirmed: { color: Colors.primaryDark, bg: Colors.primaryLight, label: 'Confirmed' },
  processing: { color: '#7C3AED', bg: '#F3E8FF', label: 'Processing' },
  handover: { color: '#0E7490', bg: Colors.accentSoft, label: 'Handover' },
  delivered: { color: Colors.success, bg: Colors.successSoft, label: 'Delivered' },
  canceled: { color: Colors.danger, bg: Colors.dangerSoft, label: 'Canceled' },
  failed: { color: '#B91C1C', bg: '#FEE2E2', label: 'Failed' },
  returned: { color: '#7C3AED', bg: '#F1E9FF', label: 'Returned' },
  scheduled: { color: Colors.primaryDark, bg: Colors.primaryLight, label: 'Scheduled' },
  paid: { color: Colors.success, bg: Colors.successSoft, label: 'Paid' },
  unpaid: { color: '#B45309', bg: Colors.warningSoft, label: 'Unpaid' },
  partial: { color: '#B45309', bg: Colors.warningSoft, label: 'Partial' },
  refunded: { color: '#7C3AED', bg: '#F1E9FF', label: 'Refunded' },
  active: { color: Colors.success, bg: Colors.successSoft, label: 'Active' },
  inactive: { color: Colors.textSecondary, bg: Colors.surfaceAlt, label: 'Inactive' },
  completed: { color: Colors.success, bg: Colors.successSoft, label: 'Completed' },
};

export function StatusBadge({ status, small = false, style }: StatusBadgeProps) {
  const meta = STATUS_META[status] ?? { color: Colors.textSecondary, bg: Colors.surfaceAlt, label: status };
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }, small && styles.small, style]}>
      <View style={[styles.dot, { backgroundColor: meta.color }, small && styles.dotSmall]} />
      <Text style={[styles.label, { color: meta.color }, small && styles.labelSmall]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.default,
    paddingVertical: Spacing.extraSmall,
    borderRadius: Radius.circular,
    alignSelf: 'flex-start',
    gap: Spacing.extraSmall,
  } as ViewStyle,
  small: {
    paddingHorizontal: Spacing.small,
    paddingVertical: 4,
  } as ViewStyle,
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  } as ViewStyle,
  dotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  } as ViewStyle,
  label: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.bold as any,
    textTransform: 'capitalize',
    letterSpacing: 0.2,
  } as any,
  labelSmall: {
    fontSize: FontSize.extraSmall,
  } as any,
});
