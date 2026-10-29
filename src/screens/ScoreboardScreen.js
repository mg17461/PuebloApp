import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import Screen from '../components/Screen';
import ScoreBar from '../components/ScoreBar';
import PrimaryButton from '../components/PrimaryButton';
import { useGameStore } from '../game/store';
import { standings } from '../game/logic';
import { colors, fonts } from '../theme';

export default function ScoreboardScreen({ navigation }) {
  const game = useGameStore((s) => s.game);
  const maxScore = useGameStore((s) => s.maxScore);
  const undoLastRound = useGameStore((s) => s.undoLastRound);
  const ranked = useMemo(() => standings(game), [game]);
  const roundsPlayed = game.rounds.length;

  const confirmUndo = () => {
    Alert.alert('Undo last round', `Remove the scores from round ${roundsPlayed}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Undo', style: 'destructive', onPress: undoLastRound },
    ]);
  };

  return (
    <Screen title="Score Board">
      <PrimaryButton title="View score history" small onPress={() => navigation.navigate('History')} />
      <Text style={styles.round}>
        {roundsPlayed === 0 ? 'No rounds played yet' : `After round ${roundsPlayed}`}
      </Text>
      <ScrollView contentContainerStyle={styles.content}>
        {ranked.map((player) => (
          <ScoreBar key={player.id} playerName={player.name} score={player.total} maxScore={maxScore} />
        ))}
        <PrimaryButton title="Add scores" onPress={() => navigation.navigate('EnterRound')} />
        <PrimaryButton title="Edit players" onPress={() => navigation.navigate('Players', { fromScoreboard: true })} />
        {roundsPlayed > 0 && <PrimaryButton title="Undo last round" small onPress={confirmUndo} />}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 100 },
  round: {
    textAlign: 'center',
    fontFamily: fonts.medium,
    color: colors.accent,
    fontSize: 14,
    marginTop: 4,
  },
});
