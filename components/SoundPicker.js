// Sound Picker Component - Låter användare välja egna ljudfiler
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Standard alarmsignaler som följer med appen
export const BUILTIN_ALARM_SOUNDS = {
  standard: {
    name: '🔔 Standard brandalarm',
    description: 'Klassiskt brandlarm',
    file: require('../assets/sounds/alarm.wav'),
    isBuiltIn: true
  },
  critical: {
    name: '🚨 Kritiskt larm',
    description: 'Högt och intensivt',
    file: require('../assets/sounds/critical_alarm.wav'),
    isBuiltIn: true
  },
  siren: {
    name: '🚒 Brandsiren',
    description: 'Traditionell brandkårssiren',
    file: require('../assets/sounds/alarm.wav'),
    isBuiltIn: true
  },
  bell: {
    name: '🔕 Enkel signal',
    description: 'Diskret pipande',
    file: require('../assets/sounds/alarm.wav'),
    isBuiltIn: true
  }
};

export default function SoundPicker({
  selectedSound,
  customSoundUri,
  customSoundName,
  onSoundSelected,
  onCustomSoundSelected
}) {
  const [loading, setLoading] = useState(false);
  const [testingSound, setTestingSound] = useState(null);

  const pickCustomSound = async () => {
    try {
      setLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true
      });

      if (result.type === 'cancel') {
        setLoading(false);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Validera att det är en ljudfil
        const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/aac'];
        if (!validTypes.some(type => asset.mimeType?.includes('audio'))) {
          Alert.alert('Ogiltig fil', 'Vänligen välj en ljudfil (MP3, WAV, OGG, AAC)');
          setLoading(false);
          return;
        }

        // Testa att ljud kan laddas
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: asset.uri },
            { shouldPlay: false }
          );
          await sound.unloadAsync();

          // Spara ljudet
          await AsyncStorage.setItem('customSoundUri', asset.uri);
          await AsyncStorage.setItem('customSoundName', asset.name);

          onCustomSoundSelected(asset.uri, asset.name);

          Alert.alert(
            'Ljudfil vald!',
            `"${asset.name}" har sparats som din anpassade alarmsignal.`,
            [
              { text: 'OK' },
              { text: 'Testa ljud', onPress: () => testSound({ uri: asset.uri }) }
            ]
          );
        } catch (error) {
          Alert.alert('Fel', 'Kunde inte ladda ljudfilen. Försök med en annan fil.');
          console.error('Sound load error:', error);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Fel', 'Kunde inte öppna filväljaren');
      setLoading(false);
    }
  };

  const testSound = async (soundSource) => {
    try {
      if (testingSound) {
        await testingSound.stopAsync();
        await testingSound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        soundSource,
        {
          shouldPlay: true,
          volume: 1.0,
          isLooping: false
        }
      );

      setTestingSound(sound);

      // Stoppa efter 3 sekunder
      setTimeout(async () => {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
          setTestingSound(null);
        } catch (e) {
          console.log('Error stopping test sound:', e);
        }
      }, 3000);

    } catch (error) {
      console.error('Test sound error:', error);
      Alert.alert('Fel', 'Kunde inte spela upp ljudet');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Inbyggda alarmsignaler:</Text>

      {Object.keys(BUILTIN_ALARM_SOUNDS).map((key) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.soundOption,
            selectedSound === key && !customSoundUri && styles.soundOptionSelected
          ]}
          onPress={() => onSoundSelected(key)}
        >
          <View style={styles.soundOptionContent}>
            <Text style={styles.soundOptionTitle}>
              {BUILTIN_ALARM_SOUNDS[key].name}
            </Text>
            <Text style={styles.soundOptionDesc}>
              {BUILTIN_ALARM_SOUNDS[key].description}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.testButton}
            onPress={(e) => {
              e.stopPropagation();
              testSound(BUILTIN_ALARM_SOUNDS[key].file);
            }}
          >
            <Text style={styles.testButtonText}>▶️</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Egen alarmsignal:</Text>
      <Text style={styles.helpText}>
        Välj din egen ljudfil från telefonen (MP3, WAV, OGG, AAC)
      </Text>

      {customSoundUri && customSoundName && (
        <View
          style={[
            styles.soundOption,
            customSoundUri && styles.soundOptionSelected
          ]}
        >
          <View style={styles.soundOptionContent}>
            <Text style={styles.soundOptionTitle}>
              🎵 {customSoundName}
            </Text>
            <Text style={styles.soundOptionDesc}>
              Din anpassade alarmsignal
            </Text>
          </View>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => testSound({ uri: customSoundUri })}
          >
            <Text style={styles.testButtonText}>▶️</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.pickButton}
        onPress={pickCustomSound}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Text style={styles.pickButtonText}>
              📁 {customSoundUri ? 'Byt ljudfil' : 'Välj egen ljudfil'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {customSoundUri && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            Alert.alert(
              'Ta bort anpassat ljud?',
              'Detta återställer till inbyggda alarmsignaler.',
              [
                { text: 'Avbryt', style: 'cancel' },
                {
                  text: 'Ta bort',
                  style: 'destructive',
                  onPress: async () => {
                    await AsyncStorage.removeItem('customSoundUri');
                    await AsyncStorage.removeItem('customSoundName');
                    onCustomSoundSelected(null, null);
                    onSoundSelected('standard');
                  }
                }
              ]
            );
          }}
        >
          <Text style={styles.clearButtonText}>🗑️ Ta bort anpassat ljud</Text>
        </TouchableOpacity>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Tips: Du kan använda vilken ljudfil som helst från din telefon.
          Perfekt för att använda er brandkårs egen signal!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    color: '#333',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  soundOption: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  soundOptionContent: {
    flex: 1,
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
  testButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  testButtonText: {
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  pickButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  pickButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
  },
  infoText: {
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 18,
  },
});
