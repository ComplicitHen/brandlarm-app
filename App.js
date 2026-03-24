import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  Switch,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Vibration,
  Modal,
  TimePickerAndroid,
  Linking,
  ActivityIndicator,
  NativeModules,
  NativeEventEmitter
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as IntentLauncher from 'expo-intent-launcher';

// Firebase services
import {
  initializeFirebase,
  signInAnonymous,
  publishAlarm,
  subscribeToAlarms,
  getCurrentUser,
  onAuthChange,
  isFirebaseReady
} from './services/firebaseService';

// SMS services
import smsMonitor from './services/smsMonitorService';
import { parseSMS, testParser } from './utils/smsParser';

// Components
import AlarmHistoryModal from './components/AlarmHistoryModal';
import SoundPicker, { BUILTIN_ALARM_SOUNDS } from './components/SoundPicker';

// Native SMS Module
const { SmsModule } = NativeModules;
const smsEventEmitter = SmsModule ? new NativeEventEmitter(SmsModule) : null;

// Konfigurera notifications för att gå igenom tystläge
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: 'max',
  }),
});

// Ljudalternativ (för bakåtkompatibilitet)
const ALARM_SOUNDS = BUILTIN_ALARM_SOUNDS;

export default function App() {
  // State för huvudfunktioner
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [onlyTotalAlarm, setOnlyTotalAlarm] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [sound, setSound] = useState(null);
  const [lastSMS, setLastSMS] = useState('Ingen SMS läst än');
  const [deviceMode, setDeviceMode] = useState('passive'); // 'active' eller 'passive'

  // State för ljudinställningar
  const [selectedSound, setSelectedSound] = useState('standard');
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [alarmVolume, setAlarmVolume] = useState('1.0');
  const [loopSound, setLoopSound] = useState(true);
  const [customSoundUri, setCustomSoundUri] = useState(null);
  const [customSoundName, setCustomSoundName] = useState(null);

  // State för tidsschema
  const [useTimeSchedule, setUseTimeSchedule] = useState(false);
  const [startTime, setStartTime] = useState({ hour: 0, minute: 0 });
  const [endTime, setEndTime] = useState({ hour: 23, minute: 59 });
  const [showTimeSettings, setShowTimeSettings] = useState(false);

  // State för användarprofil
  const [userName, setUserName] = useState('');
  const [serviceNumber, setServiceNumber] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // State för permissions
  const [permissions, setPermissions] = useState({
    sms: { granted: false, checked: false },
    notifications: { granted: false, checked: false },
    battery: { granted: false, checked: false },
  });

  // Firebase state
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [recentAlarms, setRecentAlarms] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Initialisera Firebase och ladda inställningar
  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    // Konfigurera audio
    await configureAudio();

    // Ladda sparade inställningar
    await loadSettings();

    // Initialisera Firebase
    const initialized = initializeFirebase();
    setFirebaseInitialized(initialized);

    if (initialized) {
      // Autentisera användare
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          const anonymousUser = await signInAnonymous();
          setUser(anonymousUser);
          console.log('Inloggad anonymt:', anonymousUser.uid);
        } else {
          setUser(currentUser);
        }

        // Lyssna på autentiseringsändringar
        onAuthChange((user) => {
          setUser(user);
          console.log('Auth ändring:', user?.uid);
        });

        // Prenumerera på larm från Firebase
        const unsubscribe = subscribeToAlarms((alarms) => {
          setRecentAlarms(alarms.slice(0, 5)); // Visa senaste 5
          console.log('Mottog', alarms.length, 'larm från Firebase');
        }, 10);

        return () => unsubscribe();
      } catch (error) {
        console.error('Firebase auth-fel:', error);
      }
    } else {
      console.warn('Kör i offline-läge utan Firebase');
    }

    // Lyssna på native SMS-events (endast i active mode)
    if (Platform.OS === 'android' && smsEventEmitter) {
      const smsSubscription = smsEventEmitter.addListener('onSMSReceived', handleNativeSMS);
      console.log('Native SMS-lyssnare aktiverad');

      // Cleanup-funktion
      return () => {
        smsSubscription.remove();
      };
    }
  };

  const loadSettings = async () => {
    try {
      const savedName = await AsyncStorage.getItem('userName');
      const savedNumber = await AsyncStorage.getItem('serviceNumber');
      const savedOnlyTotal = await AsyncStorage.getItem('onlyTotalAlarm');
      const savedFirstTime = await AsyncStorage.getItem('isFirstTime');
      const savedSound = await AsyncStorage.getItem('selectedSound');
      const savedVolume = await AsyncStorage.getItem('alarmVolume');
      const savedLoop = await AsyncStorage.getItem('loopSound');
      const savedTimeSchedule = await AsyncStorage.getItem('useTimeSchedule');
      const savedStartTime = await AsyncStorage.getItem('startTime');
      const savedEndTime = await AsyncStorage.getItem('endTime');
      const savedPermissions = await AsyncStorage.getItem('permissions');
      const savedCustomSoundUri = await AsyncStorage.getItem('customSoundUri');
      const savedCustomSoundName = await AsyncStorage.getItem('customSoundName');
      const savedDeviceMode = await AsyncStorage.getItem('deviceMode');

      if (savedName) setUserName(savedName);
      if (savedNumber) setServiceNumber(savedNumber);
      if (savedOnlyTotal) setOnlyTotalAlarm(savedOnlyTotal === 'true');
      if (savedSound) setSelectedSound(savedSound);
      if (savedVolume) setAlarmVolume(savedVolume);
      if (savedLoop) setLoopSound(savedLoop === 'true');
      if (savedTimeSchedule) setUseTimeSchedule(savedTimeSchedule === 'true');
      if (savedStartTime) setStartTime(JSON.parse(savedStartTime));
      if (savedEndTime) setEndTime(JSON.parse(savedEndTime));
      if (savedPermissions) setPermissions(JSON.parse(savedPermissions));
      if (savedCustomSoundUri) setCustomSoundUri(savedCustomSoundUri);
      if (savedCustomSoundName) setCustomSoundName(savedCustomSoundName);
      if (savedDeviceMode) setDeviceMode(savedDeviceMode);
      if (savedFirstTime === 'false') {
        setIsFirstTime(false);
        setShowOnboarding(false);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const configureAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: false,
        staysActiveInBackground: true,
      });
    } catch (error) {
      console.log('Audio setup error:', error);
    }
  };

  // Permission-hantering
  const requestSMSPermission = async () => {
    try {
      if (Platform.OS === 'android' && SmsModule) {
        // Använd native modulen för att kolla/begära SMS-permissions
        const hasPermission = await SmsModule.hasSMSPermission();

        const newPermissions = { ...permissions };
        newPermissions.sms = { granted: hasPermission, checked: true };
        setPermissions(newPermissions);
        await AsyncStorage.setItem('permissions', JSON.stringify(newPermissions));

        if (!hasPermission) {
          Alert.alert(
            'SMS Permission',
            'SMS-läsning behövs för att automatiskt läsa larm från 3315. Du behöver aktivera detta i telefonens inställningar.',
            [
              { text: 'OK' },
              { text: 'Öppna inställningar', onPress: () => Linking.openSettings() }
            ]
          );
        }
        return hasPermission;
      }
      return true;
    } catch (error) {
      console.log('SMS permission error:', error);
      return false;
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const newPermissions = { ...permissions };
      newPermissions.notifications = { granted: finalStatus === 'granted', checked: true };
      setPermissions(newPermissions);
      await AsyncStorage.setItem('permissions', JSON.stringify(newPermissions));

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notifikationer',
          'Vi behöver tillåtelse för att visa larmnotifikationer när appen är i bakgrunden.'
        );
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.log('Notification permission error:', error);
      return false;
    }
  };

  const requestBatteryOptimization = async () => {
    try {
      if (Platform.OS === 'android') {
        const packageName = 'com.brandkaren.larmapp';
        try {
          // Öppnar direkt dialog för ATT ignorera batterioptimering för denna app
          await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
            { data: `package:${packageName}` }
          );
          // Sätts som granted efter att dialogen stängts (oavsett val)
          const newPermissions = { ...permissions };
          newPermissions.battery = { granted: true, checked: true };
          setPermissions(newPermissions);
          await AsyncStorage.setItem('permissions', JSON.stringify(newPermissions));
        } catch (error) {
          console.log('Direkt intent misslyckades, öppnar lista:', error);
          // Fallback: öppna listan med alla appar
          try {
            await IntentLauncher.startActivityAsync(
              IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
            );
          } catch (e) {
            Linking.openSettings();
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Battery optimization error:', error);
      return false;
    }
  };

  // Onboarding
  const completeOnboarding = async () => {
    if (!userName.trim()) {
      Alert.alert('Namn krävs', 'Vänligen ange ditt namn');
      return;
    }

    await saveOnboardingData();
  };

  const saveOnboardingData = async () => {
    try {
      await AsyncStorage.setItem('userName', userName);
      await AsyncStorage.setItem('serviceNumber', serviceNumber);
      await AsyncStorage.setItem('isFirstTime', 'false');
      setIsFirstTime(false);
      setShowOnboarding(false);
      Alert.alert('Välkommen!', `Hej ${userName}! Kontrollera nu dina tillåtelser för bästa upplevelse.`);
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  // Tidsschema-funktioner
  const isWithinSchedule = () => {
    if (!useTimeSchedule) return true;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const start = startTime.hour * 60 + startTime.minute;
    const end = endTime.hour * 60 + endTime.minute;

    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Hanterar övergång över midnatt
      return currentTime >= start || currentTime <= end;
    }
  };

  const showTimePicker = async (isStart) => {
    if (Platform.OS === 'android') {
      try {
        const currentTime = isStart ? startTime : endTime;
        const { action, hour, minute } = await TimePickerAndroid.open({
          hour: currentTime.hour,
          minute: currentTime.minute,
          is24Hour: true,
        });

        if (action !== TimePickerAndroid.dismissedAction) {
          if (isStart) {
            setStartTime({ hour, minute });
            await AsyncStorage.setItem('startTime', JSON.stringify({ hour, minute }));
          } else {
            setEndTime({ hour, minute });
            await AsyncStorage.setItem('endTime', JSON.stringify({ hour, minute }));
          }
        }
      } catch (error) {
        console.log('Time picker error:', error);
      }
    }
  };

  const saveTimeSettings = async () => {
    try {
      await AsyncStorage.setItem('useTimeSchedule', useTimeSchedule.toString());
      await AsyncStorage.setItem('startTime', JSON.stringify(startTime));
      await AsyncStorage.setItem('endTime', JSON.stringify(endTime));
      setShowTimeSettings(false);
      Alert.alert('Sparat!', 'Tidschemat har uppdaterats');
    } catch (error) {
      console.log('Error saving time settings:', error);
    }
  };

  // Ljudinställningar
  const saveSoundSettings = async () => {
    try {
      await AsyncStorage.setItem('selectedSound', selectedSound);
      await AsyncStorage.setItem('alarmVolume', alarmVolume);
      await AsyncStorage.setItem('loopSound', loopSound.toString());
      setShowSoundSettings(false);
      Alert.alert('Sparat!', 'Ljudinställningar har uppdaterats');
    } catch (error) {
      console.log('Error saving sound settings:', error);
    }
  };

  const testSelectedSound = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: testSound } = await Audio.Sound.createAsync(
        ALARM_SOUNDS[selectedSound].file,
        {
          isLooping: false,
          volume: parseFloat(alarmVolume),
          shouldPlay: true,
        }
      );

      setSound(testSound);

      setTimeout(async () => {
        await testSound.stopAsync();
        await testSound.unloadAsync();
        setSound(null);
      }, 2000);

    } catch (error) {
      console.log('Test sound error:', error);
    }
  };

  // Huvudfunktioner - SMS-övervakning
  const toggleMonitoring = async () => {
    if (!isMonitoring) {
      // Starta övervakning
      try {
        await smsMonitor.start(handleAlarmTriggered, {
          onlyTotalAlarm,
          testMode
        });
        setIsMonitoring(true);

        let message = testMode
          ? 'Testläge aktivt - övervakar ALLA SMS för ordet "larm"'
          : onlyTotalAlarm
          ? 'Övervakar endast TOTALLARM från 3315'
          : 'Övervakar ALLA larm från 3315';

        if (useTimeSchedule) {
          message += `\n⏰ Aktivt: ${startTime.hour.toString().padStart(2, '0')}:${startTime.minute.toString().padStart(2, '0')} - ${endTime.hour.toString().padStart(2, '0')}:${endTime.minute.toString().padStart(2, '0')}`;
        }

        Alert.alert('Övervakning startad', message);
      } catch (error) {
        Alert.alert('Fel', 'Kunde inte starta övervakning: ' + error.message);
      }
    } else {
      // Stoppa övervakning
      await smsMonitor.stop();
      setIsMonitoring(false);
      Alert.alert('Övervakning stoppad', 'SMS-övervakning är pausad');
    }
  };

  const toggleOnlyTotal = async () => {
    const newValue = !onlyTotalAlarm;
    setOnlyTotalAlarm(newValue);
    await AsyncStorage.setItem('onlyTotalAlarm', newValue.toString());

    // Uppdatera SMS monitor om den kör
    if (isMonitoring) {
      smsMonitor.updateSettings({ onlyTotalAlarm: newValue });
    }

    Alert.alert(
      newValue ? 'Endast TOTALLARM' : 'Alla larm',
      newValue
        ? 'Appen larmar nu endast för TOTALLARM'
        : 'Appen larmar för ALLA typer av larm från 3315'
    );
  };

  // Hantera larm från SMS Monitor
  const handleAlarmTriggered = async (alarmData) => {
    console.log('🚨 Larm mottaget:', alarmData);

    // Kontrollera tidsschema
    if (!isWithinSchedule()) {
      console.log('Larm blockerat - utanför schemat');
      return;
    }

    setLastSMS(alarmData.rawMessage || alarmData.category);

    // Spela alarm-ljud
    await playAlarmSound(alarmData);

    // Publicera till Firebase om möjligt
    if (firebaseInitialized && user) {
      try {
        await publishAlarm(alarmData);
        console.log('Larm publicerat till Firebase');
      } catch (error) {
        console.error('Kunde inte publicera larm till Firebase:', error);
      }
    }
  };

  // Hantera SMS från native BroadcastReceiver
  const handleNativeSMS = async (event) => {
    console.log('📱 Native SMS mottaget:', event);

    // Endast i active mode
    if (deviceMode !== 'active') {
      console.log('Ignorerar SMS - enhet är i passivt läge');
      return;
    }

    const { sender, message, timestamp } = event;

    // Parsea SMS-meddelandet
    const alarmData = parseSMS(message, sender);

    if (!alarmData) {
      console.log('Kunde inte parsea SMS:', message);
      return;
    }

    // Kontrollera om vi bara vill ha totallarm
    if (onlyTotalAlarm && !alarmData.isTotalAlarm) {
      console.log('Ignorerar - endast totallarm är aktiverat');
      return;
    }

    console.log('✅ SMS parseat:', alarmData);

    // Hantera larmet (spela ljud, skicka till Firebase)
    await handleAlarmTriggered(alarmData);
  };

  const playAlarmSound = async (alarmData) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // Använd custom sound om det finns, annars inbyggt ljud
      const soundSource = customSoundUri
        ? { uri: customSoundUri }
        : ALARM_SOUNDS[selectedSound].file;

      const { sound: newSound } = await Audio.Sound.createAsync(
        soundSource,
        {
          isLooping: loopSound,
          volume: parseFloat(alarmVolume),
          shouldPlay: true,
        }
      );

      setSound(newSound);
      setAlarmActive(true);

      if (Platform.OS === 'android') {
        Vibration.vibrate([1000, 2000, 1000, 2000], true);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: alarmData.isTotalAlarm ? "🚨🚨 TOTALLARM! 🚨🚨" : "🚨 UTRYCKNING!",
          body: alarmData.category || "Larm detekterat!",
          sound: true,
          priority: 'max',
          sticky: true,
        },
        trigger: null,
      });

    } catch (error) {
      console.log('Sound error:', error);
      setAlarmActive(true);
    }
  };

  const stopAlarm = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      Vibration.cancel();
      setAlarmActive(false);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "✅ Larm avstängt",
          body: `${userName} har bekräftat larmet`,
          sound: false,
        },
        trigger: null,
      });

    } catch (error) {
      console.log('Stop alarm error:', error);
      setAlarmActive(false);
    }
  };

  // Simulera SMS för testning
  const simulateSMS = () => {
    const testMessages = testMode
      ? ["Test: LARM från random nummer", "Test: Inget larmord här", "Test: BRAND och LARM test"]
      : onlyTotalAlarm
        ? [
          `Larminformation från VRR Ledningscentral\nLARM Mölnlycke RIB\nTOTALLARM - Fri inryckning\nTID : ${new Date().toISOString().replace('T', ' ').substring(0, 23)}`,
          `Larminformation från VRR Ledningscentral\nLARM Mölnlycke RIB\nLarmkategori namn : Brand i byggnad\nTID : ${new Date().toISOString().replace('T', ' ').substring(0, 23)}`
        ]
        : [
          `Larminformation från VRR Ledningscentral\nLARM Mölnlycke RIB\nTOTALLARM - Fri inryckning\nTID : ${new Date().toISOString().replace('T', ' ').substring(0, 23)}`,
          `Larminformation från VRR Ledningscentral\nLARM Mölnlycke RIB\nLarmkategori namn : Brand i byggnad\nTID : ${new Date().toISOString().replace('T', ' ').substring(0, 23)}`
        ];

    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    const sender = testMode ? "+46701234567" : "3315";

    // Simulera SMS-mottagning
    smsMonitor.handleIncomingSMS(randomMessage, sender, Date.now());
  };

  // Modaler
  const TimeSettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showTimeSettings}
      onRequestClose={() => setShowTimeSettings(false)}
    >
      <ScrollView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>⏰ Tidsschema för larm</Text>

          <View style={styles.switchContainer}>
            <Text>Aktivera tidsschema:</Text>
            <Switch
              value={useTimeSchedule}
              onValueChange={setUseTimeSchedule}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>

          {useTimeSchedule && (
            <>
              <Text style={styles.helpText}>
                Larm kommer endast aktiveras inom angivet tidsintervall
              </Text>

              <View style={styles.timeSection}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => showTimePicker(true)}
                >
                  <Text style={styles.timeLabel}>Starttid:</Text>
                  <Text style={styles.timeValue}>
                    {startTime.hour.toString().padStart(2, '0')}:{startTime.minute.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => showTimePicker(false)}
                >
                  <Text style={styles.timeLabel}>Sluttid:</Text>
                  <Text style={styles.timeValue}>
                    {endTime.hour.toString().padStart(2, '0')}:{endTime.minute.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.infoText}>
                💡 Tips: För nattschema (ex. 22:00-06:00) fungerar övergång över midnatt automatiskt
              </Text>
            </>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={saveTimeSettings}
            >
              <Text style={styles.modalButtonText}>Spara</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowTimeSettings(false)}
            >
              <Text style={styles.modalButtonText}>Avbryt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );

  const SoundSettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showSoundSettings}
      onRequestClose={() => setShowSoundSettings(false)}
    >
      <ScrollView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>🔊 Ljudinställningar</Text>

          <SoundPicker
            selectedSound={selectedSound}
            customSoundUri={customSoundUri}
            customSoundName={customSoundName}
            onSoundSelected={(sound) => setSelectedSound(sound)}
            onCustomSoundSelected={(uri, name) => {
              setCustomSoundUri(uri);
              setCustomSoundName(name);
            }}
          />

          <View style={styles.volumeSection}>
            <Text style={styles.sectionTitle}>Volym:</Text>
            <View style={styles.volumeButtons}>
              <TouchableOpacity
                style={[styles.volumeButton, alarmVolume === '0.5' && styles.volumeSelected]}
                onPress={() => setAlarmVolume('0.5')}
              >
                <Text>🔈 50%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.volumeButton, alarmVolume === '0.75' && styles.volumeSelected]}
                onPress={() => setAlarmVolume('0.75')}
              >
                <Text>🔉 75%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.volumeButton, alarmVolume === '1.0' && styles.volumeSelected]}
                onPress={() => setAlarmVolume('1.0')}
              >
                <Text>🔊 100%</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text>Upprepa ljud tills avstängt:</Text>
            <Switch
              value={loopSound}
              onValueChange={setLoopSound}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={saveSoundSettings}
            >
              <Text style={styles.modalButtonText}>Spara</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowSoundSettings(false)}
            >
              <Text style={styles.modalButtonText}>Avbryt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );

  const OnboardingModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showOnboarding}
      onRequestClose={() => {}}
    >
      <ScrollView style={styles.onboardingContainer}>
        <View style={styles.onboardingContent}>
          <Text style={styles.onboardingTitle}>🚒 Välkommen till Brandkårens SMS-larm!</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ditt namn: *</Text>
            <TextInput
              style={styles.input}
              value={userName}
              onChangeText={setUserName}
              placeholder="Ex: Johan Andersson"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tjänstenummer (valfritt):</Text>
            <TextInput
              style={styles.input}
              value={serviceNumber}
              onChangeText={setServiceNumber}
              placeholder="Ex: 1234"
              keyboardType="numeric"
            />
          </View>

          {!isFirstTime && (
            <View style={styles.permissionsSection}>
              <Text style={styles.permissionsTitle}>Tillåtelser och inställningar:</Text>

              <View style={styles.permissionItem}>
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionName}>📱 SMS-läsning</Text>
                  <Text style={styles.permissionDesc}>För att läsa larm från 3315</Text>
                  <Text style={styles.permissionStatus}>
                    Status: {permissions.sms.granted ? '✅ Aktiverad' : permissions.sms.checked ? '❌ Nekad' : '⏳ Ej kontrollerad'}
                  </Text>
                </View>
                {!permissions.sms.granted && (
                  <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestSMSPermission}
                  >
                    <Text style={styles.permissionButtonText}>Aktivera</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.permissionItem}>
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionName}>🔔 Notifikationer</Text>
                  <Text style={styles.permissionDesc}>För att visa larm när appen är stängd</Text>
                  <Text style={styles.permissionStatus}>
                    Status: {permissions.notifications.granted ? '✅ Aktiverad' : permissions.notifications.checked ? '❌ Nekad' : '⏳ Ej kontrollerad'}
                  </Text>
                </View>
                {!permissions.notifications.granted && (
                  <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestNotificationPermission}
                  >
                    <Text style={styles.permissionButtonText}>Aktivera</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.permissionItem}>
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionName}>🔋 Batterioptimering</Text>
                  <Text style={styles.permissionDesc}>Inaktivera för att köra i bakgrunden</Text>
                  <Text style={styles.permissionStatus}>
                    Status: {permissions.battery.granted ? '✅ Inaktiverad' : '⚠️ Rekommenderas'}
                  </Text>
                </View>
                {!permissions.battery.granted && (
                  <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestBatteryOptimization}
                  >
                    <Text style={styles.permissionButtonText}>Konfigurera</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.onboardingButton}
            onPress={completeOnboarding}
          >
            <Text style={styles.onboardingButtonText}>
              {isFirstTime ? 'Fortsätt' : 'Spara ändringar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );

  // Huvudvy
  return (
    <ScrollView style={styles.container}>
      <OnboardingModal />
      <SoundSettingsModal />
      <TimeSettingsModal />
      <AlarmHistoryModal visible={showHistory} onClose={() => setShowHistory(false)} />

      <View style={styles.header}>
        <Text style={styles.title}>🚨 Brandkårens SMS-larm</Text>
        {userName ? (
          <Text style={styles.subtitle}>Brandman: {userName} {serviceNumber ? `(#${serviceNumber})` : ''}</Text>
        ) : null}
        <Text style={styles.statusText}>
          {isMonitoring ? '✅ Övervakning aktiv' : '⏸️ Övervakning pausad'}
        </Text>
        {firebaseInitialized && user && (
          <Text style={styles.firebaseStatus}>
            🔥 Firebase ansluten
          </Text>
        )}
        {useTimeSchedule && (
          <Text style={styles.scheduleStatus}>
            ⏰ Schema: {startTime.hour.toString().padStart(2, '0')}:{startTime.minute.toString().padStart(2, '0')} - {endTime.hour.toString().padStart(2, '0')}:{endTime.minute.toString().padStart(2, '0')}
            {isWithinSchedule() ? ' (Inom schema)' : ' (Utanför schema)'}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Enhetsläge</Text>

        <View style={styles.deviceModeContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              deviceMode === 'active' && styles.modeButtonActive
            ]}
            onPress={async () => {
              setDeviceMode('active');
              await AsyncStorage.setItem('deviceMode', 'active');
              Alert.alert(
                '🚨 Aktivt läge',
                'Denna enhet läser SMS från 3315 OCH tar emot larm från Firebase.\n\nPerfekt för larmstationer!'
              );
            }}
          >
            <Text style={[
              styles.modeButtonText,
              deviceMode === 'active' && styles.modeButtonTextActive
            ]}>
              🚨 Aktiv Larmstation
            </Text>
            <Text style={styles.modeButtonDesc}>
              Läser SMS + Firebase
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              deviceMode === 'passive' && styles.modeButtonActive
            ]}
            onPress={async () => {
              setDeviceMode('passive');
              await AsyncStorage.setItem('deviceMode', 'passive');
              Alert.alert(
                '📱 Passivt läge',
                'Denna enhet tar ENDAST emot larm från Firebase.\n\nPerfekt för personliga telefoner!'
              );
            }}
          >
            <Text style={[
              styles.modeButtonText,
              deviceMode === 'passive' && styles.modeButtonTextActive
            ]}>
              📱 Passiv Mottagare
            </Text>
            <Text style={styles.modeButtonDesc}>
              Endast Firebase
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helpText}>
          {deviceMode === 'active'
            ? '🚨 Aktiv: Läser SMS från 3315 och skickar till Firebase. Andra enheter får också larmet.'
            : '📱 Passiv: Tar endast emot larm från Firebase. Läser inte SMS själv.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Övervakningsstatus</Text>

        {deviceMode === 'active' ? (
          <>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Aktivera SMS-övervakning:</Text>
              <Switch
                value={isMonitoring}
                onValueChange={toggleMonitoring}
                trackColor={{ false: "#3A4A5A", true: "#FF3B30" }}
                thumbColor={isMonitoring ? "#FFFFFF" : "#8E9BAE"}
              />
            </View>
            <Text style={styles.helpText}>
              SMS från 3315 skickas till Firebase och alla enheter får larmet.
            </Text>
          </>
        ) : (
          <View style={styles.passiveInfo}>
            <Text style={styles.passiveInfoText}>
              📡 Firebase-lyssning är alltid aktiv
            </Text>
            <Text style={styles.helpText}>
              Du får larm när en aktiv larmstation skickar till Firebase.
            </Text>
          </View>
        )}

        <View style={styles.permissionIndicators}>
          <Text style={styles.permissionIndicator}>
            Firebase: {firebaseInitialized ? '✅' : '❌'}
          </Text>
          {deviceMode === 'active' && (
            <>
              <Text style={styles.permissionIndicator}>
                SMS: {permissions.sms.granted ? '✅' : '❌'}
              </Text>
              <Text style={styles.permissionIndicator}>
                Notis: {permissions.notifications.granted ? '✅' : '❌'}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Larminställningar</Text>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Endast TOTALLARM:</Text>
          <Switch
            value={onlyTotalAlarm}
            onValueChange={toggleOnlyTotal}
            trackColor={{ false: "#3A4A5A", true: "#FF3B30" }}
            thumbColor={onlyTotalAlarm ? "#FFFFFF" : "#8E9BAE"}
          />
        </View>
        <Text style={styles.helpText}>
          {onlyTotalAlarm
            ? '🔴 Larmar endast vid TOTALLARM från 3315'
            : '🟢 Larmar vid ALLA meddelanden från 3315'}
        </Text>

        <View style={[styles.switchContainer, styles.testModeContainer]}>
          <Text style={styles.switchLabel}>Testläge (alla avsändare):</Text>
          <Switch
            value={testMode}
            onValueChange={setTestMode}
            trackColor={{ false: "#3A4A5A", true: "#FF9500" }}
            thumbColor={testMode ? "#FFFFFF" : "#8E9BAE"}
          />
        </View>
        {testMode && (
          <Text style={styles.warningText}>
            ⚠️ TESTLÄGE: Läser ALLA SMS och söker efter ordet "larm"
          </Text>
        )}

        <TouchableOpacity
          style={styles.soundSettingsButton}
          onPress={() => setShowSoundSettings(true)}
        >
          <Text style={styles.soundSettingsButtonText}>
            🔊 Ljudinställningar ({ALARM_SOUNDS[selectedSound].name})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.timeSettingsButton}
          onPress={() => setShowTimeSettings(true)}
        >
          <Text style={styles.timeSettingsButtonText}>
            ⏰ Tidsschema {useTimeSchedule ? '(Aktivt)' : '(Inaktivt)'}
          </Text>
        </TouchableOpacity>
      </View>

      {firebaseInitialized && recentAlarms.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Senaste larm</Text>
            <TouchableOpacity onPress={() => setShowHistory(true)}>
              <Text style={styles.viewAllButton}>Visa alla →</Text>
            </TouchableOpacity>
          </View>

          {recentAlarms.slice(0, 3).map((alarm) => {
            const date = new Date(alarm.timestamp);
            const timeStr = date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

            return (
              <View key={alarm.id} style={styles.recentAlarmItem}>
                <Text style={styles.recentAlarmTime}>{timeStr}</Text>
                <Text style={styles.recentAlarmCategory}>
                  {alarm.isTotalAlarm ? '🚨' : '🟡'} {alarm.category}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Senast läst SMS:</Text>
        <Text style={styles.smsText}>{lastSMS}</Text>
      </View>

      {alarmActive && (
        <TouchableOpacity style={styles.alarmButton} onPress={stopAlarm}>
          <Text style={styles.alarmButtonText}>🔔 STÄNG AV LARM 🔔</Text>
          <Text style={styles.alarmSubText}>Tryck för att bekräfta</Text>
        </TouchableOpacity>
      )}

      <View style={styles.testSection}>
        <Text style={styles.cardTitle}>Testfunktioner</Text>
        <TouchableOpacity style={styles.simulateButton} onPress={simulateSMS}>
          <Text style={styles.simulateButtonText}>
            {testMode ? "🧪 Simulera test-SMS" : "🚨 Simulera larm från 3315"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsSection}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowOnboarding(true)}
        >
          <Text style={styles.settingsButtonText}>⚙️ Inställningar & Tillåtelser</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingsButton, { marginTop: 10 }]}
          onPress={() => setShowHistory(true)}
        >
          <Text style={styles.settingsButtonText}>📚 Visa larmhistorik</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          📱 Avsändare som övervakas: {testMode ? 'ALLA (testläge)' : '3315'}
        </Text>
        <Text style={styles.infoText}>
          🔊 Aktivt ljud: {ALARM_SOUNDS[selectedSound].name}
        </Text>
        {useTimeSchedule && (
          <Text style={styles.infoText}>
            ⏰ Schema aktivt: {startTime.hour.toString().padStart(2, '0')}:{startTime.minute.toString().padStart(2, '0')} - {endTime.hour.toString().padStart(2, '0')}:{endTime.minute.toString().padStart(2, '0')}
          </Text>
        )}
        <Text style={styles.infoText}>
          📳 Vibrerar vid larm (Android)
        </Text>
        <Text style={styles.infoText}>
          {firebaseInitialized ? '🔥 Firebase aktiv - larm delas med alla enheter' : '📴 Offline-läge'}
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Design Tokens ─────────────────────────────────────────────────────────
const C = {
  bg:           '#0D1B2A',
  surface:      '#162536',
  surfaceHigh:  '#1E3248',
  border:       '#243F57',
  accent:       '#FF3B30',
  accentDim:    '#3D1210',
  amber:        '#FF9500',
  amberDim:     '#3D2400',
  green:        '#30D158',
  greenDim:     '#0D3320',
  blue:         '#0A84FF',
  blueDim:      '#0D2A4A',
  textPrimary:  '#FFFFFF',
  textSecondary:'#A0B4C8',
  textMuted:    '#5C7A96',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    color: C.textSecondary,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 15,
    marginTop: 10,
    color: C.textSecondary,
    fontWeight: '600',
  },
  firebaseStatus: {
    fontSize: 13,
    marginTop: 6,
    color: C.green,
    fontWeight: '700',
  },
  scheduleStatus: {
    fontSize: 13,
    marginTop: 5,
    color: C.blue,
    fontWeight: '600',
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    color: C.textPrimary,
    letterSpacing: 0.3,
  },
  viewAllButton: {
    color: C.blue,
    fontSize: 14,
    fontWeight: '600',
  },
  switchLabel: {
    fontSize: 15,
    color: C.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  testModeContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: C.textPrimary,
    backgroundColor: C.surfaceHigh,
  },
  helpText: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  warningText: {
    fontSize: 13,
    color: C.amber,
    marginTop: 6,
    fontWeight: '700',
    backgroundColor: C.amberDim,
    padding: 8,
    borderRadius: 8,
  },
  smsText: {
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 20,
  },
  recentAlarmItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  recentAlarmTime: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '600',
  },
  recentAlarmCategory: {
    fontSize: 15,
    color: C.textPrimary,
    marginTop: 3,
    fontWeight: '500',
  },
  soundSettingsButton: {
    backgroundColor: C.blueDim,
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.blue,
  },
  soundSettingsButtonText: {
    color: C.blue,
    fontSize: 15,
    fontWeight: '700',
  },
  timeSettingsButton: {
    backgroundColor: '#1F1040',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7B5EA7',
  },
  timeSettingsButtonText: {
    color: '#C084FC',
    fontSize: 15,
    fontWeight: '700',
  },
  permissionIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  permissionIndicator: {
    fontSize: 13,
    color: C.textSecondary,
    fontWeight: '600',
  },
  deviceModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    backgroundColor: C.surfaceHigh,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: C.accentDim,
    borderColor: C.accent,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textMuted,
    textAlign: 'center',
  },
  modeButtonTextActive: {
    color: C.accent,
  },
  modeButtonDesc: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  passiveInfo: {
    backgroundColor: C.greenDim,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.green,
  },
  passiveInfoText: {
    fontSize: 14,
    color: C.green,
    fontWeight: '700',
    textAlign: 'center',
  },
  alarmButton: {
    backgroundColor: C.accent,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  alarmButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  alarmSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
  testSection: {
    backgroundColor: C.amberDim,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.amber,
  },
  simulateButton: {
    backgroundColor: C.amber,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  simulateButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  settingsSection: {
    marginBottom: 12,
    gap: 8,
  },
  settingsButton: {
    backgroundColor: C.surfaceHigh,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  settingsButtonText: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  info: {
    marginTop: 16,
    padding: 16,
    backgroundColor: C.surface,
    borderRadius: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: C.textSecondary,
    fontWeight: '500',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: C.bg,
  },
  modalContent: {
    padding: 24,
    marginTop: 50,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.textPrimary,
    textAlign: 'center',
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    color: C.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  timeSection: {
    marginTop: 20,
  },
  timeButton: {
    backgroundColor: C.surfaceHigh,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  timeLabel: {
    fontSize: 16,
    color: C.textPrimary,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: C.blue,
  },
  soundOptionsSection: {
    marginBottom: 20,
  },
  soundOption: {
    backgroundColor: C.surfaceHigh,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: C.border,
  },
  soundOptionSelected: {
    borderColor: C.blue,
    backgroundColor: C.blueDim,
  },
  soundOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textPrimary,
  },
  soundOptionDesc: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 3,
  },
  volumeSection: {
    marginBottom: 20,
  },
  volumeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  volumeButton: {
    flex: 1,
    padding: 14,
    backgroundColor: C.surfaceHigh,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: C.border,
  },
  volumeSelected: {
    backgroundColor: C.blueDim,
    borderColor: C.blue,
  },
  testSoundButton: {
    backgroundColor: C.amber,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  testSoundButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: C.green,
  },
  cancelButton: {
    backgroundColor: C.surfaceHigh,
    borderWidth: 1,
    borderColor: C.border,
  },
  modalButtonText: {
    color: C.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },

  // Onboarding styles
  onboardingContainer: {
    flex: 1,
    backgroundColor: C.bg,
  },
  onboardingContent: {
    padding: 24,
    marginTop: 50,
  },
  onboardingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: C.accent,
    textAlign: 'center',
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    marginBottom: 8,
    color: C.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  permissionsSection: {
    backgroundColor: C.surfaceHigh,
    borderRadius: 16,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  permissionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
    color: C.textPrimary,
  },
  permissionItem: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textPrimary,
  },
  permissionDesc: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
  },
  permissionStatus: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  permissionButton: {
    backgroundColor: C.blue,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 10,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  onboardingButton: {
    backgroundColor: C.accent,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  onboardingButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
