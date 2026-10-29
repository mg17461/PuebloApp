import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Screen from '../components/Screen';
import PrimaryButton from '../components/PrimaryButton';
import { useGameStore } from '../game/store';
import { parseScoreInput, playersAtMax, totals } from '../game/logic';
import { colors, fonts } from '../theme';

// Enter every player's points for one round, then save the round once.
export default function EnterRoundScreen({ navigation }) {
  const game = useGameStore((s) => s.game);
  const maxScore = useGameStore((s) => s.maxScore);
  const submitRound = useGameStore((s) => s.submitRound);
  const newGame = useGameStore((s) => s.newGame);
  const [entries, setEntries] = useState({}); // { [playerId]: { text, negative } }

  const current = totals(game);
  const roundNumber = game.rounds.length + 1;

  const update = (playerId, change) =>
    setEntries((prev) => ({ ...prev, [playerId]: { text: '', negative: false, ...prev[playerId], ...change } }));

  const save = () => {
    const scores = {};
    for (const p of game.players) {
      const entry = entries[p.id];
      const value = parseScoreInput(entry?.text) ?? 0;
      scores[p.id] = entry?.negative ? -value : value;
    }
    submitRound(scores);
    navigation.goBack();

    const atMax = playersAtMax(useGameStore.getState().game, maxScore);
    if (atMax.length > 0) {
      Alert.alert(`${atMax[0].name} won the game!`, 'Would you like to start a new game with the same players?', [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => newGame({ keepPlayers: true }) },
      ]);
    }
  };

  const handleSave = () => {
    const missing = game.players.filter((p) => parseScoreInput(entries[p.id]?.text) === null);
    if (missing.length === 0) {
      save();
      return;
    }
    const names = missing.map((p) => p.name).join(', ');
    Alert.alert(
      'Missing scores',
      missing.length === 1
        ? `No score entered for ${names}. They will get 0 this round.`
        : `No scores entered for ${names}. They will get 0 this round.`,
      [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Save anyway', onPress: save },
      ]
    );
  };

  return (
    <Screen title={`Round ${roundNumber}`}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          {game.players.map((player) => {
            const entry = entries[player.id] ?? { text: '', negative: false };
            return (
              <View key={player.id} style={styles.row}>
                <Text style={styles.name} numberOfLines={1}>{`${player.name}: ${current[player.id]}`}</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={entry.negative ? 'Subtracting points. Tap to add instead.' : 'Adding points. Tap to subtract instead.'}
                  style={styles.toggle}
                  onPress={() => update(player.id, { negative: !entry.negative })}
                >
                  <Text style={styles.toggleText}>{entry.negative ? '−' : '+'}</Text>
                </TouchableOpacity>
                <TextInput
                  accessibilityLabel={`Points for ${player.name}`}
                  value={entry.text}
                  onChangeText={(text) => update(player.id, { text: text.replace(/[^0-9]/g, '') })}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                />
              </View>
            );
          })}
          <PrimaryButton title={`Save round ${roundNumber}`} onPress={handleSave} />
          <PrimaryButton title="Cancel" onPress={() => navigation.goBack()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 100 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  name: { flex: 1, fontSize: 16, fontFamily: fonts.medium, color: colors.accent },
  toggle: {
    width: 50,
    paddingVertical: 8,
    backgroundColor: colors.toggle,
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
  },
  toggleText: { fontSize: 20, fontFamily: fonts.bold },
  input: {
    width: 80,
    padding: 10,
    color: colors.accent,
    fontFamily: fonts.medium,
    fontSize: 16,
    borderColor: colors.text,
    borderWidth: 1,
    borderRadius: 5,
  },
});
