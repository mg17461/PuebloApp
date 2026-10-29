import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Screen from '../components/Screen';
import GlowEffect from '../components/GlowEffect';
import PrimaryButton from '../components/PrimaryButton';
import { useGameStore } from '../game/store';
import { colors, fonts } from '../theme';

export default function HomeScreen({ navigation }) {
  const hasGame = useGameStore((s) => s.game.players.length > 0);
  const newGame = useGameStore((s) => s.newGame);

  const startNewGame = () => {
    Alert.alert('New game', 'Start a new game? The current scores will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start new game',
        style: 'destructive',
        onPress: () => {
          newGame();
          navigation.navigate('Players');
        },
      },
    ]);
  };

  return (
    <Screen title="Pueblo" showNewGame={false}>
      <View style={styles.center}>
        <View style={styles.buttonWrapper}>
          <GlowEffect />
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.circleButton}
            onPress={() => navigation.navigate(hasGame ? 'Scoreboard' : 'Players')}
          >
            <Text style={styles.buttonText}>{hasGame ? 'Resume Game' : 'Start Game'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {hasGame && <PrimaryButton title="Start a new game" small onPress={startNewGame} style={styles.newGame} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonWrapper: { justifyContent: 'center', alignItems: 'center', marginBottom: 60 },
  circleButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 30,
    textAlign: 'center',
    fontFamily: fonts.semiBold,
  },
  newGame: { marginBottom: 60 },
});
