import React, { useRef, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import PrimaryButton from '../components/PrimaryButton';
import { useGameStore } from '../game/store';
import { colors, fonts } from '../theme';

export default function PlayersScreen({ route, navigation }) {
  const players = useGameStore((s) => s.game.players);
  const hasRounds = useGameStore((s) => s.game.rounds.length > 0);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const [name, setName] = useState('');
  const scrollRef = useRef(null);
  const fromScoreboard = route.params?.fromScoreboard === true;

  const handleAdd = () => {
    const error = addPlayer(name);
    if (error) {
      Alert.alert(error);
      return;
    }
    setName('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleRemove = (player) => {
    if (!hasRounds) {
      removePlayer(player.id);
      return;
    }
    Alert.alert('Remove player', `Remove ${player.name}? Their scores will be removed from this game.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removePlayer(player.id) },
    ]);
  };

  const handleDone = () => {
    if (fromScoreboard) navigation.goBack();
    else navigation.navigate('Scoreboard');
  };

  return (
    <Screen title="Players">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          {players.map((player) => (
            <View key={player.id} style={styles.playerRow}>
              <Text style={styles.playerText}>{player.name}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Remove ${player.name}`}
                hitSlop={10}
                onPress={() => handleRemove(player)}
              >
                <Ionicons name="trash-bin" size={24} color={colors.accent} />
              </TouchableOpacity>
            </View>
          ))}

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter player name"
            placeholderTextColor={colors.muted}
            style={styles.input}
            returnKeyType="done"
            submitBehavior="submit"
            onSubmitEditing={handleAdd}
            autoCapitalize="words"
          />

          <PrimaryButton title="Add player" onPress={handleAdd} disabled={!name.trim()} />
          {players.length > 0 && (
            <PrimaryButton title={fromScoreboard ? 'Back to scores' : 'Start game'} onPress={handleDone} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 70 },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  playerText: { fontSize: 16, fontFamily: fonts.medium, color: colors.accent },
  input: {
    marginVertical: 10,
    marginHorizontal: 15,
    padding: 10,
    color: colors.accent,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
});
