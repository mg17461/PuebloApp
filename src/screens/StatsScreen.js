import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Avatar, Card, Divider, EmptyState, SectionLabel } from '../components/ui';
import { useGameStore } from '../game/store';
import { playerStats } from '../game/logic';
import { space, type, useStyles } from '../theme';

const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

// Leaderboard across finished games, and a list of recent games.
export default function StatsScreen() {
  const s = useStyles(styles);
  const pastGames = useGameStore((st) => st.pastGames);
  const stats = useMemo(() => playerStats(pastGames), [pastGames]);

  if (pastGames.length === 0) {
    return (
      <View style={s.screen}>
        <EmptyState
          icon="trophy-outline"
          title="No finished games yet"
          message="When someone wins a game, it's saved here with everyone's stats."
        />
      </View>
    );
  }

  const totalRounds = pastGames.reduce((n, g) => n + g.rounds, 0);

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} contentInsetAdjustmentBehavior="automatic">
      <View style={s.tiles}>
        <Tile label="Games" value={pastGames.length} />
        <Tile label="Rounds" value={totalRounds} />
        <Tile label="Players" value={stats.length} />
      </View>

      <SectionLabel style={s.section}>Leaderboard</SectionLabel>
      <Card>
        {stats.map((p, i) => (
          <View key={p.name}>
            {i > 0 && <Divider />}
            <View style={s.row}>
              <Avatar id={p.name} name={p.name} colorIndex={i} />
              <View style={s.middle}>
                <Text style={s.name} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={s.detail}>
                  {p.wins} {p.wins === 1 ? 'win' : 'wins'} · {p.played} played · avg {Math.round(p.average)} pts
                </Text>
              </View>
              <Text style={s.rate}>{Math.round(p.winRate * 100)}%</Text>
            </View>
          </View>
        ))}
      </Card>
      <Text style={s.hint}>Percentage is how often each player has won.</Text>

      <SectionLabel style={s.section}>Recent games</SectionLabel>
      <Card>
        {pastGames.slice(0, 30).map((g, i) => (
          <View key={g.id}>
            {i > 0 && <Divider inset={space.lg} />}
            <View style={s.gameRow}>
              <View style={s.gameHead}>
                <Text style={s.name}>{g.winnerName} won</Text>
                <Text style={s.detail}>{dateFormat.format(new Date(g.finishedAt))}</Text>
              </View>
              <Text style={s.detail} numberOfLines={2}>
                {g.results.map((r) => `${r.name} ${r.total}`).join(' · ')}
              </Text>
              <Text style={s.meta}>
                {g.rounds} rounds · game to {g.maxScore}
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

function Tile({ label, value }) {
  const s = useStyles(styles);
  return (
    <View style={s.tile}>
      <Text style={s.tileValue}>{value}</Text>
      <Text style={s.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = (t) => ({
  screen: { flex: 1, backgroundColor: t.background },
  content: { padding: space.lg, paddingBottom: space.xxl },
  tiles: { flexDirection: 'row', gap: space.sm },
  tile: {
    flex: 1,
    backgroundColor: t.surface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: t.border,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  tileValue: { ...type.title, ...type.number, color: t.text },
  tileLabel: { ...type.caption, color: t.textSecondary, marginTop: 2 },
  section: { marginTop: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.md },
  middle: { flex: 1, marginLeft: space.md, marginRight: space.md },
  name: { ...type.bodyStrong, color: t.text },
  detail: { ...type.caption, color: t.textSecondary, marginTop: 2 },
  meta: { ...type.caption, color: t.textTertiary, marginTop: 4 },
  rate: { ...type.headline, ...type.number, color: t.text },
  hint: { ...type.caption, color: t.textTertiary, marginTop: space.sm, marginLeft: space.xs },
  gameRow: { paddingHorizontal: space.lg, paddingVertical: space.md },
  gameHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
