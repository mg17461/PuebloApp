import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HeaderComponent = ({ title, navigation, showButton }) => {
  return (
    <View style={styles.container}>
      
      {showButton ? (     
      <TouchableOpacity 
      style={styles.button}
      onPress={() => {
          Alert.alert(
              "Confirmation", // Title
              "Are you sure you want to start a new game? All scores will be lost.", // Message
              [
                  {
                      text: "No", 
                      style: "cancel"  // Just close the alert if 'No' is pressed
                  },
                  { 
                      text: "Yes", 
                      onPress: () => navigation.navigate('Home') // Navigate to Home if 'Yes' is pressed
                  }
              ]
          );
      }}
  >
        <Text style={styles.buttonText}>New Game</Text>
      </TouchableOpacity>
      ) : (
        <View style={styles.placeholder}></View>
      )
      }
      
      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings" size={30} color="#A73121" marginRight={15} />
      </TouchableOpacity>

      
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  button: {
    marginLeft: 15,
    backgroundColor: '#A73121',
    borderWidth:2,
    borderRadius:15,
    padding:6,
    borderColor: '#DAD4B5'
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white'
  },
  title: {
    fontSize: 30,
    color: 'black',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
    marginRight: 50
  },
  placeholder: {
    width: 80, 
    height: 30
  }
});

export default HeaderComponent;
