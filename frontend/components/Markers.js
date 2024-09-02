/*
Library to retrieve markers from the server on HomeScreen
*/

//-------------------------------- Imports ----------------------------------------------

import { 
  getDevices,
  getGPS,
  getTemperature,
  getAirQuality,
  getTempData,
} from '../context/requests'

//-------------------------------- Main -------------------------------------------------

// Make marker for each device
export const getMarker = async (device) => {
  const deviceID = device[0];
  const deviceName = device[1];

  const GPS = await getGPS(deviceID);
  const temperature = await getTemperature(deviceID);
  const airQuality = await getAirQuality(deviceID);
  const tempData = await getTempData(deviceID);
  
  // Default marker data for error handling (if device is registered but no data is available)
  const deviceData = {
    id: deviceID,
    name: deviceName,
    pinColor: 'purple',
  };
  var GPS_obj = {
    latitude: -1,
    longitude: -1,
  };
  var temperature_obj = {
    freezing: -1,
    temperature: -1,
  };
  var airQuality_obj = {
    CO2: -1,
    CO2_above_threshold: -1,
    tvoc: -1,
    tvoc_thresh: -1,
  };
  var tempData_obj = {
    tempX: [1, 2, 3],
    tempY: [-1, -1, -1],
  }

  // Update marker data if available
  if (GPS.length != 0 && GPS[0]['Data'] != "{}"){
    GPS_obj = {
      latitude: parseFloat(JSON.parse(GPS[0]['Data'])['latitude']),
      longitude: parseFloat(JSON.parse(GPS[0]['Data'])['longitude']),
    };
  }

  if (temperature.length != 0) {
    temperature_obj = {
      freezing: (JSON.parse(temperature[0]['Data'])['freezing']).toString(),
      temperature: parseFloat(JSON.parse(temperature[0]['Data'])['temperature']).toFixed(2),
    };
  }

  if (airQuality.length != 0 && JSON.parse(airQuality[0]['Data'])['tvoc'] != null){
    airQuality_obj = {
      CO2: (JSON.parse(airQuality[0]['Data'])['c02']),
      CO2_above_threshold: (JSON.parse(airQuality[0]['Data'])['c02_above_threshold']).toString(),
      tvoc: (JSON.parse(airQuality[0]['Data'])['tvoc']).toFixed(2),
      tvoc_thresh: (JSON.parse(airQuality[0]['Data'])['tvoc_thresh']).toString(),
    };
  }

  if (tempData != [] && tempData.length != 0) {
    tempData.forEach((record) => {
      let parsedData = JSON.parse(record['Data']);
      tempData_obj.tempX.push(record.TimeStamp);
      tempData_obj.tempY.push(parsedData.temperature);
    });
  }

  // Join all data
  return Object.assign(deviceData, GPS_obj, temperature_obj, airQuality_obj, tempData_obj)
};

// Get marker for all user's devices
export const getAllMarkers = async () => {
  const devices = await getDevices();
  // Use getMarker to create a marker for each device
  const markers = await Promise.all(devices.map(getMarker));
  return markers;
};
