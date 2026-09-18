// SmartImage — Aurora design system.
// A robust Image wrapper that NEVER shows a broken/empty image.
//
// Fallback chain:
//   1. If `source` is a non-empty string URI → try to load it
//   2. If `source` is a numeric require() → use it directly
//   3. If load fails OR source is null/empty/undefined → show SVG fallback
//
// The SVG fallback is a branded gradient placeholder with an icon + label,
// so the app always looks polished even when DB image URLs are NULL.

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';

type SmartSource = string | number | null | undefined | { uri?: string } | any;

interface SmartImageProps {
  source: SmartSource;
  style?: ImageStyle | ViewStyle;
  /** Icon name (Ionicons) shown in the fallback. Default: 'image-outline' */
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  /** Label shown in the fallback. Default: 'No image' */
  fallbackLabel?: string;
  /** Gradient style for fallback. Default: 'violet' (primary gradient) */
  fallbackVariant?: 'violet' | 'sunset' | 'ocean' | 'mint' | 'neutral';
  /** Content fit for the Image. Default: 'cover' */
  contentFit?: 'cover' | 'contain' | 'fill';
  /** Optional corner radius override */
  radius?: number;
}

const GRADIENTS: Record<NonNullable<SmartImageProps['fallbackVariant']>, [string, string]> = {
  violet: [Colors.primaryGradientStart, Colors.primaryGradientEnd],
  sunset: [Colors.sunsetStart, Colors.sunsetEnd],
  ocean: [Colors.oceanStart, Colors.oceanEnd],
  mint: ['#10C997', '#06B6D4'],
  neutral: [Colors.surfaceAlt, Colors.primaryLight],
};

const ICON_COLORS: Record<NonNullable<SmartImageProps['fallbackVariant']>, string> = {
  violet: 'rgba(255,255,255,0.85)',
  sunset: 'rgba(255,255,255,0.85)',
  ocean: 'rgba(255,255,255,0.85)',
  mint: 'rgba(255,255,255,0.85)',
  neutral: Colors.primary,
};

const LABEL_COLORS: Record<NonNullable<SmartImageProps['fallbackVariant']>, string> = {
  violet: 'rgba(255,255,255,0.92)',
  sunset: 'rgba(255,255,255,0.92)',
  ocean: 'rgba(255,255,255,0.92)',
  mint: 'rgba(255,255,255,0.92)',
  neutral: Colors.textSecondary,
};

/**
 * Returns true if `source` is a usable image source (URI string, require id,
 * or { uri: 'https://...' } object with a non-empty uri).
 */
function isUsable(source: SmartSource): boolean {
  if (source == null) return false;
  if (typeof source === 'number') return true; // require() returns a number
  if (typeof source === 'string') return source.trim().length > 0;
  if (typeof source === 'object') {
    const uri = source.uri;
    if (typeof uri === 'string') return uri.trim().length > 0;
    return false;
  }
  return false;
}

export function SmartImage({
  source,
  style,
  fallbackIcon = 'image-outline',
  fallbackLabel = 'No image',
  fallbackVariant = 'violet',
  contentFit = 'cover',
  radius,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  // Reset the failed flag if the source changes (e.g. list recycling)
  useEffect(() => {
    setFailed(false);
  }, [source]);

  const usable = isUsable(source);

  // Show fallback if source is unusable or load previously failed
  if (!usable || failed) {
    const colors = GRADIENTS[fallbackVariant];
    const iconColor = ICON_COLORS[fallbackVariant];
    const labelColor = LABEL_COLORS[fallbackVariant];
    return (
      <View style={[styles.fallbackWrap, style, radius != null && { borderRadius: radius }]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Decorative blob */}
        <View style={styles.blob} />
        <View style={styles.fallbackContent}>
          <Ionicons name={fallbackIcon} size={28} color={iconColor} />
          {fallbackLabel ? (
            <SmartLabel text={fallbackLabel} color={labelColor} />
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style as ImageStyle}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      transition={200}
      onError={() => setFailed(true)}
    />
  );
}

function SmartLabel({ text, color }: { text: string; color: string }) {
  return (
    <Text style={[styles.fallbackLabel, { color }]} numberOfLines={1}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  fallbackWrap: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.default,
  } as ViewStyle,
  blob: {
    position: 'absolute',
    top: '-20%',
    right: '-20%',
    width: '70%',
    height: '70%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  } as ViewStyle,
  fallbackContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 6,
  } as ViewStyle,
  fallbackLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  } as any,
});
