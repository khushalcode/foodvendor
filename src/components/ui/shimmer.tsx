import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

interface ShimmerProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: ViewStyle;
}

export function Shimmer({ width = '100%', height = 16, radius = 6, style }: ShimmerProps) {
  const offset = useSharedValue(-1);
  React.useEffect(() => {
    offset.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value * 300 }],
  }));
  return (
    <View
      style={[
        styles.base,
        {
          width: width as any,
          height: height as any,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shine, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.shimmerBase,
    overflow: 'hidden',
  } as ViewStyle,
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '40%',
    backgroundColor: Colors.shimmerHighlight,
  } as ViewStyle,
});
