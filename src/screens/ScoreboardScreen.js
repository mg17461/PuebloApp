import React, { useLayoutEffect, useMemo } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import {
  Avatar,
  Button,
  Card,
  DeltaChip,
  Divider,
  EmptyState,
  Footer,
  IconButton,
  ProgressBar,
  showActionSheet,
} from '../components/ui';
import { useGameStore } from '../game/store';
import { dealerFor, lastRoundScores, standings } from '../game/logic';
import { radius, space, type, useStyles, useTheme } from '../theme';

export default function ScoreboardScreen({ navigation }) {
  useKeepAwake(); // the phone stays on the table between hands
  const s = useStyles(styles);
  const theme = useTheme();
  const game = useGameStore((st) => st.game);
  const maxScore = useGameStore((st) => st.maxScore);
  const showDealer = useGameStore((st) => st.showDealer);
  const undoLastRound = useGameStore((st) => st.undoLastRound);
  const newGame = useGameStore((st) => st.newGame);
  const setDealer = useGameStore((st) => st.setDealer);
  const ranked = useMemo(() => standings(game), [game]);
  const last = lastRoundScores(game);
  const roundsPlayed = game.rounds.length;
  const dealerId = showDealer && game.players.length > 1 ? dealerFor(game) : null;

  useLayoutEffect(() => {
    const confirmUndo = () =>
      Alert.alert(`Undo round ${roundsPlayed}?`, 'The scores from the last round will be removed.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Undo round', style: 'destructive', onPress: undoLastRound },
      ]);

    const confirmNewGame = () =>
      Alert.alert('Start a new game?', 'All scores will be cleared.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Same players', onPress: () => newGame({ keepPlayers: true }) },
        {
          text: 'New players',
          style: 'destructive',
          onPress: () => {
            newGame();
            navigation.popTo('Home');
          },
        },
      ]);

    const chooseDealer = () =>
      showActionSheet({
        title: `Who deals round ${roundsPlayed + 1}?`,
        message: 'The deal then moves to the next player each round.',
        options: game.players.map((p) => ({ label: p.name, run: () => setDealer(p.id) })),
      });

    const openMenu = () =>
      showActionSheet({
        options: [
          ...(showDealer && game.players.length > 1 ? [{ label: 'Change dealer', run: chooseDealer }] : []),
          { label: 'New game', run: confirmNewGame },
          { label: 'Settings', run: () => navigation.navigate('Settings') },
          ...(roundsPlayed > 0 ? [{ label: 'Undo last round', run: confirmUndo, destructive: true }] : []),
        ],
      });

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <IconButton name="stats-chart-outline" label="Score history" onPress={() => navigation.navigate('History')} />
          <IconButton
            name="people-outline"
            label="Edit players"
            onPress={() => navigation.navigate('Players', { fromScoreboard: true })}
          />
          <IconButton name="ellipsis-horizontal-circle-outline" label="More options" onPress={openMenu} />
        </View>
      ),
    });
  }, [navigation, roundsPlayed, undoLastRound, newGame, setDealer, game.players, showDealer]);

  return (
    <View style={s.screen}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.content}>
        <View style={s.meta}>
          <View style={s.pill}>
            <Text style={s.pillText}>
              {roundsPlayed === 0 ? 'No rounds yet' : `${roundsPlayed} ${roundsPlayed === 1 ? 'round' : 'rounds'} played`}
            </Text>
          </View>
          <View style={s.pill}>
            <Text style={s.pillText}>Game to {maxScore}</Text>
          </View>
        </View>

        <Card>
          {ranked.map((p, i) => {
            const toGo = Math.max(0, maxScore - p.total);
            return (
              <View key={p.id}>
                {i > 0 && <Divider inset={space.lg} />}
                <View style={s.row}>
                  {roundsPlayed > 0 && <Text style={s.rank}>{i + 1}</Text>}
                  <Avatar id={p.id} name={p.name} size={40} />
                  <View style={s.middle}>
                    <View style={s.nameLine}>
                      <Text style={s.name} numberOfLines={1}>
                        {p.name}
                      </Text>
                      {p.id === dealerId && (
                        <View style={s.dealer} accessibilityLabel={`${p.name} deals next`}>
                          <Ionicons name="albums-outline" size={12} color={theme.primary} />
                          <Text style={s.dealerText}>Deals</Text>
                        </View>
                      )}
                    </View>
                    <ProgressBar value={p.total} max={maxScore} />
                    <Text style={s.toGo}>{toGo === 0 ? 'Reached the max' : `${toGo} to go`}</Text>
                  </View>
                  <View style={s.right}>
                    <Text style={s.total}>{p.total}</Text>
                    <DeltaChip value={last ? (last[p.id] ?? 0) : null} />
                  </View>
                </View>
              </View>
            );
          })}
        </Card>

        {roundsPlayed === 0 && (
          <EmptyState
            icon="create-outline"
            title="Ready for round 1"
            message="After each hand, tap Add round to enter everyone's points."
          />
        )}
      </ScrollView>

      <Footer>
        <Button title={`Add round ${roundsPlayed + 1}`} icon="add" onPress={() => navigation.navigate('EnterRound')} />
      </Footer>
    </View>
  );
}

const styles = (t) => ({
  screen: { flex: 1, backgroundColor: t.background },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
  meta: { flexDirection: 'row', gap: space.sm, marginBottom: space.md, marginTop: space.xs },
  pill: {
    backgroundColor: t.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: space.md,
    paddingVertical: 6,
  },
  pillText: { ...type.caption, color: t.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.lg },
  rank: { ...type.caption, ...type.number, color: t.textTertiary, width: 20 },
  middle: { flex: 1, marginLeft: space.md, marginRight: space.lg, gap: 6 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  name: { ...type.headline, color: t.text, flexShrink: 1 },
  dealer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: t.primarySoft,
  },
  dealerText: { ...type.caption, fontSize: 11, color: t.primary },
  toGo: { ...type.caption, color: t.textTertiary },
  right: { alignItems: 'flex-end', minWidth: 48 },
  total: { ...type.title, ...type.number, color: t.text },
});
