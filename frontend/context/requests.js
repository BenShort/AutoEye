/*
Library for making HTTP requests to the server.
*/

//-------------------------------- Imports ----------------------------------------------

import { auth } from './firebase';

//-------------------------------- Constants --------------------------------------------

const url = 'http://ec2-34-227-228-95.compute-1.amazonaws.com:8081/';

//-------------------------------- Email ------------------------------------------------

// Get user email from auth
function getEmail() {
  const user = auth.currentUser;
  if (user != null) {
    return user['email'];
  }
  else {
    throw new Error('No user for request'); 
  }
}

//-------------------------------- HTTP requests ----------------------------------------

// GET request
const getRequest = async (params) => {
  try {
    const response = await fetch(url+params, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();
    return json;
  }
  catch (error) {
    console.error('Error making GET request:', error);
    throw error;
  }
};

// PUT request
const putRequest = async (params) => {
  try {
    const response = await fetch(url+params, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const json = await response.json();
    return json;
  }
  catch (error) {
    console.error('Error making PUT request:', error);
    throw error;
  }
};

//-------------------------------- Endpoint-specific requests----------------------------

// Get all devices (MAC) of a user
export const getDevices = async () => {
  const userID = getEmail();
  const devices = await getRequest(`UserDevices/List?User=${userID}`);
  return devices;
};

// Add new device
export const addDevice = async (device, name) => {
  const userID = getEmail();
  const response = await putRequest(`UserDevices/Add?User=${userID}&DeviceID=${device}&DeviceName=${name}`);
  return response;
};

// Get lock status
export const getLockStatus = async (device) => {
  const status = await getRequest(`ParkState/Get?DeviceID=${device}`);
  return status;
};

// Update lock status
export const updateLockStatus = async (device, state) => {
  const response = await putRequest(`ParkState/Modify?DeviceID=${device}&State=${state}`);
  return response;
};

// Get GPS with polling
export const getGPS = async (device) => {
  const GPS = await getRequest(`GPS/GetLatestData?DeviceID=${device}`);
  return GPS;
};

// Get temperature with polling
export const getTemperature = async (device) => {
  const temperature = getRequest(`Temperature/GetLatestData?DeviceID=${device}`);
  return temperature;
};

// Get air quality with polling
export const getAirQuality = async (device) => {
  const airQuality = getRequest(`AirQuality/GetLatestData?DeviceID=${device}`);
  return airQuality;
};

// Get temperature data for past 5 minutes
export const getTempData = async (device) => {
  const currentTimeStamp = Math.floor(new Date().getTime() / 1000);
  const twelveHoursAgo = Math.floor(new Date().getTime() / 1000 - 5 * 60);
  const data = await getRequest(`Temperature/GetHistoricalData?DeviceID=${device}&StartTime=${twelveHoursAgo}&EndTime=${currentTimeStamp}`);
  return data;
}

// Add notification for user
export const addNotifications = async (tokenID) => {
  const userID = getEmail();
  const response = await putRequest(`Notifications/AddToken?User=${userID}&Token=${tokenID}`);
  return response
}
