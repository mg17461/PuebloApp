import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '../theme';

export default function ScoreBar({ playerName, score, maxScore }) {
  // Capped to 0–100% so scores past the max (or below zero) don't break the bar.
  const percent = maxScore > 0 ? Math.min(100, Math.max(0, (score / maxScore) * 100)) : 0;

  return (
    <View style={styles.container} accessible accessibilityLabel={`${playerName}: ${score} of ${maxScore}`}>
      <View style={styles.bar}>
        <LinearGradient
          style={StyleSheet.absoluteFill}
          colors={['#1fe060', '#ace90a', '#ffcd00', '#ffa200', 'darkorange', '#ff3b00']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
        <View style={[styles.cover, { width: `${100 - percent}%` }]} />
        <Text style={styles.text} numberOfLines={1}>
          {`${playerName}: ${score}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 10 },
  bar: {
    height: 40,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: colors.barTrack,
    justifyContent: 'center',
  },
  cover: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.barTrack,
  },
  text: {
    marginHorizontal: 14,
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.white,
  },
});
