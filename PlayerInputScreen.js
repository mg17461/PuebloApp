import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Text, ScrollView, TouchableOpacity,KeyboardAvoidingView, Platform } from 'react-native';
import HeaderComponent from './components/HeaderComponent';
import { Ionicons } from '@expo/vector-icons';

export default function PlayerInputScreen({ route, navigation }) {
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const scrollViewRef = useRef();
  const [currentRound, setCurrentRound] = useState(1);
  // const currentRound2 = route.params ? route.params.currentRound : 0;

  useEffect(() => {
    if (route.params?.players) {
        const migratedPlayers = route.params.players.map(player => ({
            ...player,
            score: player.score,
            scoreHistory: player.scoreHistory || [],
        }));
        setPlayers(migratedPlayers);   
    }
    if (route.params?.currentRound) {
      setCurrentRound(route.params.currentRound);
    }
  }, [route.params?.players, route.params?.currentRound]);


const addPlayerHandler = () => {
  // console.log(route.params.currentRound)
  if (players.some(player => player.name.toLowerCase() === currentPlayer.toLowerCase().trim())) {
      alert('This user already exists.');
      return;
  }

  if (currentPlayer.trim()) {
      // Determine the number of rounds played so far
      const roundsPlayed = players[0]?.scoreHistory?.length || 0;

      // Create a score history for the new player with scores set to zero
      const newScoreHistory = Array.from({ length: roundsPlayed }, (v, k) => ({
          round: k + 1, 
          score: 0
      }));

      setPlayers(prevPlayers => [...prevPlayers, { 
          name: currentPlayer, 
          score: 0, 
          scoreHistory: newScoreHistory 
      }]);
      
      setCurrentPlayer('');
      // setcurrentRound(route.params?.currentRound);
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
  } else {
      alert('Please enter a valid name.');
  }
};

  const startGameHandler = () => {
    // Navigate to the game screen or do whatever you want to start the game.
    navigation.navigate('ScoreScreen', {players: players, currentRound: currentRound}); // Replace 'GameScreen' with the actual name of your game screen if it's different.
  };

  const removePlayerHandler = (playerIndex) => {
    setPlayers(prevPlayers => {
        return prevPlayers.filter((player, index) => index !== playerIndex);
    });
};

  return (
    
    <View style={styles.container}>
      <HeaderComponent title="Players" navigation={navigation} showButton={route.name !== "Home"}/>
      <View style={styles.body}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
        <ScrollView 
      style={styles.playerList}
      ref={scrollViewRef}
      keyboardShouldPersistTaps="handled"
  >
    {players.map((player, index) => (
      <View key={index} style={styles.playerRow}>
          <Text style={styles.playerText}>{player.name}</Text>
          <TouchableOpacity onPress={() => removePlayerHandler(index)}>
              <Ionicons name="trash-bin" size={24} color="#A73121" marginRight={15} />
          </TouchableOpacity>
      </View>
    ))}
    <TextInput 
        value={currentPlayer} 
        onChangeText={setCurrentPlayer} 
        placeholder="Enter player name"
        placeholderTextColor={'#DAD4B5'}
        style={styles.input}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setCurrentPlayer('');
      }}
    />
    <View style={{ marginBottom: 70}}>
    {isFocused && (
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={addPlayerHandler}         
      >
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
    )}
    {players.length > 0 && (
      <TouchableOpacity 
          style={styles.buttonContainer}
          onPress={startGameHandler}         
      >
          <Text style={styles.buttonText}>Start game</Text>
      </TouchableOpacity>
    )}
    </View>
    
  </ScrollView>

        
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 15,
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: '5%',  // Using a percentage here for consistency
  },
  inputBottom: {
    width: '100%',
    height: '10%',  // Changed to a percentage
    alignItems: 'center', // Center the children horizontally
  },
  playerList: {
    width: '100%',
    marginBottom: '15%',  // Increased margin for better spacing
  },
  playerText: {
    fontSize: 16, // Consider using a responsive scaling solution here
    fontFamily: 'Inter-Medium',
    color: '#A73121',
    marginLeft: '2%'
  },
  buttonContainer: {
    backgroundColor: '#952323',
    padding: 10,
    paddingVertical: 20,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    marginVertical: 5,
    alignSelf: 'center',  // Center the button within its parent
  },
  playerRow: {
    padding: '2%',  // Using a percentage
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,  // You might want to adjust this on larger screens
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginVertical: '1%',
  },
  input: {
    width: '80%', 
    marginVertical: 10,
    marginLeft: '2%', // This will give it some space from the left side
    padding: 10,
    color: '#A73121',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16  // Consider using a responsive scaling solution here
  },
});

