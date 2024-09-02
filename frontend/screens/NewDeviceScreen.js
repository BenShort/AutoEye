/*
New Device screen - Connect new device to account on server
*/

//-------------------------------- Imports ----------------------------------------------

import React, { useState } from 'react';
import { Text, View, TextInput, Button } from 'react-native';

import { styles } from '../components/styles';
import { addDevice } from '../context/requests';

//-------------------------------- Main -------------------------------------------------

const NewDeviceScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [macAddress, setMacAddress] = useState('');

  // Submit new device to server
  const handleSubmit = () => {
    addDevice(macAddress, name); // TODO: Add description
    navigation.goBack();
  };

  //------------------------------ Components -------------------------------------------
  
  return (
    <View style={styles.container}>

      <Text style={styles.title}>Add New Device</Text>

      <TextInput
        style={styles.input}
        placeholder='Name'
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder='MAC Address'
        value={macAddress}
        onChangeText={setMacAddress}
      />

      <Button title='Add Device' onPress={handleSubmit} />

    </View>
  );
};

export default NewDeviceScreen;
