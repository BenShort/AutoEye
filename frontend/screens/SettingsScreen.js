/*
Settings screen - Navigation (log out, new device)
*/

//-------------------------------- Imports ----------------------------------------------

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import { styles } from '../components/styles';
import { useUserAuth } from '../context/UserAuthContext';

//-------------------------------- Notification settings --------------------------------

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

//-------------------------------- Main -------------------------------------------------

const SettingsScreen = () => {
  const { logOut } = useUserAuth();
  const navigation = useNavigation();

  // reset authentication and go back to login screen
  const handleLogout = async () => {
    try {
      await logOut();
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.log(error.message);
    }
  };

  //------------------------------ Components -------------------------------------------

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('NewDeviceScreen')}>
        <Text style={styles.buttonText}>New Device</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>

    </View>
  );
};

export default SettingsScreen;
