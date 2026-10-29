import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useGameStore } from './src/game/store';
import { fonts, useTheme } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import PlayersScreen from './src/screens/PlayersScreen';
import ScoreboardScreen from './src/screens/ScoreboardScreen';
import EnterRoundScreen from './src/screens/EnterRoundScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import GameOverScreen from './src/screens/GameOverScreen';
import StatsScreen from './src/screens/StatsScreen';

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
  const theme = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
  });
  const hydrated = useStoreHydrated();
  const ready = (fontsLoaded || fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.background,
      text: theme.text,
      border: theme.border,
    },
  };

  const header = {
    headerTintColor: theme.primary,
    headerTitleStyle: { fontFamily: fonts.semiBold, color: theme.text },
    headerLargeTitleStyle: { fontFamily: fonts.bold, color: theme.text },
    headerStyle: { backgroundColor: theme.background },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    // On iPad, keep content to a readable column instead of stretching edge to edge.
    contentStyle: { backgroundColor: theme.background, width: '100%', maxWidth: 720, alignSelf: 'center' },
  };
  const modal = { presentation: 'modal', headerShown: true };

  return (
    <SafeAreaProvider>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator initialRouteName="Home" screenOptions={header}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Players" component={PlayersScreen} options={{ title: 'Players' }} />
          <Stack.Screen
            name="Scoreboard"
            component={ScoreboardScreen}
            options={{ title: 'Scoreboard', headerLargeTitle: true }}
          />
          <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Score history' }} />
          <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Stats', headerLargeTitle: true }} />
          <Stack.Screen name="EnterRound" component={EnterRoundScreen} options={modal} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ ...modal, title: 'Settings' }} />
          <Stack.Screen
            name="GameOver"
            component={GameOverScreen}
            options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);
