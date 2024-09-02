/*
Sign Up screen - Create new account
*/

//-------------------------------- Imports ----------------------------------------------

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { styles } from '../components/styles';
import { useUserAuth } from '../context/UserAuthContext';

//-------------------------------- Main -------------------------------------------------

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp } = useUserAuth();
  const navigation = useNavigation();

  // Use library function to create new account and handle errors
  const handleSubmit = async () => {
    setError('');
    try {
      await signUp(email, password);
      navigation.navigate('LoginScreen');
      setError('');

    } catch (err) {
      console.log(err.message);
      switch (err.message) {
        case ('Firebase: Error (auth/email-already-in-use).'):
          setError('Email already in use!');
          break;
        case ('Firebase: Error (auth/invalid-email).'):
          setError('Incorrect email format!');
          break;
        case ('Firebase: Error (auth/weak-password).'):
          setError('Password is too weak!');
          break;
        case ('Firebase: Error (auth/missing-password).'):
          setError('Missing password!');
          break;
        default:
          setError(err.message);
          break;
      }
    }
  };

  //------------------------------ Components -------------------------------------------

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Sign Up</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder='Email'
        keyboardType='email-address'
        autoCapitalize='none'
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder='Password'
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Already have an account?{' '}
        <Text style={styles.signupLink} onPress={() => navigation.navigate('LoginScreen')}>
          Log In
        </Text>

      </Text>

    </View>
  );
};

export default SignupScreen;
