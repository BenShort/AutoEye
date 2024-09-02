/*
Item component for the OnboardingScreen
*/

//-------------------------------- Imports ----------------------------------------------

import React from 'react';
import { View, Text, Image, useWindowDimensions } from 'react-native';

import { styles } from './styles';

//-------------------------------- Main -------------------------------------------------

export default OnboardingItem = ({ item }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.onboardingContainer, { width }]}>
      <Image source = {item.image} style={[styles.onbardingImage, { width, resizeMode: 'contain' }]} />
      <View style={{flex:0.3}}>
        <Text style={styles.onboardingTitle}>{item.title}</Text>
        <Text style={styles.onboardingDescription}>{item.description}</Text>
      </View>
    </View>
  );
};
