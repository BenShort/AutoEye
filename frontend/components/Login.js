/*
Login component on LoginScreen
*/

//-------------------------------- Imports ----------------------------------------------

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { styles } from './styles';
import { useUserAuth } from '../context/UserAuthContext';
import { auth } from '../context/firebase';
import { addNotifications } from '../context/requests';

//-------------------------------- Main -------------------------------------------------

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [expoPushToken, setExpoPushToken] = useState('');
  const { logIn } = useUserAuth();
  const navigation = useNavigation();

  // Email sign in
  const handleSubmit = async () => {
    setError('');
    await logIn(email, password)
      .then(() => {
        setEmail('');
        setPassword('');
      })
      .catch((err) => {
      switch (err.message) {
        case ('Firebase: Error (auth/invalid-email).'):
          setError('Incorrect email format!');
          break;
        case ('Firebase: Error (auth/invalid-credential).'):
          setError('Invalid email or password!');
          break;
        case ('Firebase: Error (auth/missing-password).'):
          setError('Missing password!');
          break;
        default:
          setError(err.message);
          break;
        }
      })
    }

  // Skip sign in if authenticated
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        navigation.navigate('HomeScreen');
        registerForPushNotificationsAsync().then(token => {
        setExpoPushToken(token)
        }).catch((err) => console.log(err));
      }
    });
  }, [auth]);

  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId: '3428b78e-f56b-4667-accb-fdd1f702918e' })).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    await addNotifications(token.slice(18, 40)); // Assuming Tokens are always the same length

    return token;
  }

  //------------------------------ Components -------------------------------------------

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder='Email'
        keyboardType='email-address'
        autoCapitalize='none'
        onChangeText={setEmail}
        value={email}
      />

      <TextInput
        style={styles.input}
        placeholder='Password'
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Don't have an account?{' '}
        <Text style={styles.signupLink} onPress={() => navigation.navigate('SignupScreen')}>
          Sign up
        </Text>
      </Text>
    </View>
  );
};