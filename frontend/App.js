/*
Top Level File - Intra-page navigation system
*/

//-------------------------------- Imports ----------------------------------------------

import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LogBox } from 'react-native';

import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen'
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import NewDeviceScreen from './screens/NewDeviceScreen';
import DeviceDataScreen from './screens/DeviceDataScreen';
import { styles } from './components/styles';
import { UserAuthContextProvider } from './context/UserAuthContext';

//-------------------------------- Ignore Warnings (dev) --------------------------------

// react-navigation warning caused by version
LogBox.ignoreLogs(['new NativeEventEmitter']);

//-------------------------------- Main -------------------------------------------------

const Stack = createStackNavigator();

export default function App() {

  return (
    <View style={[styles.appContainer]}>
      <UserAuthContextProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name='OnboardingScreen' component={OnboardingScreen} options={{headerShown: false}}/>
            <Stack.Screen name='LoginScreen' component={LoginScreen} options={{headerShown: false}}/>
            <Stack.Screen name='SignupScreen' component={SignupScreen} options={{headerShown: false}}/>
            <Stack.Screen name='HomeScreen' component={HomeScreen} options={{headerShown: false}}/>
            <Stack.Screen name='SettingsScreen' component={SettingsScreen} options={{headerShown: false}}/>
            <Stack.Screen name='NewDeviceScreen' component={NewDeviceScreen} options={{headerShown: false}}/>
            <Stack.Screen name='DeviceDataScreen' component={DeviceDataScreen} options={{headerShown: false}}/>
          </Stack.Navigator>
        </NavigationContainer>
      </UserAuthContextProvider>
    </View>
  );
}
