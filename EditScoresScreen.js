import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import HeaderComponent from './components/HeaderComponent';

export default function EditScoresScreen({ route, navigation }) {
  const [players, setPlayers] = useState([]);
  const [sortedPlayers, setSortedPlayers] = useState([]); // <-- New State
  const scrollViewRef = useRef();
  const [currentRound, setCurrentRound] = useState(route.params.currentRound);
  const [scoreSaved, setScoreSaved] = useState(false);

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

    // Handle changes in currentRound
    if (route.params?.currentRound) {
        setCurrentRound(route.params.currentRound);
    }
}, [route.params?.players, route.params?.currentRound]);
  

  const plotScores = () => {
    navigation.navigate('Plot', { players: players, currentRound: currentRound });
  };

  const handleScoreChange = (text, index) => {
    const newPlayers = [...players];
    newPlayers[index].inputScore = text; // Just directly set the text value.
    setPlayers(newPlayers);
};
  
    const editScores = () => {
    let newRound = currentRound;
    
    const missingScoresForPlayers = players.filter(player => {
      const roundScore = player.scoreHistory.find(sh => sh.round === currentRound);
      return !roundScore; // return true for players missing the score for the current round
    });
  
    if (missingScoresForPlayers.length) {
      let alertMessage;
  
      if (missingScoresForPlayers.length === 1) {
        // Singular case
        alertMessage = `Score was not added for ${missingScoresForPlayers[0].name}.`;
      } else {
        // Plural case
        const missingNames = missingScoresForPlayers.map(p => p.name).join(", ");
        alertMessage = `Scores were not added for ${missingNames}.`;
      }
  
      Alert.alert(
        "Missing Scores",
        alertMessage,
        [
          {
            text: "Continue editing",
            style: "cancel"
          },
          { text: "Exit", onPress: () => finalizeEditingScores(newRound) } // continue with the rest of the function
        ],
        { cancelable: false }
      );
      return;
    }
  
    finalizeEditingScores(newRound);
  };
  
    const finalizeEditingScores = (newRound) => {
    if (scoreSaved) {
        newRound += 1; // Increment the round
        setCurrentRound(newRound);
    }

    const newPlayers = players.map(player => {
        return {
        ...player,
        score: Number(player.inputScore) + player.score,
        inputScore: ''
        };
    });

    setPlayers(newPlayers);
    setSortedPlayers(newPlayers.sort((a, b) => b.score - a.score));

    // Check for winner after saving scores
    console.log(newRound)
    navigation.navigate('ScoreScreen', { players: players, currentRound: newRound });
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
    const currentRound = newPlayers[index].scoreHistory.length + 1;

    // Update the score history for the current round
    newPlayers[index].scoreHistory.push({ round: currentRound, score: newPlayers[index].score });

    return newPlayers;
  });
  setScoreSaved(true);  // <-- set scoreSaved to true here
};

  return (
    <View style={styles.container}>
      <HeaderComponent title="Edit Scores" navigation={navigation} showButton={route.name !== "Home"} />
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
            </View>
          ))}
          <View style={{ alignItems: 'center', marginBottom: 100 }}>             
              <TouchableOpacity 
                  style={styles.buttonContainer}
                  onPress={() => editScores()}
              >
                  <Text style={styles.buttonText}>Save changes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                  style={styles.buttonContainer}
                  onPress={() => {navigation.goBack();}}
              >
                  <Text style={styles.buttonText}>Close</Text>
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
