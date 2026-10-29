import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

// Pueblo design tokens. Terracotta is the brand colour; everything else is
// warm neutrals so the scores stay the focus.
const light = {
  scheme: 'light',
  background: '#F6F3EE',
  surface: '#FFFFFF',
  surfaceMuted: '#EFEAE2',
  border: '#E5DED3',
  text: '#1C1917',
  textSecondary: '#6B635B',
  textTertiary: '#A39A90',
  primary: '#B5412C',
  primaryPressed: '#963421',
  primarySoft: '#F6E3DD',
  onPrimary: '#FFFFFF',
  success: '#2F8F5B',
  warning: '#D08A1C',
  danger: '#C2362B',
  track: '#ECE6DC',
};

const dark = {
  scheme: 'dark',
  background: '#121110',
  surface: '#1E1C1A',
  surfaceMuted: '#2A2724',
  border: '#33302C',
  text: '#F5F2ED',
  textSecondary: '#ABA399',
  textTertiary: '#756D64',
  primary: '#E0644B',
  primaryPressed: '#C9533B',
  primarySoft: '#3A2420',
  onPrimary: '#FFFFFF',
  success: '#4CB67C',
  warning: '#E5A33A',
  danger: '#E5574B',
  track: '#2E2B27',
};

export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };

export const type = {
  display: { fontFamily: fonts.bold, fontSize: 40, letterSpacing: -1 },
  title: { fontFamily: fonts.bold, fontSize: 28, letterSpacing: -0.5 },
  headline: { fontFamily: fonts.semiBold, fontSize: 17, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 16 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 16 },
  callout: { fontFamily: fonts.regular, fontSize: 15 },
  caption: { fontFamily: fonts.medium, fontSize: 13 },
  overline: { fontFamily: fonts.semiBold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' },
  number: { fontFamily: fonts.bold, fontVariant: ['tabular-nums'] },
};

export function useTheme() {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Builds a StyleSheet from the current theme; rebuilt only when light/dark changes. */
export function useStyles(factory) {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}

// Players get distinct colours in the order they joined.
const playerPalette = ['#B5412C', '#2F7D8C', '#7A5AA6', '#C27C1A', '#3F8F4E', '#C2456E', '#4A63B8', '#8A6A4F'];

export function playerColor(index) {
  return playerPalette[((index % playerPalette.length) + playerPalette.length) % playerPalette.length];
}

/** Bar colour as a player approaches the max score. */
export function progressColor(theme, fraction) {
  if (fraction >= 0.85) return theme.danger;
  if (fraction >= 0.6) return theme.warning;
  return theme.success;
}
