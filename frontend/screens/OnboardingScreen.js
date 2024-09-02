/*
Onboarding Screen - Aesthetic introduction to the app
*/

//-------------------------------- Imports ----------------------------------------------

import React, { useState, useRef } from 'react';
import { View, FlatList, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { styles } from '../components/styles';
import OnboardingItem from '../components/OnboardingItem';
import slides from '../components/slides'
import Paginator from '../components/Paginator';
import NextButton from '../components/NextButton';

//-------------------------------- Main -------------------------------------------------

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const navigation = useNavigation();

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if(currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1});
    } else {
      navigation.navigate('LoginScreen');
    }
  };

  //------------------------------ Components -------------------------------------------

  return (
    <View style={[styles.onboardingContainer]}>

      <View style={{ flex: 3, backgroundColor: '#fff' }}>

      <FlatList 
        data={slides} 
        renderItem={({ item }) => <OnboardingItem item={item}/>} 
        horizontal 
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: {x: scrollX }}}], {
            useNativeDriver: false,
        })}
        scrollEventThrottle={32}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      </View>

      <Paginator data={slides} scrollX={scrollX} />

      <NextButton scrollTo={scrollTo} percentage={(currentIndex+1) * (100 / slides.length)} />

    </View>
  );
};

export default OnboardingScreen;
