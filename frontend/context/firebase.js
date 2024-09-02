/*
Firebase configuration
*/

//-------------------------------- Imports ----------------------------------------------

import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

//------------------------------- Main ------------------------------------------------

// App's Firebase configuration
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 'initializeAuth' allows save login but doesn't work with web
export const auth = Platform.select({
  native: () => initializeAuth(app, {persistence: getReactNativePersistence(ReactNativeAsyncStorage)}),
  default: () => getAuth(app),
})();

export default app;
