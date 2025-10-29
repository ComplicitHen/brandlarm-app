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
  Linking
} from 'react-native';
import * as SMS from 'expo-sms';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as IntentLauncher from 'expo-intent-launcher';

// Konfigurera notifications för att gå igenom tystläge
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: 'max',
  }),
});

// Ljudalternativ
const ALARM_SOUNDS = {
  standard: {
    name: '🔔 Standard brandalarm',
    description: 'Klassiskt brandlarm',
    file: require('./assets/sounds/alarm.wav')
  },
  critical: {
    name: '🚨 Kritiskt larm',
    description: 'Högt och intensivt',
    file: require('./assets/sounds/critical_alarm.wav')
  },
  siren: {
    name: '🚒 Brandsiren',
    description: 'Traditionell brandkårssiren',
    file: require('./assets/sounds/alarm.wav')
  },
  bell: {
    name: '🔕 Enkel signal',
    description: 'Diskret pipande',
    file: require('./assets/sounds/alarm.wav')
  }
};

export default function App() {
  // State för huvudfunktioner
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [onlyTotalAlarm, setOnlyTotalAlarm] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [sound, setSound] = useState(null);
  const [lastSMS, setLastSMS] = useState('Ingen SMS läst än');
  
  // State för ljudinställningar
  const [selectedSound, setSelectedSound] = useState('standard');
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [alarmVolume, setAlarmVolume] = useState('1.0');
  const [loopSound, setLoopSound] = useState(true);
  
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
    audio: { granted: false, checked: false }
  });

  // Ladda sparade inställningar
  useEffect(() => {
    loadSettings();
    configureAudio();
  }, []);

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

  // Förbättrad permission-hantering
  const requestSMSPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const smsAvailable = await SMS.isAvailableAsync();
        const newPermissions = { ...permissions };
        newPermissions.sms = { granted: smsAvailable, checked: true };
        setPermissions(newPermissions);
        await AsyncStorage.setItem('permissions', JSON.stringify(newPermissions));
        
        if (!smsAvailable) {
          Alert.alert(
            'SMS Permission', 
            'SMS-läsning behövs för att läsa larm från 3315. Du kan behöva aktivera detta i telefonens inställningar.',
            [
              { text: 'OK' },
              { text: 'Öppna inställningar', onPress: () => Linking.openSettings() }
            ]
          );
        }
        return smsAvailable;
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
        Alert.alert(
          'Batterioptimering',
          'För att appen ska fungera i bakgrunden behöver du inaktivera batterioptimering för denna app.',
          [
            { text: 'Avbryt', style: 'cancel' },
            { 
              text: 'Öppna inställningar', 
              onPress: async () => {
                try {
                  await IntentLauncher.startActivityAsync(
                    IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
                  );
                } catch (error) {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        
        const newPermissions = { ...permissions };
        newPermissions.battery = { granted: true, checked: true };
        setPermissions(newPermissions);
        await AsyncStorage.setItem('permissions', JSON.stringify(newPermissions));
      }
      return true;
    } catch (error) {
      console.log('Battery optimization error:', error);
      return false;
    }
  };

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

  // Huvudfunktioner
  const toggleMonitoring = async () => {
    if (!isMonitoring && useTimeSchedule && !isWithinSchedule()) {
      Alert.alert(
        'Utanför schemat',
        `Larmet är schemalagt mellan ${startTime.hour.toString().padStart(2, '0')}:${startTime.minute.toString().padStart(2, '0')} - ${endTime.hour.toString().padStart(2, '0')}:${endTime.minute.toString().padStart(2, '0')}. Vill du aktivera ändå?`,
        [
          { text: 'Avbryt', style: 'cancel' },
          { text: 'Aktivera ändå', onPress: () => activateMonitoring() }
        ]
      );
    } else {
      activateMonitoring();
    }
  };

  const activateMonitoring = async () => {
    setIsMonitoring(!isMonitoring);
    
    if (!isMonitoring) {
      let message = testMode 
        ? 'Testläge aktivt - övervakar ALLA SMS för ordet "larm"'
        : onlyTotalAlarm 
          ? 'Övervakar endast TOTALLARM från 3315'
          : 'Övervakar ALLA larm från 3315';
      
      if (useTimeSchedule) {
        message += `\n⏰ Aktivt: ${startTime.hour.toString().padStart(2, '0')}:${startTime.minute.toString().padStart(2, '0')} - ${endTime.hour.toString().padStart(2, '0')}:${endTime.minute.toString().padStart(2, '0')}`;
      }
      
      Alert.alert('Övervakning startad', message);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🚨 SMS-övervakning AKTIV",
          body: message,
          sound: false,
          priority: 'high',
        },
        trigger: null,
      });
    } else {
      Alert.alert('Övervakning stoppad', 'SMS-övervakning är pausad');
    }
  };

  const toggleOnlyTotal = async () => {
    const newValue = !onlyTotalAlarm;
    setOnlyTotalAlarm(newValue);
    await AsyncStorage.setItem('onlyTotalAlarm', newValue.toString());
    
    Alert.alert(
      newValue ? 'Endast TOTALLARM' : 'Alla larm',
      newValue 
        ? 'Appen larmar nu endast för TOTALLARM'
        : 'Appen larmar för ALLA typer av larm från 3315'
    );
  };

  const playAlarmSound = async () => {
    // Kontrollera om vi är inom schemat
    if (!isWithinSchedule()) {
      console.log('Larm blockerat - utanför schemat');
      return;
    }
    
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        ALARM_SOUNDS[selectedSound].file,
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
          title: "🚨🚨 LARM! 🚨🚨",
          body: onlyTotalAlarm ? "TOTALLARM detekterat!" : "Utryckning detekterad!",
          sound: true,
          priority: 'max',
          sticky: true,
        },
        trigger: null,
      });

    } catch (error) {
      console.log('Sound error:', error);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🚨 LARM!",
          body: "Utryckning detekterad från SMS!",
          sound: true,
          priority: 'max',
        },
        trigger: null,
      });
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

  const checkSMSContent = (message, sender) => {
    if (!isMonitoring) return;

    // Testläge - kolla alla SMS för ordet "larm"
    if (testMode) {
      if (message.toUpperCase().includes('LARM')) {
        setLastSMS(`TEST: ${message} (från: ${sender})`);
        playAlarmSound();
        return;
      }
    }
    
    // Normal drift - endast från 3315
    if (sender === '3315' || sender.includes('3315')) {
      setLastSMS(message);
      
      // Om endast totallarm är aktiverat
      if (onlyTotalAlarm) {
        if (message.toUpperCase().includes('TOTALLARM') || 
            message.toUpperCase().includes('TOTAL-LARM') ||
            message.toUpperCase().includes('FRI INRYCKNING')) {
          playAlarmSound();
        }
      } else {
        // Alla larm från 3315
        playAlarmSound();
      }
    }
  };

  const simulateSMS = () => {
    const testMessages = testMode 
      ? ["Test: LARM från random nummer", "Test: Inget larmord här", "Test: BRAND och LARM test"]
      : onlyTotalAlarm
        ? ["TOTALLARM - Fri inryckning", "LARM Mölnlycke RIB", "Vanlig utryckning"]
        : ["BRAND i byggnad", "TOTALLARM - Fri inryckning", "LARM Mölnlycke RIB"];
    
    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    const sender = testMode ? "+46701234567" : "3315";
    
    setLastSMS(`${randomMessage} (från: ${sender})`);
    checkSMSContent(randomMessage, sender);
  };

  // Time Settings Modal
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

  // Sound Settings Modal
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
          
          <View style={styles.soundOptionsSection}>
            <Text style={styles.sectionTitle}>Välj larmsignal:</Text>
            {Object.keys(ALARM_SOUNDS).map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.soundOption,
                  selectedSound === key && styles.soundOptionSelected
                ]}
                onPress={() => setSelectedSound(key)}
              >
                <Text style={styles.soundOptionTitle}>
                  {ALARM_SOUNDS[key].name}
                </Text>
                <Text style={styles.soundOptionDesc}>
                  {ALARM_SOUNDS[key].description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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

          <TouchableOpacity 
            style={styles.testSoundButton}
            onPress={testSelectedSound}
          >
            <Text style={styles.testSoundButtonText}>🔔 Testa valt ljud</Text>
          </TouchableOpacity>

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

  // Förbättrad Onboarding Modal med individuella permissions
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
      
      <View style={styles.header}>
        <Text style={styles.title}>🚨 Brandkårens SMS-larm</Text>
        {userName ? (
          <Text style={styles.subtitle}>Brandman: {userName} {serviceNumber ? `(#${serviceNumber})` : ''}</Text>
        ) : null}
        <Text style={styles.statusText}>
          {isMonitoring ? '✅ Övervakning aktiv' : '⏸️ Övervakning pausad'}
        </Text>
        {useTimeSchedule && (
          <Text style={styles.scheduleStatus}>
            ⏰ Schema: {startTime.hour.toString().padStart(2, '0')}:{startTime.minute.toString().padStart(2, '0')} - {endTime.hour.toString().padStart(2, '0')}:{endTime.minute.toString().padStart(2, '0')}
            {isWithinSchedule() ? ' (Inom schema)' : ' (Utanför schema)'}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Övervakningsstatus</Text>
        <View style={styles.switchContainer}>
          <Text>Aktivera SMS-övervakning:</Text>
          <Switch
            value={isMonitoring}
            onValueChange={toggleMonitoring}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isMonitoring ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
        
        <View style={styles.permissionIndicators}>
          <Text style={styles.permissionIndicator}>
            SMS: {permissions.sms.granted ? '✅' : '❌'}
          </Text>
          <Text style={styles.permissionIndicator}>
            Notis: {permissions.notifications.granted ? '✅' : '❌'}
          </Text>
          <Text style={styles.permissionIndicator}>
            Batteri: {permissions.battery.granted ? '✅' : '⚠️'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Larminställningar</Text>
        
        <View style={styles.switchContainer}>
          <Text>Endast TOTALLARM:</Text>
          <Switch
            value={onlyTotalAlarm}
            onValueChange={toggleOnlyTotal}
            trackColor={{ false: "#767577", true: "#ff6b6b" }}
            thumbColor={onlyTotalAlarm ? "#ff0000" : "#f4f3f4"}
          />
        </View>
        <Text style={styles.helpText}>
          {onlyTotalAlarm 
            ? '🔴 Larmar endast vid TOTALLARM från 3315'
            : '🟢 Larmar vid ALLA meddelanden från 3315'}
        </Text>

        <View style={[styles.switchContainer, styles.testModeContainer]}>
          <Text>Testläge (alla avsändare):</Text>
          <Switch
            value={testMode}
            onValueChange={setTestMode}
            trackColor={{ false: "#767577", true: "#ffa500" }}
            thumbColor={testMode ? "#ff8c00" : "#f4f3f4"}
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
        <Button 
          title={testMode ? "Simulera test-SMS" : "Simulera larm från 3315"}
          onPress={simulateSMS} 
          color="#ff6b6b" 
        />
      </View>

      <View style={styles.settingsSection}>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowOnboarding(true)}
        >
          <Text style={styles.settingsButtonText}>⚙️ Inställningar & Tillåtelser</Text>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
    color: '#666',
    fontStyle: 'italic',
  },
  statusText: {
    fontSize: 16,
    marginTop: 10,
    color: '#666',
  },
  scheduleStatus: {
    fontSize: 12,
    marginTop: 5,
    color: '#2196F3',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  testModeContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  warningText: {
    fontSize: 12,
    color: '#ff8c00',
    marginTop: 5,
    fontWeight: 'bold',
  },
  smsText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  soundSettingsButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  soundSettingsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeSettingsButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  timeSettingsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  permissionIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  permissionIndicator: {
    fontSize: 12,
    color: '#666',
  },
  alarmButton: {
    backgroundColor: '#ff0000',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  alarmButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  alarmSubText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  testSection: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  settingsSection: {
    marginBottom: 15,
  },
  settingsButton: {
    backgroundColor: '#666',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
  },
  info: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#2e7d32',
    marginBottom: 5,
    fontWeight: '500',
  },
  
  // Time Settings Modal
  timeSection: {
    marginTop: 20,
  },
  timeButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 16,
    color: '#333',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  
  // Sound Settings Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    padding: 30,
    marginTop: 50,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  soundOptionsSection: {
    marginBottom: 20,
  },
  soundOption: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  soundOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  soundOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  soundOptionDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  volumeSection: {
    marginBottom: 20,
  },
  volumeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  volumeButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  volumeSelected: {
    backgroundColor: '#2196F3',
  },
  testSoundButton: {
    backgroundColor: '#FFC107',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  testSoundButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Förbättrad Onboarding styles
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  onboardingContent: {
    padding: 30,
    marginTop: 50,
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  permissionsSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  permissionItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionInfo: {
    flex: 1,
  },
  permissionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  permissionDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  permissionStatus: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  onboardingButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  onboardingButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
