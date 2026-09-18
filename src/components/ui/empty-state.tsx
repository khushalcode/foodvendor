import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';
import { CustomButton } from './custom-button';

interface EmptyStateProps {
  image?: any;
  title?: string;
  description?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  image = Images.emptyBox,
  title = 'No data found',
  description = 'Try refreshing or check back later.',
  ctaLabel,
  onCtaPress,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.imageWrap}>
        <LinearGradient
          colors={[Colors.primarySofter, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Image source={image} style={styles.image} resizeMode="contain" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {ctaLabel && onCtaPress ? (
        <CustomButton label={ctaLabel} onPress={onCtaPress} style={{ marginTop: Spacing.large, width: 220 }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.extraLarge,
  } as ViewStyle,
  imageWrap: {
    width: 168,
    height: 168,
    borderRadius: Radius.huge,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.large,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  } as ViewStyle,
  image: {
    width: 120,
    height: 120,
  } as any,
  title: {
    fontSize: FontSize.large,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
    marginBottom: Spacing.small,
    letterSpacing: -0.2,
  } as any,
  description: {
    fontSize: FontSize.default,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  } as any,
});
