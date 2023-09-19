import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';

const GlowEffect = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.glow, { opacity }]} />;
};

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    width: 215, // 5 units larger than the button to account for the glow effect
    height: 215,
    borderRadius: 105,
    borderColor: 'orange',
    borderWidth: 10,
    zIndex: -1,
    
  },
});

export default GlowEffect;
