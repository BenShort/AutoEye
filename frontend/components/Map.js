/*
Interactive google maps on HomeScreen
*/

//-------------------------------- Imports ----------------------------------------------

import React, { useEffect, useState } from "react";
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import * as Location from 'expo-location';

import { styles } from './styles';

//-------------------------------- Main -------------------------------------------------

const Map = ({ markers, selectedLocation, setSelectedLocation }) => {
  const navigation = useNavigation();
  const [status, requestPermission] = Location.useForegroundPermissions(); // Request location permission
  
  // Run whenever selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      // Move the map to the selected location
      this.mapView.animateToRegion({  
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
      
      // Close all callouts
      closeAllCallouts();
      const markerIndex = markers.findIndex(marker => marker.id === selectedLocation.id);

      // Delay the opening of the callout
      setTimeout(() => {
        openCallout(markerIndex);
      }, 1000);
    }
  }, [selectedLocation]);

  const [markerRefs, setMarkerRefs] = useState([]);
  // Close all callouts
  const closeAllCallouts = () => {
    markerRefs.forEach(ref => {
      if (ref) {
        ref.hideCallout();
      }
    });
  };

  const openCallout = (index) => {
    // Close all callouts first
    closeAllCallouts();
  
    // Open the specific callout
    if (markerRefs[index]) {
      markerRefs[index].showCallout();
    }
  };

  //------------------------------ Components -------------------------------------------

  return (
    <MapView
      ref = {(ref)=>this.mapView=ref}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: 51.49898034409697,
        longitude: -0.1761751427051167,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      showsUserLocation
      showsMyLocationButton
      onMapReady={requestPermission} // Show user location on android (https://github.com/react-native-maps/react-native-maps/issues/2747)
    >
      {markers.map((marker, index) => (
        
        <Marker
          ref={ref => {
            markerRefs[index] = ref;
            setMarkerRefs(markerRefs);
          }}
          key={index}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.name}
          description={marker.id}
          pinColor={marker.pinColor}
          onPress={() => setSelectedLocation(marker)}
        >

          <Callout onPress={() => navigation.navigate('DeviceDataScreen', { marker })}>
            <Text style={styles.title}>{marker.name}</Text>
            <Text>{marker.id}</Text>
          </Callout>

        </Marker>
      ))}

    </MapView>
  );
};

export default Map;
