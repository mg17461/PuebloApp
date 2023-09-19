import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useScore } from './ScoreContext'; // Import the hook

const ScoreBar = ({ playerName, score }) => {
    const { maxScore } = useScore(); // Use the hook

    const MAX_SCORE = maxScore; // Use the value from context
    const scorePercentage = (score / MAX_SCORE) * 100;
  
    return (
      <View style={styles.container}>
        <View style={styles.barContainer}>
          <LinearGradient
            style={{ width: '100%', height: '100%', borderRadius: 50 }}
            colors={['#1fe060', '#ace90a', '#ffcd00', '#ffa200', 'darkorange', '#ff3b00']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
          <View
            style={[
              styles.cover,
              { width: `${100 - scorePercentage}%` }
            ]}
          />
          <Text style={styles.playerText}>
            {`${playerName}: ${score}`}
          </Text>
        </View>
      </View>
    );
  };
  

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  playerText: {
  fontSize: 20,
  fontFamily: 'Inter-Bold',
  color: 'white',
  maxWidth: '100%',
  position: 'absolute',   // This ensures that text remains on top
  left: 10,               // Some margin from the left to not start from the edge
  zIndex: 1,              // To ensure text remains above the gradient
  top: 7,                 // Stretch from top...
  bottom: 0,              // ...to bottom
  justifyContent: 'center', // Center vertically
  alignItems: 'center',     // Center horizontally
},
barContainer: {
    flex: 1,
    backgroundColor: '#352646',
    marginLeft: 10,
    height: 40,
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
  },
  cover: {
    height: '100%',
    backgroundColor: '#352646',
    position: 'absolute',
    right: 0,
    
  },
});

export default ScoreBar;


