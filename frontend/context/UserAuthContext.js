/*
Library for firebase authenticaton
*/

//-------------------------------- Imports ----------------------------------------------

import { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth';
import app, { auth } from './firebase';

//-------------------------------- Main -------------------------------------------------

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState({});
  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
      .then(() => {
          var user = auth.currentUser;
          if (user != null){
            if (!user.emailVerified){
              Alert.alert('Verify Email', 'before logging in');
              signOut(auth);
              throw('Not Verified');
            }
          }
      });
  }
  function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
                // send verification mail.
                sendEmailVerification(auth.currentUser);
                auth.signOut();
                Alert.alert('Verify your email', 'sent');
            })
      // .catch(alert);
  }
  function logOut() {
    return signOut(auth);
  }
  function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider(app);
    return signInWithPopup(auth, googleAuthProvider)
      .then((result) => {
        console.log('SUCCESS:', result)
      }).catch((error) => {
        console.log('ERROR:', error)
      });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
      setUser(currentuser);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  
  return (
    <userAuthContext.Provider value={{ user, logIn, signUp, logOut, googleSignIn }}>
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}
