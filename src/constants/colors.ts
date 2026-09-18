// Design tokens — Vendor App · "Aurora" Redesign
// A bold, modern palette built around a vibrant violet→fuchsia gradient with
// electric cyan accents. Light surfaces, deep shadows, generous rounding.

export const Colors = {
  // Primary brand — electric violet (cool, premium, modern)
  primary: '#7C5CFF',
  primaryDark: '#5B3FE0',
  primaryLight: '#F1ECFF',
  primarySofter: '#F7F3FF',

  // Signature gradient stops (used by LinearGradient heroes)
  primaryGradientStart: '#7C5CFF',
  primaryGradientEnd: '#A855F7',
  accentGradientStart: '#06B6D4',
  accentGradientEnd: '#7C5CFF',

  // Accent — electric cyan (for highlights, secondary CTA)
  accent: '#06B6D4',
  accentSoft: '#E0F7FB',
  accentForeground: '#0E7490',

  // Status colors — slightly more saturated than v1
  success: '#10C997',
  successSoft: '#E6FAF3',
  warning: '#FFB020',
  warningSoft: '#FFF6E6',
  danger: '#FF4D6D',
  dangerSoft: '#FFE8EC',
  info: '#3B82F6',
  infoSoft: '#EFF6FF',

  // Trial banner
  trialBg: '#7C5CFF',
  trialBgSoft: '#F1ECFF',

  // Text — high-contrast hierarchy
  textPrimary: '#0F0F1A', // near-black, slightly cool
  textSecondary: '#5B5B70',
  textMuted: '#9E9EB3',
  textLight: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  // Surfaces (light mode) — airy, layered
  background: '#F4F2FB', // cool lavender-tinted canvas
  surface: '#FFFFFF',
  surfaceAlt: '#F7F5FE',
  surfaceGlass: 'rgba(255, 255, 255, 0.72)', // for glassmorphism
  card: '#FFFFFF',

  // Borders / dividers
  border: '#ECE9F7',
  borderLight: '#F4F2FB',
  borderDark: '#0F0F1A',
  borderPrimary: '#D8CCFF',

  // Shadows — soft, diffused, with a violet tint for warmth
  shadow: 'rgba(124, 92, 255, 0.10)',
  shadowSoft: 'rgba(15, 15, 26, 0.04)',
  shadowStrong: 'rgba(124, 92, 255, 0.28)',

  // Specific UI
  discountTag: '#FF4D6D',
  notAvailable: '#9E9EB3',
  shimmerBase: '#ECE9F7',
  shimmerHighlight: '#F7F5FE',

  // Misc decorative gradients (used by hero cards)
  heroGradientStart: '#7C5CFF',
  heroGradientEnd: '#C026D3',
  sunsetStart: '#FF6B6B',
  sunsetEnd: '#FF4D6D',
  oceanStart: '#06B6D4',
  oceanEnd: '#3B82F6',
} as const;

export const DarkColors = {
  primary: '#9D86FF',
  primaryDark: '#7C5CFF',
  primaryLight: '#2A1F4D',
  primarySofter: '#1A1330',

  primaryGradientStart: '#7C5CFF',
  primaryGradientEnd: '#C026D3',
  accentGradientStart: '#22D3EE',
  accentGradientEnd: '#9D86FF',

  accent: '#22D3EE',
  accentSoft: '#0E2A33',
  accentForeground: '#67E8F9',

  success: '#10C997',
  successSoft: '#0D2B24',
  warning: '#FFB020',
  warningSoft: '#3A2A0E',
  danger: '#FF4D6D',
  dangerSoft: '#3A0E1A',
  info: '#60A5FA',
  infoSoft: '#0E1E3A',

  trialBg: '#7C5CFF',
  trialBgSoft: '#2A1F4D',

  textPrimary: '#FFFFFF',
  textSecondary: '#CFCFE0',
  textMuted: '#7E7E96',
  textLight: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  background: '#0A0A14',
  surface: '#16161F',
  surfaceAlt: '#1F1F2C',
  surfaceGlass: 'rgba(22, 22, 31, 0.72)',
  card: '#16161F',

  border: '#26263A',
  borderLight: '#1F1F2C',
  borderDark: '#FFFFFF',
  borderPrimary: '#3D2E66',

  shadow: '#000000',
  shadowSoft: 'rgba(0,0,0,0.4)',
  shadowStrong: 'rgba(0,0,0,0.6)',

  discountTag: '#FF4D6D',
  notAvailable: '#7E7E96',
  shimmerBase: '#26263A',
  shimmerHighlight: '#1F1F2C',

  heroGradientStart: '#7C5CFF',
  heroGradientEnd: '#C026D3',
  sunsetStart: '#FF6B6B',
  sunsetEnd: '#FF4D6D',
  oceanStart: '#22D3EE',
  oceanEnd: '#3B82F6',
} as const;

export type ThemeColors = typeof Colors;
export type ColorKey = keyof ThemeColors;
