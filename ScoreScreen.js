import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import HeaderComponent from './components/HeaderComponent';
import ScoreBar from './components/ScoreBar';
import { useScore } from './components/ScoreContext'; // Adjust the path to the actual path if it's different.

export default function ScoreScreen({ route, navigation }) {
  const [players, setPlayers] = useState([]);
  const [sortedPlayers, setSortedPlayers] = useState([]); // <-- New State
  const scrollViewRef = useRef();
  const [currentRound, setCurrentRound] = useState(route.params.currentRound);
  const { maxScore } = useScore();

  useEffect(() => {
    if (route.params?.players) {
      const newPlayersFromRoute = route.params.players;
  
      // Identify new players that don't exist in the current players list
      const newPlayersToAdd = newPlayersFromRoute.filter(
        newPlayer => !players.some(player => player.name === newPlayer.name)
      );
  
      // Concatenate the current players and the new players
      const finalMergedPlayers = [...players, ...newPlayersToAdd];
  
      setPlayers(finalMergedPlayers);
      setSortedPlayers(finalMergedPlayers.sort((a, b) => b.score - a.score));
      checkWinner(players)

    }
    // Handle changes in currentRound
  if (route.params?.currentRound) {
    setCurrentRound(route.params.currentRound);
  }
 }, [route.params?.players, route.params?.currentRound]);
  

  const editPlayers = () => {
    navigation.navigate('PlayerInput', { players: sortedPlayers, currentRound: currentRound });

  };

  const plotScores = () => {
    // console.log(players)
    // console.log(currentRound)
    navigation.navigate('Plot', { players: players, currentRound: currentRound });
  };

  
  const addScores = () => {
    navigation.navigate('EditScores', { players: sortedPlayers, currentRound: currentRound });
  }

  const checkWinner = (playersList) => {
    if (!Array.isArray(playersList)) return;
  
    playersList.forEach(player => {
        if (player.score >= maxScore) {
          Alert.alert(
            `${player.name} won the game!`,
            'Would you like to start a new game with the same players?',
            [
              {
                text: "Yes",
                onPress: () => {
                  // Reset the scores and score history
                  const resetScoresPlayers = playersList.map(p => ({ ...p, score: 0, scoreHistory: [] }));
                  setPlayers(resetScoresPlayers);
                  setSortedPlayers(resetScoresPlayers);
                  setCurrentRound(0)
  
                }
              },
              {
                text: "No",
                onPress: () => console.log("No Pressed"),
                style: "cancel"
              }
            ],
            { cancelable: false }
          );
          
            // Once we find a winner, we don't need to check others, so return out of the loop
            return;
        }
    });
  };

  return (
    <View style={styles.container}>
      <HeaderComponent title="Score Board" navigation={navigation} showButton={route.name !== "Home"} />
      <View style={styles.body}>
          <View style={{ alignItems: 'center'}}>
          <TouchableOpacity 
              style={styles.historyButton}
              onPress={plotScores}         
          >
              <Text style={styles.buttonText}>View score history</Text>
          </TouchableOpacity>
        </View>
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
          {sortedPlayers.map((player, index) => (
            <View key={index} style={styles.playerContainer}>
              <ScoreBar playerName={player.name} score={player.score} />
            </View>
          ))}
          <View style={{ alignItems: 'center', marginBottom: 100 }}>
              <TouchableOpacity 
                  style={styles.buttonContainer}
                  onPress={addScores}         
              >
                  <Text style={styles.buttonText}>Add scores</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                  style={styles.buttonContainer}
                  onPress={editPlayers}         
              >
                  <Text style={styles.buttonText}>Edit players</Text>
              </TouchableOpacity>
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
  playerContainer: {
    flexDirection: 'column',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  body: {
    flex: 15,
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 30,
  },
  playerList: {
    width: '100%',
    marginBottom: 20
  },
  toggleButton: {
    padding: 10,
    backgroundColor: '#ddd',
    marginRight: 10,
    borderRadius: 4,
    width: 50
  },
  toggleButtonText: {
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: 'Inter-Bold'
  },
  nextButton: {
    padding: 10,
    backgroundColor: '#952323',
    marginLeft: 10,
    borderRadius: 4,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Medium'
  },
  buttonContainer: {
    backgroundColor: '#952323',
    padding: 10,
    paddingVertical:20,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    marginVertical: 10,
  },
  historyButton: {
    backgroundColor: '#952323',
    padding: 10,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    marginBottom:10,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  editingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  input: {
    width: '25%',
    padding: 10,
    color: '#A73121',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius:5,
    marginHorizontal: 10
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16
  },
  editingPlayerName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#A73121',
    marginBottom: 10
  }
});
