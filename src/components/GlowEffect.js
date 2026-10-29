import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

export default function GlowEffect() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.glow, { opacity }]} />;
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    width: 215,
    height: 215,
    borderRadius: 108,
    borderColor: 'orange',
    borderWidth: 10,
  },
});
