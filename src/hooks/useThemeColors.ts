import { useColorScheme } from 'react-native';
import { Colors, DarkColors, type ColorKey } from '@/constants/colors';

type ResolvedColors = Record<ColorKey, string>;

const light: ResolvedColors = { ...Colors } as unknown as ResolvedColors;
const dark: ResolvedColors = { ...DarkColors } as unknown as ResolvedColors;

export function useThemeColors(): ResolvedColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export { Colors, DarkColors };
