import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import PrimaryButton from '../components/PrimaryButton';
import { useGameStore } from '../game/store';
import { history } from '../game/logic';
import { colors, fonts } from '../theme';

const NAME_WIDTH = 100;
const CELL_WIDTH = 80;

// Running total for each player after each round.
export default function HistoryScreen({ navigation }) {
  const game = useGameStore((s) => s.game);
  const rows = useMemo(() => history(game), [game]);

  return (
    <Screen title="Scores">
      {rows.length === 0 ? (
        <Text style={styles.empty}>No rounds played yet.</Text>
      ) : (
        <ScrollView style={styles.tableScroll}>
          <ScrollView horizontal>
            <View style={styles.table}>
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.nameCell, styles.headerText]}>Player</Text>
                {rows.map((r) => (
                  <Text key={r.round} style={[styles.cell, styles.headerText]}>{`Round ${r.round}`}</Text>
                ))}
              </View>
              {game.players.map((p) => (
                <View key={p.id} style={styles.row}>
                  <Text style={[styles.cell, styles.nameCell, styles.text]} numberOfLines={1}>
                    {p.name}
                  </Text>
                  {rows.map((r) => (
                    <Text key={r.round} style={[styles.cell, styles.text]}>
                      {r.totals[p.id]}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      )}
      <PrimaryButton title="Close" onPress={() => navigation.goBack()} style={styles.close} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tableScroll: { flex: 1, paddingHorizontal: 20 },
  table: { borderWidth: 1, borderColor: '#C1C0B9' },
  row: { flexDirection: 'row' },
  headerRow: { backgroundColor: colors.primary },
  cell: {
    width: CELL_WIDTH,
    paddingVertical: 14,
    textAlign: 'center',
    borderWidth: 0.5,
    borderColor: '#C1C0B9',
  },
  nameCell: { width: NAME_WIDTH },
  headerText: { fontFamily: fonts.semiBold, color: colors.white, fontSize: 16 },
  text: { fontFamily: fonts.medium, fontSize: 16 },
  empty: { flex: 1, textAlign: 'center', marginTop: 40, fontFamily: fonts.medium, fontSize: 16 },
  close: { marginBottom: 50 },
});
