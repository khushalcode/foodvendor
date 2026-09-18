// Spacing & sizing tokens — "Aurora" redesign.
export { Colors, DarkColors } from './colors';
// Generous spacing, larger radii, slightly bigger touch targets for a modern,
// airy, premium feel.

export const Spacing = {
  none: 0,
  extraSmall: 6,
  small: 10,
  default: 16,
  large: 22,
  extraLarge: 28,
  extraOverLarge: 34,
  extremeLarge: 44,
  // legacy aliases
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
} as const;

export const Radius = {
  none: 0,
  extraSmall: 6,
  small: 10,
  default: 14,
  medium: 18,
  large: 22,
  extraLarge: 28,
  extraOverLarge: 32,
  huge: 40,
  circular: 999,
} as const;

export const FontSize = {
  extraSmall: 11,
  small: 13,
  default: 15,
  medium: 17,
  large: 20,
  extraLarge: 24,
  overLarge: 30,
  huge: 36,
  display: 44,
} as const;

export const FontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const;

export const IconSize = {
  extraSmall: 14,
  small: 18,
  default: 22,
  large: 28,
  extraLarge: 36,
  huge: 48,
} as const;

export const Layout = {
  maxContentWidth: 480,
  bottomTabHeight: 72,
  appBarHeight: 60,
  buttonHeight: 54,
  inputHeight: 54,
  inputMessageLength: 250,
} as const;

// Convenience aliases used by uploaded starter code
export const BottomTabInset = Layout.bottomTabHeight;
export const MaxContentWidth = Layout.maxContentWidth;
