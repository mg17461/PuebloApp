import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useGameStore } from './src/game/store';
import HomeScreen from './src/screens/HomeScreen';
import PlayersScreen from './src/screens/PlayersScreen';
import ScoreboardScreen from './src/screens/ScoreboardScreen';
import EnterRoundScreen from './src/screens/EnterRoundScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Crash reporting is only turned on when a DSN is set (see README).
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({ dsn: sentryDsn, enabled: !__DEV__ });
}

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();

function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(useGameStore.persist.hasHydrated());
  useEffect(() => {
    const unsubscribe = useGameStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useGameStore.persist.hasHydrated());
    return unsubscribe;
  }, []);
  return hydrated;
}

function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
    'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
  });
  const hydrated = useStoreHydrated();
  const ready = (fontsLoaded || fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Players" component={PlayersScreen} />
          <Stack.Screen name="Scoreboard" component={ScoreboardScreen} />
          <Stack.Screen name="EnterRound" component={EnterRoundScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);
