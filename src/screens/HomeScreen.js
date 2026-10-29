import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, Card, Divider, Footer, IconButton, SectionLabel } from '../components/ui';
import { useGameStore } from '../game/store';
import { standings } from '../game/logic';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, space, type, useStyles, useTheme } from '../theme';

export default function HomeScreen({ navigation }) {
  const s = useStyles(styles);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const game = useGameStore((st) => st.game);
  const maxScore = useGameStore((st) => st.maxScore);
  const newGame = useGameStore((st) => st.newGame);
  const pastGames = useGameStore((st) => st.pastGames);
  const ranked = useMemo(() => standings(game), [game]);
  const hasGame = game.players.length > 0;

  const startNewGame = () => {
    if (!hasGame) {
      navigation.navigate('Players');
      return;
    }
    Alert.alert('Start a new game?', 'The current game and its scores will be cleared.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'New game',
        style: 'destructive',
        onPress: () => {
          newGame();
          navigation.navigate('Players');
        },
      },
    ]);
  };

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + space.lg }]}>
        <View style={s.topBar}>
          <View style={s.brand}>
            <View style={s.mark}>
              <Text style={s.markText}>P</Text>
            </View>
            <Text style={s.brandName}>Pueblo</Text>
          </View>
          <View style={s.topActions}>
            <IconButton name="trophy-outline" label="Stats" color={theme.text} onPress={() => navigation.navigate('Stats')} />
            <IconButton name="settings-outline" label="Settings" color={theme.text} onPress={() => navigation.navigate('Settings')} />
          </View>
        </View>

        <Text style={s.hero}>{hasGame ? 'Welcome back.' : 'Ready when\nyou are.'}</Text>
        <Text style={s.subtitle}>
          {hasGame ? 'Your game is saved right where you left it.' : 'A clean scorecard for your Pueblo nights.'}
        </Text>

        {!hasGame && (
          <>
            <SectionLabel style={s.section}>How it works</SectionLabel>
            <Card>
              {[
                ['people-outline', 'Add the players', 'Everyone at the table, in any order.'],
                ['create-outline', 'Enter each round', 'Type the points after every hand.'],
                ['trophy-outline', `First to ${maxScore}`, 'The app calls the winner for you.'],
              ].map(([icon, title, body], i) => (
                <View key={title}>
                  {i > 0 && <Divider />}
                  <View style={s.row}>
                    <View style={s.stepIcon}>
                      <Ionicons name={icon} size={22} color={theme.textSecondary} />
                    </View>
                    <View style={s.stepText}>
                      <Text style={s.stepTitle}>{title}</Text>
                      <Text style={s.stepBody}>{body}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}

        {pastGames.length > 0 && (
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Stats')}
            style={({ pressed }) => [s.statsLink, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="trophy-outline" size={20} color={theme.primary} />
            <View style={s.stepText}>
              <Text style={s.stepTitle}>Stats and past games</Text>
              <Text style={s.stepBody}>
                {pastGames.length} {pastGames.length === 1 ? 'game' : 'games'} played · last won by {pastGames[0].winnerName}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </Pressable>
        )}

        {hasGame && (
          <>
            <SectionLabel style={s.section}>Current game</SectionLabel>
            <Card>
              <View style={s.gameMeta}>
                <Text style={s.gameMetaText}>
                  {game.rounds.length === 0 ? 'Not started' : `Round ${game.rounds.length}`}
                </Text>
                <Text style={s.gameMetaText}>
                  {game.players.length} {game.players.length === 1 ? 'player' : 'players'}
                </Text>
              </View>
              <Divider inset={0} />
              {ranked.slice(0, 4).map((p, i) => (
                <View key={p.id}>
                  {i > 0 && <Divider />}
                  <View style={s.row}>
                    <Avatar id={p.id} name={p.name} size={32} />
                    <Text style={s.rowName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={s.rowScore}>{p.total}</Text>
                  </View>
                </View>
              ))}
              {ranked.length > 4 && <Text style={s.more}>+{ranked.length - 4} more</Text>}
            </Card>
          </>
        )}
      </ScrollView>

      <Footer>
        {hasGame && <Button title="Resume game" icon="play" onPress={() => navigation.navigate('Scoreboard')} />}
        <Button
          title="New game"
          icon={hasGame ? undefined : 'add'}
          variant={hasGame ? 'secondary' : 'primary'}
          onPress={startNewGame}
        />
      </Footer>
    </View>
  );
}

const styles = (t) => ({
  screen: { flex: 1, backgroundColor: t.background },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  topActions: { flexDirection: 'row', gap: space.lg },
  statsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.xl,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: t.surface,
    borderWidth: 0.5,
    borderColor: t.border,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center' },
  mark: {
    width: 36,
    height: 36,
    borderRadius: radius.sm + 2,
    backgroundColor: t.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.sm,
  },
  markText: { ...type.headline, fontSize: 20, color: t.onPrimary },
  brandName: { ...type.headline, fontSize: 20, color: t.text },
  hero: { ...type.display, color: t.text, marginTop: space.xxl * 1.5 },
  subtitle: { ...type.body, color: t.textSecondary, marginTop: space.sm, lineHeight: 22 },
  section: { marginTop: space.xxl },
  gameMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  gameMetaText: { ...type.caption, color: t.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.md },
  rowName: { ...type.bodyStrong, color: t.text, flex: 1, marginLeft: space.md },
  rowScore: { ...type.headline, ...type.number, color: t.text },
  stepIcon: { width: 28, alignItems: 'center' },
  stepText: { flex: 1, marginLeft: space.md },
  stepTitle: { ...type.bodyStrong, color: t.text },
  stepBody: { ...type.caption, fontFamily: fonts.regular, color: t.textSecondary, marginTop: 2 },
  more: { ...type.caption, color: t.textTertiary, paddingHorizontal: space.lg, paddingBottom: space.md },
});
