import React, { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | string;
  style?: ViewStyle;
}

export function CustomBottomSheet({ visible, onClose, children, height = '60%', style }: BottomSheetProps) {
  const [rendered, setRendered] = useState(visible);
  const [translateY] = useState(new Animated.Value(SCREEN_HEIGHT));

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
    } else if (rendered) {
      Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 280, useNativeDriver: true }).start(() => {
        setRendered(false);
      });
    }
  }, [visible]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dy > 4,
        onPanResponderMove: (_, g) => {
          if (g.dy > 0) translateY.setValue(g.dy);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 80) onClose();
          else Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
    [onClose],
  );

  if (!rendered) return null;
  return (
    <Modal transparent animationType="none" visible={rendered} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[styles.sheet, { height: height as any, transform: [{ translateY }] }, style] as any}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  } as ViewStyle,
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 20, 0.55)',
  } as ViewStyle,
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.extraOverLarge,
    borderTopRightRadius: Radius.extraOverLarge,
    paddingTop: Spacing.small,
    paddingBottom: Spacing.extraOverLarge,
    shadowColor: Colors.shadowStrong,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
    maxHeight: SCREEN_HEIGHT * 0.85,
  } as ViewStyle,
  handleWrap: {
    alignItems: 'center',
    marginBottom: Spacing.default,
  } as ViewStyle,
  handle: {
    width: 44,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 3,
  } as ViewStyle,
});

// Convenience helper matching Flutter's showCustomBottomSheet
export function showCustomBottomSheet<T>(content: React.ReactNode, options: { height?: number | string } = {}) {
  // Hook-less version — caller should render the controlled <CustomBottomSheet /> themselves.
  // This is a placeholder for parity; the React pattern requires the caller manage state.
}
