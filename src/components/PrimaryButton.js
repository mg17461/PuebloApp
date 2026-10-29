import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, fonts } from '../theme';

export default function PrimaryButton({ title, onPress, style, small = false, disabled = false }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={[styles.button, small && styles.small, disabled && styles.disabled, style]}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    alignSelf: 'center',
    marginVertical: 8,
  },
  small: {
    paddingVertical: 10,
    width: '50%',
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
});
