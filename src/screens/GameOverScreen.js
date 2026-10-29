import React, { useEffect, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, Card, Divider, Footer } from '../components/ui';
import { useGameStore } from '../game/store';
import { playersAtMax, standings } from '../game/logic';
import { space, type, useStyles, useTheme } from '../theme';

export default function GameOverScreen({ navigation }) {
  const s = useStyles(styles);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const game = useGameStore((st) => st.game);
  const maxScore = useGameStore((st) => st.maxScore);
  const newGame = useGameStore((st) => st.newGame);
  const archiveGame = useGameStore((st) => st.archiveGame);
  const ranked = useMemo(() => standings(game), [game]);
  const winner = playersAtMax(game, maxScore)[0] ?? ranked[0];

  useEffect(() => {
    archiveGame(); // saved for stats; re-saving the same game later just updates it
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [archiveGame]);

  const rematch = () => {
    newGame({ keepPlayers: true });
    navigation.goBack();
  };

  const newPlayers = () => {
    newGame();
    navigation.popTo('Home');
    navigation.navigate('Players');
  };

  if (!winner) return null;

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + space.xxl }]}>
        <View style={s.trophy}>
          <Ionicons name="trophy" size={40} color={theme.primary} />
        </View>
        <Text style={s.overline}>Game over · {game.rounds.length} rounds</Text>
        <Text style={s.title}>{winner.name} wins!</Text>
        <Text style={s.subtitle}>
          Reached {winner.total} points — the target was {maxScore}.
        </Text>

        <Card style={s.card}>
          {ranked.map((p, i) => (
            <View key={p.id}>
              {i > 0 && <Divider />}
              <View style={s.row}>
                <Avatar id={p.id} name={p.name} />
                <Text style={s.name} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={[s.score, p.id === winner.id && { color: theme.primary }]}>{p.total}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>

      <Footer>
        <Button title="Rematch" icon="refresh" onPress={rematch} />
        <Button title="New players" variant="secondary" onPress={newPlayers} />
        <Button title="Keep playing" variant="ghost" onPress={() => navigation.goBack()} />
      </Footer>
    </View>
  );
}

const styles = (t) => ({
  screen: { flex: 1, backgroundColor: t.background },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xl, alignItems: 'stretch' },
  trophy: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: t.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  overline: { ...type.overline, color: t.textSecondary, textAlign: 'center', marginTop: space.xl },
  title: { ...type.display, fontSize: 36, color: t.text, textAlign: 'center', marginTop: space.sm },
  subtitle: { ...type.body, color: t.textSecondary, textAlign: 'center', marginTop: space.sm },
  card: { marginTop: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.md },
  name: { ...type.bodyStrong, color: t.text, flex: 1, marginLeft: space.md },
  score: { ...type.headline, ...type.number, color: t.text },
});
