import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../game/store';
import { colors, fonts } from '../theme';

export default function Header({ title, showNewGame }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const newGame = useGameStore((s) => s.newGame);

  const confirmNewGame = () => {
    Alert.alert('New game', 'Are you sure you want to start a new game? All scores will be lost.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          newGame();
          navigation.popToTop();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.side}>
        {showNewGame && (
          <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={confirmNewGame}>
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={styles.title}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        accessibilityRole="header"
      >
        {title}
      </Text>

      <View style={[styles.side, styles.right]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Settings"
          hitSlop={10}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings" size={30} color={colors.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  side: { width: 90 },
  right: { alignItems: 'flex-end' },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderRadius: 15,
    padding: 6,
    borderColor: colors.muted,
  },
  buttonText: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.white },
  title: {
    flex: 1,
    fontSize: 26,
    color: colors.text,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
});
