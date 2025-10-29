import React, { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as SMS from 'expo-sms';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_SMS_TASK = 'background-sms-task';

// Registrera bakgrundsuppgift
TaskManager.defineTask(BACKGROUND_SMS_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Bakgrundsuppgift fel:', error);
    return;
  }
  
  // Här skulle vi normalt läsa SMS, men det kräver native kod
  // För Expo Go använder vi notifications istället
  return;
});

export const SMSMonitor = ({ 
  isMonitoring, 
  triggerWords, 
  triggerNumbers,
  onSMSReceived,
  onAlarmTrigger 
}) => {
  
  useEffect(() => {
    if (Platform.OS === 'android') {
      setupAndroidSMSMonitoring();
    } else {
      setupIOSMonitoring();
    }
  }, [isMonitoring]);

  const setupAndroidSMSMonitoring = async () => {
    if (isMonitoring) {
      // För Android med Expo Go är vi begränsade
      // I en riktig app skulle vi använda native modules här
      console.log('Android SMS-övervakning aktiverad (simulerad)');
      
      // Visa notifikation att övervakning är aktiv
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "SMS-övervakning aktiv",
          body: "Appen övervakar nu inkommande SMS för larmord",
          sound: false,
        },
        trigger: null,
      });
    }
  };

  const setupIOSMonitoring = async () => {
    if (isMonitoring) {
      console.log('iOS övervakning - endast avsändarnummer kan läsas');
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "SMS-övervakning aktiv (iOS)",
          body: "Övervakar avsändarnummer för larm",
          sound: false,
        },
        trigger: null,
      });
    }
  };

  // Funktion för att kontrollera om SMS är tillgängligt
  const checkSMSAvailability = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        'SMS ej tillgängligt',
        'SMS-funktionalitet är inte tillgänglig på denna enhet'
      );
    }
    return isAvailable;
  };

  // Simulerad SMS-kontroll (för utveckling med Expo Go)
  const simulateSMSCheck = (message, sender) => {
    if (!isMonitoring) return false;

    const words = triggerWords.split(',').map(w => w.trim().toUpperCase());
    const numbers = triggerNumbers.split(',').map(n => n.trim());
    
    const messageUpper = message.toUpperCase();
    const triggerFound = words.some(word => messageUpper.includes(word));
    const numberMatch = numbers.some(num => sender.includes(num));

    if (triggerFound || numberMatch) {
      onAlarmTrigger && onAlarmTrigger();
      return true;
    }
    return false;
  };

  return {
    checkSMSAvailability,
    simulateSMSCheck
  };
};

export default SMSMonitor;
