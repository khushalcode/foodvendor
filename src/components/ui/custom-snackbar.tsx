import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Images } from '@/constants/images';

type SnackbarKind = 'success' | 'error' | 'info';

interface SnackbarOptions {
  message: string;
  kind?: SnackbarKind;
  duration?: number;
}

interface SnackbarContextValue {
  showCustomSnackBar: (msg: string, isError?: boolean) => void;
  show: (opts: SnackbarOptions) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<Required<SnackbarOptions>>({
    message: '',
    kind: 'info',
    duration: 2500,
  });
  const [opacity] = useState(new Animated.Value(0));

  const show = useCallback(
    (o: SnackbarOptions) => {
      const final: Required<SnackbarOptions> = {
        message: o.message,
        kind: o.kind ?? 'info',
        duration: o.duration ?? 2500,
      };
      setOpts(final);
      setVisible(true);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setVisible(false);
        });
      }, final.duration);
    },
    [opacity],
  );

  const showCustomSnackBar = useCallback(
    (msg: string, isError = false) => show({ message: msg, kind: isError ? 'error' : 'success' }),
    [show],
  );

  const iconSource = opts.kind === 'error' ? Images.warning : Images.checked;
  const accentColor =
    opts.kind === 'error' ? Colors.danger : opts.kind === 'success' ? Colors.success : Colors.primary;
  const bg =
    opts.kind === 'error'
      ? Colors.dangerSoft
      : opts.kind === 'success'
      ? Colors.successSoft
      : Colors.primaryLight;

  return (
    <SnackbarContext.Provider value={{ show, showCustomSnackBar }}>
      {children}
      {visible ? (
        <Animated.View style={[styles.wrap, { opacity }]} pointerEvents="none">
          <View style={[styles.snack, { backgroundColor: bg }]}>
            <View style={[styles.iconWrap, { backgroundColor: accentColor }]}>
              <Image source={iconSource} style={styles.icon} resizeMode="contain" />
            </View>
            <Text style={styles.message} numberOfLines={3}>
              {opts.message}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setVisible(false));
              }}
            >
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : null}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used inside <SnackbarProvider>');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 90,
    left: Spacing.default,
    right: Spacing.default,
    zIndex: 9999,
    elevation: 9999,
  } as ViewStyle,
  snack: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.small,
    paddingRight: Spacing.default,
    borderRadius: Radius.medium,
    gap: Spacing.small,
    shadowColor: Colors.shadowStrong,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  } as ViewStyle,
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  icon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  } as any,
  message: {
    flex: 1,
    fontSize: FontSize.default,
    fontWeight: FontWeight.semiBold as any,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  } as any,
});
