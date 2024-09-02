/*
Lock (parking) button on DeviceDataScreen
*/

//-------------------------------- Imports ----------------------------------------------

import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';

import { styles } from './styles';
import { getLockStatus, updateLockStatus } from '../context/requests';

//-------------------------------- Main -------------------------------------------------

const LockButton = ({ deviceID }) => {
  const [isLocked, setIsLocked] = useState(null);

  // Translate lock status to icon
  const lockStatusIcon = {
    0: 'lock-open',
    1: 'lock'
  };

  // Flip lock status
  const opposite = {
    0: 1,
    1: 0
  };

  // Flip status then get status from server
  async function toggleLock() {
    await updateLockStatus(deviceID, opposite[isLocked]);
    const newStatus = await getLockStatus(deviceID);
    setIsLocked(await newStatus);
  };

  // Set initial state to server state (async)
  useEffect(() => {
    const fetchLockStatus = async () => {
      try {
        const status = await getLockStatus();
        setIsLocked(status);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchLockStatus();
  }, []);

  // Function to update lock status every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const status = await getLockStatus(deviceID, isLocked);
    }, 5000); // Polling rate

    return () => clearInterval(interval);
  }, [isLocked]);  

  //------------------------------ Components -------------------------------------------

  return (
    <TouchableOpacity style={[styles.button, {marginVertical: 0}]} onPress={toggleLock}>
      <Icon name={lockStatusIcon[isLocked]} color='#FFFFFF'/>
    </TouchableOpacity>
  );
};

export default LockButton;
