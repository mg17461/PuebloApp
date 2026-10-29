import React, { useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Card, DeltaChip, EmptyState, SectionLabel } from '../components/ui';
import ScoreChart from '../components/ScoreChart';
import { useGameStore } from '../game/store';
import { history, standings } from '../game/logic';
import { space, type, useStyles, useTheme } from '../theme';

const NAME_WIDTH = 132;
const CELL_WIDTH = 68;
const ROW_HEIGHT = 60;

// Chart of running totals, then a table of every round. Tap a round to fix it.
export default function HistoryScreen({ navigation }) {
  const s = useStyles(styles);
  const theme = useTheme();
  const game = useGameStore((st) => st.game);
  const maxScore = useGameStore((st) => st.maxScore);
  const rows = useMemo(() => history(game), [game]);
  const players = useMemo(() => standings(game), [game]);
  const scrollRef = useRef(null);

  if (rows.length === 0) {
    return (
      <View style={s.screen}>
        <EmptyState icon="time-outline" title="No rounds yet" message="Scores appear here after the first round." />
      </View>
    );
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <SectionLabel>Running totals</SectionLabel>
      <Card style={s.chartCard}>
        <ScoreChart rows={rows} players={game.players} maxScore={maxScore} />
      </Card>

      <SectionLabel style={s.section}>Every round</SectionLabel>
      <Card>
        <View style={s.table}>
          <View style={[s.nameCol]}>
            <View style={[s.headCell, s.nameHead]}>
              <Text style={s.headText}>Player</Text>
            </View>
            {players.map((p) => (
              <View key={p.id} style={s.nameCell}>
                <Avatar id={p.id} name={p.name} size={28} />
                <Text style={s.name} numberOfLines={1}>
                  {p.name}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            <View style={s.columns}>
              {rows.map((r, i) => {
                const isLast = i === rows.length - 1;
                const roundId = game.rounds[i].id;
                return (
                  <Pressable
                    key={roundId}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit round ${r.round}`}
                    onPress={() => navigation.navigate('EnterRound', { roundId })}
                    style={({ pressed }) => [isLast && s.lastColumn, pressed && s.pressedColumn]}
                  >
                    <View style={s.headCell}>
                      <Text style={s.headText}>R{r.round}</Text>
                      <Ionicons name="pencil" size={10} color={theme.textTertiary} />
                    </View>
                    {players.map((p) => (
                      <View key={p.id} style={s.cell}>
                        <Text style={[s.total, isLast && s.totalLast]}>{r.totals[p.id]}</Text>
                        <DeltaChip value={r.scores[p.id] ?? 0} />
                      </View>
                    ))}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </Card>
      <Text style={s.hint}>
        Big number: running total. Small number: points that round.{'\n'}Tap a round to fix its scores.
      </Text>
    </ScrollView>
  );
}

const styles = (t) => ({
  screen: { flex: 1, backgroundColor: t.background },
  content: { padding: space.lg },
  chartCard: { padding: space.lg },
  section: { marginTop: space.xl },
  table: { flexDirection: 'row' },
  columns: { flexDirection: 'row' },
  lastColumn: { backgroundColor: t.primarySoft },
  pressedColumn: { opacity: 0.6 },
  nameCol: {
    width: NAME_WIDTH,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: t.border,
    backgroundColor: t.surface,
  },
  headCell: {
    width: CELL_WIDTH,
    height: 40,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.surfaceMuted,
  },
  nameHead: { width: NAME_WIDTH, justifyContent: 'flex-start', paddingLeft: space.lg },
  headText: { ...type.overline, color: t.textSecondary },
  nameCell: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: space.md,
    paddingRight: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.border,
  },
  name: { ...type.bodyStrong, fontSize: 15, color: t.text, marginLeft: space.sm, flex: 1 },
  cell: {
    width: CELL_WIDTH,
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.border,
  },
  total: { ...type.headline, ...type.number, color: t.textSecondary },
  totalLast: { color: t.text },
  hint: { ...type.caption, color: t.textTertiary, textAlign: 'center', marginTop: space.md, lineHeight: 18 },
});
