import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';
import HeaderComponent from './components/HeaderComponent';


export default function PlotScores({ route, navigation }) {

  const closeHistory = () => {
    navigation.goBack();
};
  const currentRound = route.params?.currentRound || 1; // default to 1 if not provided

  const playersData = route.params?.players || [];
  console.log(playersData)

  const maxRoundsPlayed = currentRound;
  console.log(maxRoundsPlayed)

  // Create table headers
  const tableHead = ['Player'].concat([...Array(maxRoundsPlayed).keys()].map(i => `Round ${i + 1}`));

  const columnWidth = 80;
  const widthArr = new Array(tableHead.length).fill(columnWidth);

  // Create table data
  const tableData = playersData.map(player => {
  const rowData = [player.name];

  
  for (let i = 0; i < maxRoundsPlayed; i++) {
    const roundScore = player.scoreHistory.find(sh => sh.round === (i + 1));
    const scoreForRound = roundScore ? roundScore.score : '-';
    rowData.push(scoreForRound.toString());
  }
  
  return rowData;
});
  return (

    <View style={styles.container}>
      <HeaderComponent title="Scores" navigation={navigation} showButton={route.name !== "Home"}/>
      <View style={styles.body}>
      <ScrollView horizontal={true}>
        <View>
          <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
          <Row data={tableHead} widthArr={widthArr} style={styles.header} textStyle={styles.headerText}/>
          <Rows data={tableData} widthArr={widthArr} textStyle={styles.rowText}/>
          </Table>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.buttonContainer} onPress={closeHistory}>
            <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    alignSelf: 'center', // Center the button horizontally

  },
  buttonContainer: {
    backgroundColor: '#952323',
    padding: 10,
    paddingVertical:20,
    borderRadius: 100,
    alignSelf: 'center', // Center the button horizontally
    width: '80%',
    marginVertical: 10,
    marginBottom:50
  },
  body: {
    flex: 15,
    padding: 20,  // Added padding for some spacing
    marginTop:10,
},
  header: { 
    height: 50, 
    backgroundColor: '#952323' 
  },
  headerText: { 
    textAlign: 'center', 
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize:16
  },
  rowText: { 
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    fontSize:16
  },
});

