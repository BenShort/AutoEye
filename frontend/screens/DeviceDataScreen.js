/*
Device Data Screen - Displays all data of a single device
*/

//-------------------------------- Imports ----------------------------------------------

import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { styles } from '../components/styles';
import TempChart from '../components/TempChart';
import LockButton from '../components/LockButton';
import { getMarker } from '../components/Markers';

//-------------------------------- Main -------------------------------------------------

const DeviceDataScreen = ({ route }) => {
  // Get device data from route params
  const [device, setDevice] = useState(route.params.marker);
  const deviceID = route.params.marker.id
  const deviceName = route.params.marker.name

  //------------------------------- Data ------------------------------------------------

  // Poll data
  useFocusEffect(
    React.useCallback(() => {
      const intervalId = setInterval(() => {
        getMarker([deviceID, deviceName])
          .then(updatedDevice => setDevice(updatedDevice))
          .catch(console.error);
      }, 2000); // Polling rate
      // Clear interval on component unmount (each request)
      return () => {
        clearInterval(intervalId);
      };
    }, [])
  );

  // Format data
  const BoldLabel = ({ label, value, unit }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
    <Text style={{ fontWeight: 'bold', marginRight: 10 }}>
      {label}:
    </Text>
    <Text>
      {value} {unit}
    </Text>
  </View>
  )

  //------------------------------ Components -------------------------------------------

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Device Data</Text>
        <Text style={styles.footerText}>No device selected!</Text>
      </View>
    );
  }

  else{
    return (
      <View style={styles.container}>

        <Text style={styles.title}>Device Data</Text>

        <BoldLabel label='name' value={device.name}/>
        <BoldLabel label='latitude' value={device.latitude}/>
        <BoldLabel label='longitude' value={device.longitude}/>
        <BoldLabel label='freezing' value={device.freezing}/>
        <BoldLabel label='temperature' value={device.temperature} unit={'°C'}/>
        <BoldLabel label='CO2' value={device.CO2} unit={'ppm'}/>
        <BoldLabel label='CO2 dangerous' value={device.CO2_above_threshold}/>
        <BoldLabel label='tvoc' value={device.tvoc} unit={'ppb'}/>
        <BoldLabel label='tvoc dangerous' value={device.tvoc_thresh}/>

        <TempChart dataX={device.tempX} dataY={device.tempY}/>

        <LockButton deviceID={deviceID}/>

      </View>
    );
  }
};

export default DeviceDataScreen;
