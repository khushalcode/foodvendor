import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Layout, Spacing } from '@/constants/theme';

interface CustomAppBarProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  right?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  transparent?: boolean;
  large?: boolean;
}

export function CustomAppBar({
  title,
  showBack = true,
  onBackPress,
  right,
  backgroundColor,
  titleColor,
  transparent,
  large = false,
}: CustomAppBarProps) {
  const insets = useSafeAreaInsets();
  const bg = backgroundColor ?? (transparent ? 'transparent' : Colors.background);
  const color = titleColor ?? Colors.textPrimary;

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top + Spacing.small }]}>
      <View style={[styles.row, { height: Layout.appBarHeight }]}>
        <View style={[styles.side, styles.backBtn]}>
          {showBack ? (
            <Ionicons
              name="chevron-back"
              size={26}
              color={color}
              onPress={() => (onBackPress ? onBackPress() : router.back())}
              style={styles.backIcon}
            />
          ) : null}
        </View>
        <Text
          style={[large ? styles.titleLarge : styles.title, { color }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <View style={[styles.side, styles.right]}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  } as ViewStyle,
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.default,
  } as ViewStyle,
  title: {
    fontSize: FontSize.medium,
    fontWeight: FontWeight.bold as TextStyle['fontWeight'],
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.2,
  } as TextStyle,
  titleLarge: {
    fontSize: FontSize.huge,
    fontWeight: FontWeight.black as TextStyle['fontWeight'],
    flex: 1,
    textAlign: 'left',
    letterSpacing: -0.5,
  } as TextStyle,
  side: {
    minWidth: 44,
  } as ViewStyle,
  backBtn: {
    alignItems: 'flex-start',
  } as ViewStyle,
  backIcon: {
    padding: 4,
  } as any,
  right: {
    alignItems: 'flex-end',
  } as ViewStyle,
});
