// SMS Monitor Service - Läser och bevakar SMS från 3315
// För Android med Expo Development Build

import { Platform, PermissionsAndroid } from 'react-native';
import * as SMS from 'expo-sms';
import * as Notifications from 'expo-notifications';
import { parseSMS, isAlarmSMS, SMS_SENDER } from '../utils/smsParser';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Intervall för SMS-polling (i millisekunder)
const SMS_CHECK_INTERVAL = 5000; // 5 sekunder

class SMSMonitorService {
  constructor() {
    this.isMonitoring = false;
    this.intervalId = null;
    this.lastCheckedTimestamp = Date.now();
    this.onAlarmCallback = null;
    this.onlyTotalAlarm = false;
    this.testMode = false;
  }

  /**
   * Starta SMS-övervakning
   */
  async start(onAlarmCallback, options = {}) {
    if (this.isMonitoring) {
      console.log('SMS-övervakning körs redan');
      return;
    }

    this.onAlarmCallback = onAlarmCallback;
    this.onlyTotalAlarm = options.onlyTotalAlarm || false;
    this.testMode = options.testMode || false;

    // För Android
    if (Platform.OS === 'android') {
      const hasPermission = await this.requestSMSPermission();
      if (!hasPermission) {
        throw new Error('SMS-tillåtelse nekad');
      }
    }

    // Ladda senaste kontrollerade tidsstämpel
    const stored = await AsyncStorage.getItem('lastSMSCheck');
    if (stored) {
      this.lastCheckedTimestamp = parseInt(stored, 10);
    }

    this.isMonitoring = true;

    // Starta övervaknings-loop
    this.startPolling();

    console.log('SMS-övervakning startad', {
      onlyTotalAlarm: this.onlyTotalAlarm,
      testMode: this.testMode
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚨 SMS-övervakning AKTIV",
        body: this.testMode
          ? 'Testläge - övervakar ALLA SMS'
          : `Övervakar ${this.onlyTotalAlarm ? 'endast TOTALLARM' : 'alla larm'} från ${SMS_SENDER}`,
        sound: false,
        priority: 'high',
      },
      trigger: null,
    });
  }

  /**
   * Stoppa SMS-övervakning
   */
  async stop() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('SMS-övervakning stoppad');

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏸️ SMS-övervakning STOPPAD",
        body: 'Övervakning av SMS är pausad',
        sound: false,
      },
      trigger: null,
    });
  }

  /**
   * Starta polling-loop
   * OBS: I en riktig implementation skulle detta vara en native broadcast receiver
   */
  startPolling() {
    this.intervalId = setInterval(async () => {
      await this.checkForNewSMS();
    }, SMS_CHECK_INTERVAL);
  }

  /**
   * Kontrollera efter nya SMS
   * OBS: Detta är en workaround. Riktiga Android-appar använder BroadcastReceiver
   */
  async checkForNewSMS() {
    try {
      // I testläge, simulera SMS-kontroll
      if (this.testMode) {
        // Testläget simuleras via App.js
        return;
      }

      // För riktig implementation skulle vi här:
      // 1. Läsa SMS-databasen via native module
      // 2. Filtrera meddelanden efter lastCheckedTimestamp
      // 3. Parsea nya meddelanden från 3315

      // Eftersom Expo inte har direkt åtkomst till SMS-innehåll,
      // behöver vi en native module. Se SETUP_GUIDE.md för detaljer.

      console.log('SMS-kontroll körs... (Native module krävs för riktig implementation)');

    } catch (error) {
      console.error('Fel vid SMS-kontroll:', error);
    }
  }

  /**
   * Hantera inkommande SMS (anropas från native eller test)
   */
  async handleIncomingSMS(message, sender, timestamp) {
    try {
      console.log('Hanterar SMS från:', sender);

      // Spara tidsstämpel
      if (timestamp && timestamp > this.lastCheckedTimestamp) {
        this.lastCheckedTimestamp = timestamp;
        await AsyncStorage.setItem('lastSMSCheck', timestamp.toString());
      }

      // Testläge - kolla alla SMS för ordet "larm"
      if (this.testMode) {
        if (message.toUpperCase().includes('LARM')) {
          await this.triggerAlarm({
            sender,
            message,
            category: 'TEST-LARM',
            isTotalAlarm: false,
            timestamp: timestamp || Date.now(),
            testMode: true
          });
        }
        return;
      }

      // Kontrollera om det är ett larm från 3315
      if (!isAlarmSMS(message, sender)) {
        return;
      }

      // Parsea SMS
      const parsedAlarm = parseSMS(message, sender);

      if (!parsedAlarm) {
        console.warn('Kunde inte parsea larm:', message);
        return;
      }

      // Filtrera baserat på inställningar
      if (this.onlyTotalAlarm && !parsedAlarm.isTotalAlarm) {
        console.log('Hoppar över icke-totallarm:', parsedAlarm.category);
        return;
      }

      // Trigga larm!
      await this.triggerAlarm(parsedAlarm);

    } catch (error) {
      console.error('Fel vid hantering av SMS:', error);
    }
  }

  /**
   * Trigga larm
   */
  async triggerAlarm(alarmData) {
    console.log('🚨 LARM TRIGGAT:', alarmData);

    if (this.onAlarmCallback) {
      this.onAlarmCallback(alarmData);
    }

    // Skicka notifikation
    await Notifications.scheduleNotificationAsync({
      content: {
        title: alarmData.isTotalAlarm ? "🚨🚨 TOTALLARM! 🚨🚨" : "🚨 UTRYCKNING!",
        body: alarmData.category || 'Larm från brandkåren',
        sound: true,
        priority: 'max',
        sticky: true,
      },
      trigger: null,
    });
  }

  /**
   * Begär SMS-tillåtelse (Android)
   */
  async requestSMSPermission() {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      // Kontrollera om SMS är tillgängligt
      const smsAvailable = await SMS.isAvailableAsync();

      if (!smsAvailable) {
        console.warn('SMS inte tillgängligt på denna enhet');
        return false;
      }

      // För Android API 23+ behöver vi begära runtime permissions
      // Detta kräver en native module för RECEIVE_SMS och READ_SMS
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      ]);

      return (
        granted['android.permission.RECEIVE_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.error('SMS permission error:', error);
      return false;
    }
  }

  /**
   * Uppdatera inställningar
   */
  updateSettings(options) {
    if (options.hasOwnProperty('onlyTotalAlarm')) {
      this.onlyTotalAlarm = options.onlyTotalAlarm;
      console.log('Uppdaterad: onlyTotalAlarm =', this.onlyTotalAlarm);
    }

    if (options.hasOwnProperty('testMode')) {
      this.testMode = options.testMode;
      console.log('Uppdaterad: testMode =', this.testMode);
    }
  }

  /**
   * Testa SMS-parser
   */
  testParsing() {
    const testMessage = `Larminformation från VRR Ledningscentral
LARM Mölnlycke RIB
TOTALLARM - Fri inryckning
TID : 2025-10-28 14:30:15.123`;

    console.log('Test-meddelande:', testMessage);
    const parsed = parseSMS(testMessage, '3315');
    console.log('Parseat resultat:', parsed);

    return parsed;
  }

  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      onlyTotalAlarm: this.onlyTotalAlarm,
      testMode: this.testMode,
      lastChecked: new Date(this.lastCheckedTimestamp).toLocaleString('sv-SE')
    };
  }
}

// Singleton instance
export const smsMonitor = new SMSMonitorService();

export default smsMonitor;
