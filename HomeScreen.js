import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import HeaderComponent from './components/HeaderComponent';
import GlowEffect from './components/GlowEffect';

export default function HomeScreen({ route, navigation }) {
  return (
    <View style={styles.container}>
      <HeaderComponent title="Pueblo" navigation={navigation} showButton={route.name !== "Home"}/>

      <View style={styles.body}>
        <View style={styles.buttonWrapper}>
          <GlowEffect />
          <TouchableOpacity 
              style={styles.circleButton}
              onPress={() => navigation.navigate('PlayerInput')}
          >
              <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2E8C6'
  },
  body: {
    flex: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:60
  },
  circleButton: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#A73121',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 30,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
});
