import React from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../game/store';
import { fonts, playerColor, progressColor, radius, space, type, useStyles, useTheme } from '../theme';

/** Buttons. variant: primary | secondary | ghost | destructive */
export function Button({ title, onPress, variant = 'primary', icon, disabled = false, style }) {
  const theme = useTheme();
  const s = useStyles(buttonStyles);
  const fg = {
    primary: theme.onPrimary,
    secondary: theme.text,
    ghost: theme.primary,
    destructive: theme.danger,
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.base, s[variant], pressed && s[`${variant}Pressed`], disabled && s.disabled, style]}
    >
      {icon && <Ionicons name={icon} size={20} color={fg} style={s.icon} />}
      <Text style={[s.label, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

const buttonStyles = (t) => ({
  base: {
    height: 54,
    borderRadius: radius.lg,
    paddingHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: t.primary },
  primaryPressed: { backgroundColor: t.primaryPressed },
  secondary: { backgroundColor: t.surfaceMuted },
  secondaryPressed: { opacity: 0.7 },
  ghost: { backgroundColor: 'transparent' },
  ghostPressed: { opacity: 0.6 },
  destructive: { backgroundColor: 'transparent' },
  destructivePressed: { opacity: 0.6 },
  disabled: { opacity: 0.4 },
  icon: { marginRight: space.sm },
  label: { ...type.headline },
});

/** Round icon-only button, e.g. for header actions. */
export function IconButton({ name, onPress, label, color, size = 22 }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.5 : 1 })}
    >
      <Ionicons name={name} size={size} color={color ?? theme.primary} />
    </Pressable>
  );
}

/** White rounded container used for grouped content. */
export function Card({ children, style }) {
  const s = useStyles(cardStyles);
  return <View style={[s.card, style]}>{children}</View>;
}

const cardStyles = (t) => ({
  card: {
    backgroundColor: t.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.border,
    overflow: 'hidden',
  },
});

export function SectionLabel({ children, style }) {
  const s = useStyles(sectionStyles);
  return <Text style={[s.label, style]}>{children}</Text>;
}

const sectionStyles = (t) => ({
  label: { ...type.overline, color: t.textSecondary, marginBottom: space.sm, marginLeft: space.xs },
});

/** Thin line between rows inside a Card, inset past the avatar. */
export function Divider({ inset = 64 }) {
  const theme = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.border, marginLeft: inset }} />;
}

/** Coloured circle with the player's initials. */
export function Avatar({ id, name, size = 36, colorIndex }) {
  const gameIndex = useGameStore((st) => st.game.players.findIndex((p) => p.id === id));
  const index = colorIndex ?? gameIndex;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: playerColor(Math.max(0, index)),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontFamily: fonts.semiBold, fontSize: size * 0.4 }}>{initials}</Text>
    </View>
  );
}

/** Horizontal bar showing progress towards the max score. */
export function ProgressBar({ value, max }) {
  const theme = useTheme();
  const fraction = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.track, overflow: 'hidden' }}>
      <View
        style={{
          width: `${fraction * 100}%`,
          height: '100%',
          borderRadius: 3,
          backgroundColor: progressColor(theme, fraction),
        }}
      />
    </View>
  );
}

/** Small "+5" / "−3" badge for a round's points. */
export function DeltaChip({ value }) {
  const theme = useTheme();
  if (value === undefined || value === null) return null;
  const color = value === 0 ? theme.textTertiary : theme.textSecondary;
  return (
    <Text style={{ ...type.caption, ...type.number, fontSize: 13, color }}>
      {value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : '±0'}
    </Text>
  );
}

/** Bottom bar for the screen's main action, padded for the home indicator. */
export function Footer({ children }) {
  const insets = useSafeAreaInsets();
  const s = useStyles(footerStyles);
  return <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>{children}</View>;
}

const footerStyles = (t) => ({
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.sm,
    backgroundColor: t.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.border,
  },
});

export function EmptyState({ icon, title, message }) {
  const theme = useTheme();
  const s = useStyles(emptyStyles);
  return (
    <View style={s.wrap}>
      <Ionicons name={icon} size={32} color={theme.textTertiary} style={s.icon} />
      <Text style={s.title}>{title}</Text>
      {message ? <Text style={s.message}>{message}</Text> : null}
    </View>
  );
}

const emptyStyles = (t) => ({
  wrap: { alignItems: 'center', paddingVertical: space.xxl, paddingHorizontal: space.xl },
  icon: { marginBottom: space.sm },
  title: { ...type.bodyStrong, color: t.textSecondary, textAlign: 'center' },
  message: { ...type.callout, color: t.textTertiary, textAlign: 'center', marginTop: space.xs },
});

/**
 * Native action sheet on iOS, a simple alert elsewhere.
 * options: [{ label, run, destructive }]
 */
export function showActionSheet({ title, message, options }) {
  if (Platform.OS === 'ios') {
    const labels = [...options.map((o) => o.label), 'Cancel'];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        message,
        options: labels,
        cancelButtonIndex: labels.length - 1,
        destructiveButtonIndex: options.findIndex((o) => o.destructive),
      },
      (i) => options[i]?.run()
    );
    return;
  }
  Alert.alert(title ?? 'Options', message, [
    ...options.map((o) => ({ text: o.label, onPress: o.run, style: o.destructive ? 'destructive' : 'default' })),
    { text: 'Cancel', style: 'cancel' },
  ]);
}
