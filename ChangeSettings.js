import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import HeaderComponent from './components/HeaderComponent';
import { useScore } from './components/ScoreContext'; 

export default function ChangeSettings({ route, navigation }) {

    const { maxScore, setMaxScore } = useScore();
    const [inputFocused, setInputFocused] = useState(false); // This will help to manage the focus state
    const [inputValue, setInputValue] = useState(maxScore.toString()); 

    const handleMaxScoreChange = (text) => {
        setInputValue(text);
    };

    const handleSaveChanges = () => {
        setMaxScore(Number(inputValue));
        navigation.goBack();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <HeaderComponent title="Settings" navigation={navigation} showButton={route.name !== "Home"}/>
                <View style={styles.body}>
                    <View style={styles.maxScore}>
                        <Text style={styles.text}>Maximum game score: </Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="Enter value..."
                            value={inputFocused ? inputValue : maxScore.toString()} 
                            onChangeText={handleMaxScoreChange}
                            keyboardType="numeric"
                            onFocus={() => setInputFocused(true)}
                        />
                    </View>
                    <TouchableOpacity style={styles.buttonContainer} onPress={handleSaveChanges}>
                        <Text style={styles.buttonText}>Save changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    body: {
        flex: 15,
        padding: 20,  // Added padding for some spacing
        marginTop:30,
    },
    maxScore: {
        flexDirection: 'row',  // Ensure the text and input are in the same row
        alignItems: 'center',  // Vertically center the text and input
        marginBottom: 20,  // Space between this row and the save button
    },
    text: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
    },
    input: {
        flex: 1,  // Ensure the input takes up the remaining space in the row
        marginHorizontal: 10,  // Some spacing between the text and input
        padding: 10,
        borderWidth: 1,  // Give the input a border so users know it's editable
        borderColor: '#ccc',
        color: '#A73121',
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        borderRadius:5,
        maxWidth:'35%'
    },
    buttonContainer: {
        backgroundColor: '#952323',
        padding: 10,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
        alignSelf: 'center',
        marginTop:30,  // Center the button horizontally
    },
    buttonText: {
        color: 'white',
        fontFamily: 'Inter-SemiBold',
        fontSize: 16
    },
});

