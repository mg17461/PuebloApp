import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Avatar, Button, Card, Divider, EmptyState, Footer, IconButton, SectionLabel } from '../components/ui';
import { useGameStore } from '../game/store';
import { radius, space, type, useStyles, useTheme } from '../theme';

export default function PlayersScreen({ route, navigation }) {
  const s = useStyles(styles);
  const theme = useTheme();
  const players = useGameStore((st) => st.game.players);
  const hasRounds = useGameStore((st) => st.game.rounds.length > 0);
  const addPlayer = useGameStore((st) => st.addPlayer);
  const removePlayer = useGameStore((st) => st.removePlayer);
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const fromScoreboard = route.params?.fromScoreboard === true;
  const roster = useGameStore((st) => st.roster);
  const forgetRosterName = useGameStore((st) => st.forgetRosterName);
  const suggestions = roster.filter((n) => !players.some((p) => p.name.toLowerCase() === n.toLowerCase()));

  const addRecent = (n) => {
    const message = addPlayer(n);
    if (message) setError(message);
    Haptics.selectionAsync().catch(() => {});
  };

  const forgetRecent = (n) =>
    Alert.alert(`Forget ${n}?`, 'They will no longer appear in recent players.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Forget', style: 'destructive', onPress: () => forgetRosterName(n) },
    ]);

  const handleAdd = () => {
    const message = addPlayer(name);
    if (message) {
      setError(message);
      return;
    }
    setName('');
    setError(null);
    inputRef.current?.focus();
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const handleRemove = (player) => {
    if (!hasRounds) {
      removePlayer(player.id);
      return;
    }
    Alert.alert(`Remove ${player.name}?`, 'Their scores will be removed from this game.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removePlayer(player.id) },
    ]);
  };

  const handleDone = () => {
    if (fromScoreboard) navigation.goBack();
    else navigation.replace('Scoreboard');
  };

  const canAdd = name.trim().length > 0;

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
        <Text style={s.lead}>Who's playing? Add everyone at the table.</Text>

        <View style={[s.inputRow, error && s.inputRowError]}>
          <Ionicons name="person-add-outline" size={20} color={theme.textTertiary} />
          <TextInput
            ref={inputRef}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError(null);
            }}
            placeholder="Player name"
            placeholderTextColor={theme.textTertiary}
            style={s.input}
            returnKeyType="done"
            submitBehavior="submit"
            onSubmitEditing={handleAdd}
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus={players.length === 0}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add player"
            disabled={!canAdd}
            onPress={handleAdd}
            style={({ pressed }) => [s.addButton, !canAdd && s.addButtonDisabled, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="add" size={22} color={theme.onPrimary} />
          </Pressable>
        </View>
        {error && <Text style={s.error}>{error}</Text>}

        {suggestions.length > 0 && (
          <>
            <SectionLabel style={s.section}>Recent players</SectionLabel>
            <View style={s.chips}>
              {suggestions.map((n) => (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${n}`}
                  accessibilityHint="Long press to forget this name"
                  onPress={() => addRecent(n)}
                  onLongPress={() => forgetRecent(n)}
                  style={({ pressed }) => [s.chip, pressed && s.chipPressed]}
                >
                  <Ionicons name="add" size={16} color={theme.primary} />
                  <Text style={s.chipText}>{n}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <SectionLabel style={s.section}>
          {players.length === 0 ? 'Players' : `Players · ${players.length}`}
        </SectionLabel>
        <Card>
          {players.length === 0 ? (
            <EmptyState icon="people-outline" title="No players yet" message="Add at least one player to start." />
          ) : (
            players.map((player, i) => (
              <View key={player.id}>
                {i > 0 && <Divider />}
                <View style={s.row}>
                  <Avatar id={player.id} name={player.name} />
                  <Text style={s.rowName} numberOfLines={1}>
                    {player.name}
                  </Text>
                  <IconButton
                    name="remove-circle"
                    size={24}
                    color={theme.danger}
                    label={`Remove ${player.name}`}
                    onPress={() => handleRemove(player)}
                  />
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      <Footer>
        <Button
          title={fromScoreboard ? 'Done' : 'Start game'}
          icon={fromScoreboard ? undefined : 'play'}
          disabled={players.length === 0}
          onPress={handleDone}
        />
      </Footer>
    </KeyboardAvoidingView>
  );
}

const styles = (t) => ({
  screen: { flex: 1, backgroundColor: t.background },
  content: { padding: space.lg, paddingBottom: space.xxl },
  lead: { ...type.body, color: t.textSecondary, marginBottom: space.lg },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: t.border,
    paddingLeft: space.lg,
    paddingRight: space.sm,
    height: 56,
  },
  inputRowError: { borderColor: t.danger },
  input: { ...type.body, flex: 1, color: t.text, marginLeft: space.md, height: '100%' },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: t.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: { opacity: 0.35 },
  error: { ...type.caption, color: t.danger, marginTop: space.sm, marginLeft: space.xs },
  section: { marginTop: space.xl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: space.sm + 2,
    paddingRight: space.md,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
  },
  chipPressed: { backgroundColor: t.primarySoft },
  chipText: { ...type.bodyStrong, fontSize: 15, color: t.text },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.md },
  rowName: { ...type.bodyStrong, color: t.text, flex: 1, marginLeft: space.md },
});
