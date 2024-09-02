/*
Home screen - Main page for the app
*/

//-------------------------------- Imports ----------------------------------------------

import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import RNPickerSelect from 'react-native-picker-select';

import { styles } from '../components/styles';
import Map from '../components/Map';
import { getAllMarkers } from '../components/Markers';
import { auth } from '../context/firebase';

//-------------------------------- Main -------------------------------------------------

const HomeScreen = () => {
  const navigation = useNavigation();
  const [selectedDevice, setSelectedDevice] = useState();
  const [markers, setMarkers] = useState([]);

  // Handle getting markers
  const fetchMarkers = async () => {
    const user = auth.currentUser;
    if (user != null) {
      getAllMarkers()
        .then(retrievedMarkers => setMarkers(retrievedMarkers))
        .catch(console.error);
    }
  };

  // Polling
  useFocusEffect(
    React.useCallback(() => {
      const intervalId = setInterval(() => {
        fetchMarkers();
      }, 2000); // Polling rate
      // Initial fetch
      fetchMarkers();
      // Clear interval on component unmount (each request)
      return () => {
        clearInterval(intervalId);
      };
    }, [])
  ); // Effect runs once on mount and cleanup on unmount

  //------------------------------ Components -------------------------------------------

  return (
    <View style={[styles.container]}>
      
      <Map markers={markers} selectedLocation={selectedDevice} setSelectedLocation={setSelectedDevice}/>
      
      <View style={{ flex: 1, flexDirection:'row', gap: 10, marginRight: 110, marginLeft: 110 }}>
        
        <RNPickerSelect
          value={selectedDevice ? selectedDevice.id : null}
          onValueChange={(deviceID) => setSelectedDevice(markers.find(marker => marker.id === deviceID))}
          items={markers.map((marker, index) => (
            { label: marker.name, value: marker.id }
          ))}
          style={{
            inputIOS: { height: 40, width: 200, marginTop: 10 },
            inputAndroid: { height: 40, width: 210 },
          }}
          placeholder={{ label: 'Select a device', value: null }}
        />

        <TouchableOpacity style={[styles.button, styles.button]} onPress={() => navigation.navigate('SettingsScreen')}>
          <Icon name='settings' color='#FFFFFF'/>
        </TouchableOpacity>

      </View>

    </View>
  );
};

export default HomeScreen;
