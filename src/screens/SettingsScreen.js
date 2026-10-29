import React, { useLayoutEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { Card, Divider, SectionLabel } from '../components/ui';
import { useGameStore } from '../game/store';
import { parseMaxScore } from '../game/logic';
import { fonts, radius, space, type, useStyles, useTheme } from '../theme';

const STEP = 5;

export default function SettingsScreen({ navigation }) {
  const s = useStyles(styles);
  const theme = useTheme();
  const maxScore = useGameStore((st) => st.maxScore);
  const setMaxScore = useGameStore((st) => st.setMaxScore);
  const [draft, setDraft] = useState(String(maxScore));
  const showDealer = useGameStore((st) => st.showDealer);
  const setShowDealer = useGameStore((st) => st.setShowDealer);
  const pastGames = useGameStore((st) => st.pastGames);
  const clearPastGames = useGameStore((st) => st.clearPastGames);

  const confirmClear = () =>
    Alert.alert('Clear game history?', 'All past games and stats will be deleted. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear history', style: 'destructive', onPress: clearPastGames },
    ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => navigation.goBack()} style={{ paddingHorizontal: Platform.OS === 'web' ? space.lg : 0 }}>
          <Text style={{ color: theme.primary, fontSize: 17, fontFamily: fonts.semiBold }}>Done</Text>
        </Pressable>
      ),
    });
  }, [navigation, theme]);

  const commit = (value) => {
    setMaxScore(value);
    setDraft(String(value));
  };

  const step = (delta) => {
    const next = Math.max(STEP, (parseMaxScore(draft) ?? maxScore) + delta);
    Haptics.selectionAsync().catch(() => {});
    commit(next);
  };

  const onBlur = () => {
    const value = parseMaxScore(draft);
    if (value === null) setDraft(String(maxScore));
    else commit(value);
  };

  const version = Constants.expoConfig?.version ?? '';

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <SectionLabel>Game</SectionLabel>
      <Card>
        <View style={s.row}>
          <View style={s.rowText}>
            <Text style={s.label}>Max score</Text>
            <Text style={s.help}>The game ends when a player reaches this.</Text>
          </View>
          <View style={s.stepper}>
            <Pressable accessibilityRole="button" accessibilityLabel="Decrease max score" style={s.stepButton} onPress={() => step(-STEP)}>
              <Ionicons name="remove" size={18} color={theme.text} />
            </Pressable>
            <TextInput
              accessibilityLabel="Max score"
              value={draft}
              onChangeText={(t) => setDraft(t.replace(/[^0-9]/g, ''))}
              onBlur={onBlur}
              onSubmitEditing={onBlur}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={4}
              selectTextOnFocus
              style={s.stepValue}
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Increase max score" style={s.stepButton} onPress={() => step(STEP)}>
              <Ionicons name="add" size={18} color={theme.text} />
            </Pressable>
          </View>
        </View>
        <Divider inset={space.lg} />
        <View style={s.row}>
          <View style={s.rowText}>
            <Text style={s.label}>Show dealer</Text>
            <Text style={s.help}>Marks who deals next. The deal moves one player each round.</Text>
          </View>
          <Switch
            value={showDealer}
            onValueChange={setShowDealer}
            trackColor={{ true: theme.primary, false: theme.surfaceMuted }}
            accessibilityLabel="Show dealer"
          />
        </View>
      </Card>
      <Text style={s.footnote}>Changes apply to the current game straight away.</Text>

      <SectionLabel style={s.section}>History</SectionLabel>
      <Card>
        <Pressable
          accessibilityRole="button"
          disabled={pastGames.length === 0}
          onPress={confirmClear}
          style={({ pressed }) => [s.row, pressed && { opacity: 0.6 }]}
        >
          <Text style={[s.label, s.rowText, { color: pastGames.length ? theme.danger : theme.textTertiary }]}>
            Clear game history
          </Text>
          <Text style={s.value}>{pastGames.length} {pastGames.length === 1 ? 'game' : 'games'}</Text>
        </Pressable>
      </Card>

      <SectionLabel style={s.section}>About</SectionLabel>
      <Card>
        <View style={s.row}>
          <Text style={[s.label, s.rowText]}>Version</Text>
          <Text style={s.value}>{version}</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = (t) => ({
  screen: { flex: 1, backgroundColor: t.background },
  content: { padding: space.lg },
  section: { marginTop: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.md, minHeight: 52 },
  rowText: { flex: 1, marginRight: space.md },
  label: { ...type.bodyStrong, color: t.text },
  help: { ...type.caption, color: t.textTertiary, marginTop: 2 },
  value: { ...type.body, color: t.textSecondary },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.surfaceMuted, borderRadius: radius.md, padding: 3 },
  stepButton: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  stepValue: { ...type.headline, ...type.number, color: t.text, width: 52, textAlign: 'center' },
  footnote: { ...type.caption, color: t.textTertiary, marginTop: space.sm, marginLeft: space.xs },
});
