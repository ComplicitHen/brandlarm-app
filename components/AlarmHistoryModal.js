// Larmhistorik-komponent - Visar tidigare larm från Firebase
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { getAlarmHistory } from '../services/firebaseService';
import { formatAlarmDisplay } from '../utils/smsParser';

export default function AlarmHistoryModal({ visible, onClose }) {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadHistory();
    }
  }, [visible]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const history = await getAlarmHistory(100); // Senaste 100 larmen
      setAlarms(history);
    } catch (error) {
      console.error('Kunde inte ladda historik:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const renderAlarmItem = (alarm) => {
    const date = new Date(alarm.timestamp);
    const timeStr = date.toLocaleTimeString('sv-SE');
    const dateStr = date.toLocaleDateString('sv-SE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });

    return (
      <View
        key={alarm.id}
        style={[
          styles.alarmItem,
          alarm.isTotalAlarm && styles.totalAlarmItem
        ]}
      >
        <View style={styles.alarmHeader}>
          <Text style={styles.alarmType}>
            {alarm.isTotalAlarm ? '🚨 TOTALLARM' : '🟡 Utryckning'}
          </Text>
          <Text style={styles.alarmTime}>{timeStr}</Text>
        </View>

        <Text style={styles.alarmDate}>{dateStr}</Text>

        <Text style={styles.alarmCategory}>{alarm.category}</Text>

        {alarm.station && (
          <Text style={styles.alarmStation}>📍 {alarm.station}</Text>
        )}

        {alarm.userName && (
          <Text style={styles.alarmUser}>
            👤 Triggat av: {alarm.userName}
          </Text>
        )}

        {alarm.testMode && (
          <Text style={styles.testBadge}>🧪 TESTLARM</Text>
        )}
      </View>
    );
  };

  const groupAlarmsByDate = () => {
    const grouped = {};

    alarms.forEach(alarm => {
      const date = new Date(alarm.timestamp);
      const dateKey = date.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(alarm);
    });

    return grouped;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#d32f2f" />
          <Text style={styles.loadingText}>Laddar historik...</Text>
        </View>
      );
    }

    if (alarms.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>📭</Text>
          <Text style={styles.emptySubtext}>Ingen larmhistorik än</Text>
        </View>
      );
    }

    const groupedAlarms = groupAlarmsByDate();

    return (
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {Object.keys(groupedAlarms).map(dateKey => (
          <View key={dateKey} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{dateKey}</Text>
            {groupedAlarms[dateKey].map(renderAlarmItem)}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Totalt {alarms.length} larm
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📚 Larmhistorik</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {renderContent()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#d32f2f',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 10,
  },
  alarmItem: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  totalAlarmItem: {
    borderLeftColor: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  alarmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  alarmType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  alarmTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  alarmDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  alarmCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  alarmStation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  alarmUser: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
  },
  testBadge: {
    fontSize: 11,
    color: '#ff8c00',
    fontWeight: 'bold',
    marginTop: 5,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
