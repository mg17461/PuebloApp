import React from 'react';
import { StyleSheet, View } from 'react-native';
import Header from './Header';
import { colors } from '../theme';

/** Shared screen frame: background, safe-area header, body. */
export default function Screen({ title, showNewGame = true, children }) {
  return (
    <View style={styles.container}>
      <Header title={title} showNewGame={showNewGame} />
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, paddingTop: 20 },
});
