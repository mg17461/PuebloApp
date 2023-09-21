import React, { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import PlayerInputScreen from './PlayerInputScreen';
import ScoreScreen from './ScoreScreen';
import ChangeSettings from './ChangeSettings';
import { ScoreProvider } from './components/ScoreContext';
import PlotScores from './PlotScores';
import EditScoresScreen from './EditScoresScreen';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Prevent the splash screen from auto-hiding
    SplashScreen.preventAutoHideAsync()
      .then(() => {
        loadFonts();
      })
      .catch((error) => {
        console.warn("Failed to prevent splash screen auto-hiding:", error);
        loadFonts();
      });
  }, []);

  const loadFonts = async () => {
    console.log("Starting font loading");
    try {
      await Font.loadAsync({
        'Inter-Black': require('./assets/fonts/Inter-Black.ttf'),
        'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
        'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
      });
      setFontsLoaded(true);
      // Hide the splash screen now that the fonts have loaded
      SplashScreen.hideAsync();
    } catch (error) {
      console.warn(error);
      SplashScreen.hideAsync();
    }
  };

  if (!fontsLoaded) {
    return null; // or you can render some kind of placeholder while fonts are loading
  }

  return (
    <ScoreProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="PlayerInput" component={PlayerInputScreen} />
          <Stack.Screen name="ScoreScreen" component={ScoreScreen} />
          <Stack.Screen name="Settings" component={ChangeSettings} />
          <Stack.Screen name="Plot" component={PlotScores} />
          <Stack.Screen name="EditScores" component={EditScoresScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ScoreProvider>
  );
}
