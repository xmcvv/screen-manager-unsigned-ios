import { useEffect, useRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import type { LinkState } from '../types/api';

type PulseProps = {
  state: LinkState;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Pulse({ state, children, style }: PulseProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    opacity.stopAnimation();
    if (state === 'online') {
      opacity.setValue(1);
      return;
    }
    const duration = state === 'connecting' ? 540 : 780;
    const minimum = state === 'connecting' ? 0.42 : 0.25;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: minimum,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, state]);

  return (
    <Animated.View style={[style, { opacity }]}>
      {children}
    </Animated.View>
  );
}
