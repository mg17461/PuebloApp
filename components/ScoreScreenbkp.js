import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import HeaderComponent from './components/HeaderComponent';
import ScoreBar from './components/ScoreBar';
import { useScore } from './components/ScoreContext'; // Adjust the path to the actual path if it's different.

export default function ScoreScreen({ route, navigation }) {
  const [players, setPlayers] = useState([]);
  const [sortedPlayers, setSortedPlayers] = useState([]); // <-- New State
  const scrollViewRef = useRef();
  const [editingScores, setEditingScores] = useState(false);
  const [currentRound, setcurrentRound] = useState(route.params.currentRound);
  const { maxScore } = useScore();
  const [scoresEdited, setScoresEdited] = useState(false);

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
    }
  }, [route.params?.players]);
  

  const editPlayers = () => {
    console.log(currentRound)
    navigation.navigate('PlayerInput', { players: sortedPlayers, currentRound: currentRound });

  };

  const plotScores = () => {
    navigation.navigate('Plot', { players: players, currentRound: currentRound });
  };

  const handleScoreChange = (text, index) => {
    const newPlayers = [...players];
    newPlayers[index].inputScore = text; // Just directly set the text value.
    setPlayers(newPlayers);
};
  
  const editScores = () => {
    if (editingScores) {
      const newPlayers = players.map(player => {
        return {
          ...player,
          score: Number(player.inputScore) + player.score,
          inputScore: ''
        };
      });
      // console.log(newPlayers)
  
      setPlayers(newPlayers);
      setSortedPlayers(newPlayers.sort((a, b) => b.score - a.score)); // <-- Sort the players here
  
      // Check for winner after saving scores
      checkWinner(newPlayers);
      console.log(currentRound)
      // console.log(currentRound)
      
      setEditingScores(false);
    } else {
      // setEditingScores(true);
      if (scoresEdited){
        setcurrentRound(currentRound => currentRound + 1)
      }
      
    }
  };
  
  const handleToggleChange = (index) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      newPlayers[index].isPositive = !newPlayers[index].isPositive;
      return newPlayers;
    });
  };

  const handleSaveScore = (index) => {
  setPlayers(prevPlayers => {
    const newPlayers = [...prevPlayers];

    // Check if the input score is empty or NaN and set it to 0 if true.
    let inputScoreValue = Number(newPlayers[index].inputScore);
    if (isNaN(inputScoreValue)) {
      inputScoreValue = 0;
    }

    const scoreChange = newPlayers[index].isPositive ? -inputScoreValue : inputScoreValue;
    newPlayers[index].score += scoreChange;
    newPlayers[index].inputScore = ''; // reset the input field after saving

    // Identify the current round based on the length of the scoreHistory array
    // const currentRound = newPlayers[index].scoreHistory.length + 1;

    // Update the score history for the current round
    newPlayers[index].scoreHistory.push({ round: currentRound, score: newPlayers[index].score });

    return newPlayers;
  });
};

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
                setcurrentRound(0)
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
        {!editingScores && (
          <View style={{ alignItems: 'center'}}>
          <TouchableOpacity 
              style={styles.historyButton}
              onPress={plotScores}         
          >
              <Text style={styles.buttonText}>View score history</Text>
          </TouchableOpacity>
        </View>
        )}
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
              {!editingScores && <ScoreBar playerName={player.name} score={player.score} />}
              {editingScores && (
                <View style={styles.playerRow}>
                <Text style={styles.editingPlayerName}>{`${player.name}: ${player.score}`}</Text>
                  <View style={styles.editingContainer}>
                    <TouchableOpacity 
                      style={styles.toggleButton}
                      onPress={() => handleToggleChange(index)}>
                      <Text style={styles.toggleButtonText}>
                        {player.isPositive ? '-' : '+'}
                      </Text>
                    </TouchableOpacity>
                    <TextInput 
                      value={player.inputScore}
                      onChangeText={(text) => handleScoreChange(text, index)}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <TouchableOpacity 
                        style={styles.nextButton}
                        onPress={() => handleSaveScore(index)}>
                        <Text style={styles.nextButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
          <View style={{ alignItems: 'center', marginBottom: 100 }}>
          {!editingScores ? (
            <>
              <TouchableOpacity 
                  style={styles.buttonContainer}
                  onPress={editScores}         
              >
                  <Text style={styles.buttonText}>Add scores</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                  style={styles.buttonContainer}
                  onPress={editPlayers}         
              >
                  <Text style={styles.buttonText}>Edit players</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              
              <TouchableOpacity 
                  style={styles.buttonContainer}
                  onPress={editScores}
              >
                  <Text style={styles.buttonText}>Save changes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                  style={styles.buttonContainer}
                  onPress={() => {setScoresEdited(true); setEditingScores(false)}}
              >
                  <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </>
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
