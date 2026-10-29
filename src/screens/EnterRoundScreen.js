import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { Avatar, Button, Card, Divider, Footer } from '../components/ui';
import { useGameStore } from '../game/store';
import { parseScoreInput, playersAtMax, totals } from '../game/logic';
import { fonts, radius, space, type, useStyles, useTheme } from '../theme';

function HeaderText({ title, onPress, bold = false }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingHorizontal: Platform.OS === 'web' ? space.lg : 0 })}>
      <Text style={{ color: theme.primary, fontSize: 17, fontFamily: bold ? fonts.semiBold : fonts.regular }}>{title}</Text>
    </Pressable>
  );
}

/** Turns a saved round back into the text-field state used on this screen. */
function entriesFromRound(round) {
  const entries = {};
  if (!round) return entries;
  for (const [playerId, value] of Object.entries(round.scores)) {
    entries[playerId] = { text: String(Math.abs(value)), negative: value < 0 };
  }
  return entries;
}

// Enter every player's points for one round, then save the round once.
// With route.params.roundId it edits that earlier round instead.
export default function EnterRoundScreen({ navigation, route }) {
  useKeepAwake();
  const s = useStyles(styles);
  const theme = useTheme();
  const game = useGameStore((st) => st.game);
  const maxScore = useGameStore((st) => st.maxScore);
  const submitRound = useGameStore((st) => st.submitRound);
  const updateRound = useGameStore((st) => st.updateRound);
  const deleteRound = useGameStore((st) => st.deleteRound);
  const editIndex = route.params?.roundId ? game.rounds.findIndex((r) => r.id === route.params.roundId) : -1;
  const editing = editIndex >= 0 ? game.rounds[editIndex] : null;
  const [entries, setEntries] = useState(() => entriesFromRound(editing)); // { [playerId]: { text, negative } }
  const inputs = useRef({});

  const current = useMemo(() => totals(game), [game]);
  const roundNumber = editing ? editIndex + 1 : game.rounds.length + 1;
  // Each player's total without this round, so the preview shows the effect of the edit.
  const base = (playerId) => current[playerId] - (editing?.scores[playerId] ?? 0);

  const update = (playerId, change) =>
    setEntries((prev) => ({ ...prev, [playerId]: { text: '', negative: false, ...prev[playerId], ...change } }));

  const valueFor = (playerId) => {
    const entry = entries[playerId];
    const n = parseScoreInput(entry?.text) ?? 0;
    return entry?.negative ? -n : n;
  };

  const save = useCallback(() => {
    const scores = {};
    for (const p of game.players) scores[p.id] = valueFor(p.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (editing) {
      updateRound(editing.id, scores);
      navigation.goBack();
      return;
    }
    submitRound(scores);

    const atMax = playersAtMax(useGameStore.getState().game, maxScore);
    if (atMax.length > 0) navigation.replace('GameOver');
    else navigation.goBack();
  }, [entries, game.players, maxScore, navigation, submitRound, updateRound, editing]);

  const handleSave = useCallback(() => {
    const missing = game.players.filter((p) => parseScoreInput(entries[p.id]?.text) === null);
    if (missing.length === 0) {
      save();
      return;
    }
    const names = missing.map((p) => p.name).join(', ');
    Alert.alert('Some scores are empty', `${names} will get 0 points this round.`, [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Save round', onPress: save },
    ]);
  }, [entries, game.players, save]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: editing ? `Edit round ${roundNumber}` : `Round ${roundNumber}`,
      headerLeft: () => <HeaderText title="Cancel" onPress={() => navigation.goBack()} />,
      headerRight: () => <HeaderText title="Save" bold onPress={handleSave} />,
    });
  }, [navigation, roundNumber, handleSave, editing]);

  const confirmDelete = () =>
    Alert.alert(`Delete round ${roundNumber}?`, "Its scores will be removed from everyone's totals.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete round',
        style: 'destructive',
        onPress: () => {
          deleteRound(editing.id);
          navigation.goBack();
        },
      },
    ]);

  return (
    <View style={s.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={s.content}
      >
        <Text style={s.lead}>
          {editing ? 'Fix the points for this round. Totals update straight away.' : 'Enter the points each player scored this round.'}
        </Text>
        <Card>
          {game.players.map((player, i) => {
            const entry = entries[player.id] ?? { text: '', negative: false };
            const next = base(player.id) + valueFor(player.id);
            const changed = editing ? next !== current[player.id] : entry.text !== '';
            const nextPlayer = game.players[i + 1];
            return (
              <View key={player.id}>
                {i > 0 && <Divider />}
                <View style={s.row}>
                  <Avatar id={player.id} name={player.name} />
                  <View style={s.middle}>
                    <Text style={s.name} numberOfLines={1}>
                      {player.name}
                    </Text>
                    <Text style={s.preview}>
                      {current[player.id]}
                      {changed ? <Text style={s.previewNext}>{`  →  ${next}`}</Text> : null}
                    </Text>
                  </View>

                  <View style={s.segment}>
                    {[false, true].map((negative) => {
                      const active = entry.negative === negative;
                      return (
                        <Pressable
                          key={String(negative)}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          accessibilityLabel={negative ? 'Subtract points' : 'Add points'}
                          onPress={() => update(player.id, { negative })}
                          style={[s.segmentItem, active && s.segmentActive]}
                        >
                          <Text style={[s.segmentText, active && s.segmentTextActive]}>{negative ? '−' : '+'}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <TextInput
                    ref={(r) => (inputs.current[player.id] = r)}
                    accessibilityLabel={`Points for ${player.name}`}
                    value={entry.text}
                    onChangeText={(text) => update(player.id, { text: text.replace(/[^0-9]/g, '') })}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={theme.textTertiary}
                    style={s.input}
                    selectTextOnFocus
                    autoFocus={!editing && i === 0}
                    returnKeyType={nextPlayer ? 'next' : 'done'}
                    onSubmitEditing={() => nextPlayer && inputs.current[nextPlayer.id]?.focus()}
                    maxLength={4}
                  />
                </View>
              </View>
            );
          })}
        </Card>
      </ScrollView>
      <Footer>
        <Button title={editing ? 'Save changes' : `Save round ${roundNumber}`} icon="checkmark" onPress={handleSave} />
        {editing && <Button title="Delete round" variant="destructive" onPress={confirmDelete} />}
      </Footer>
    </View>
  );
}

const styles = (t) => ({
  screen: { flex: 1, backgroundColor: t.background },
  content: { padding: space.lg, paddingBottom: space.xxl },
  lead: { ...type.callout, color: t.textSecondary, marginBottom: space.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.md },
  middle: { flex: 1, marginLeft: space.md, marginRight: space.sm },
  name: { ...type.bodyStrong, color: t.text },
  preview: { ...type.caption, ...type.number, fontFamily: fonts.medium, color: t.textTertiary, marginTop: 2 },
  previewNext: { color: t.primary, fontFamily: fonts.semiBold },
  segment: {
    flexDirection: 'row',
    backgroundColor: t.surfaceMuted,
    borderRadius: radius.sm + 2,
    padding: 2,
    marginRight: space.sm,
  },
  segmentItem: { width: 34, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: t.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  segmentText: { fontFamily: fonts.semiBold, fontSize: 18, color: t.textTertiary },
  segmentTextActive: { color: t.text },
  input: {
    ...type.headline,
    ...type.number,
    width: 64,
    height: 40,
    textAlign: 'center',
    color: t.text,
    backgroundColor: t.surfaceMuted,
    borderRadius: radius.sm + 2,
  },
});
