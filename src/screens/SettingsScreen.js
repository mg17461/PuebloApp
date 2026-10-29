import React, { useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import Screen from '../components/Screen';
import PrimaryButton from '../components/PrimaryButton';
import { useGameStore } from '../game/store';
import { parseMaxScore } from '../game/logic';
import { colors, fonts } from '../theme';

export default function SettingsScreen({ navigation }) {
  const maxScore = useGameStore((s) => s.maxScore);
  const setMaxScore = useGameStore((s) => s.setMaxScore);
  const [draft, setDraft] = useState(String(maxScore));

  const handleSave = () => {
    const value = parseMaxScore(draft);
    if (value === null) {
      Alert.alert('Invalid score', 'Please enter a whole number greater than 0.');
      return;
    }
    setMaxScore(value);
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.flex}>
        <Screen title="Settings" showNewGame={false}>
          <View style={styles.row}>
            <Text style={styles.label}>Maximum game score:</Text>
            <TextInput
              accessibilityLabel="Maximum game score"
              style={styles.input}
              value={draft}
              onChangeText={(text) => setDraft(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="50"
              placeholderTextColor={colors.muted}
            />
          </View>
          <PrimaryButton title="Save changes" onPress={handleSave} />
        </Screen>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  label: { fontSize: 16, fontFamily: fonts.medium },
  input: {
    width: 100,
    marginLeft: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    color: colors.accent,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
});
