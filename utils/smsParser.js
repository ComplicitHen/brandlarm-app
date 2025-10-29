// SMS Parser för VRR Ledningscentral (3315)
// Parsar SMS från brandkåren och extraherar larminfo

/**
 * Exempel på SMS-struktur:
 *
 * Larminformation från VRR Ledningscentral
 * LARM Mölnlycke RIB
 * TOTALLARM - Fri inryckning
 * TID : 2025-10-28 14:30:15.123
 *
 * ELLER
 *
 * Larminformation från VRR Ledningscentral
 * LARM Mölnlycke RIB
 * Larmkategori namn : Brand i byggnad
 * TID : 2025-10-28 14:30:15.123
 */

export const SMS_SENDER = '3315';

export const ALARM_TYPES = {
  TOTAL: 'TOTALLARM',
  REGULAR: 'REGULAR'
};

/**
 * Parsear SMS från 3315 och extraherar larmdata
 * @param {string} message - SMS-meddelandet
 * @param {string} sender - Avsändarens nummer
 * @returns {object|null} - Parsed alarm data eller null om inte giltigt larm
 */
export const parseSMS = (message, sender) => {
  try {
    // Kontrollera att det är från rätt nummer
    if (!sender.includes(SMS_SENDER)) {
      return null;
    }

    // Kontrollera att det är ett larmmeddelande
    if (!message.includes('Larminformation från VRR Ledningscentral')) {
      return null;
    }

    const lines = message.split('\n').map(line => line.trim());

    // Extrahera information
    let station = '';
    let alarmType = ALARM_TYPES.REGULAR;
    let category = '';
    let timestamp = null;
    let isTotalAlarm = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Rad 2: Station (ex: "LARM Mölnlycke RIB")
      if (line.startsWith('LARM ')) {
        station = line.replace('LARM ', '').trim();
      }

      // Rad 3: Antingen TOTALLARM eller kategori
      if (line.toUpperCase().includes('TOTALLARM') || line.toUpperCase().includes('FRI INRYCKNING')) {
        alarmType = ALARM_TYPES.TOTAL;
        isTotalAlarm = true;
        category = 'TOTALLARM - Fri inryckning';
      } else if (line.includes('Larmkategori namn :')) {
        category = line.replace('Larmkategori namn :', '').trim();
      }

      // Rad 4: Tidsstämpel (ex: "TID : 2025-10-28 14:30:15.123")
      if (line.startsWith('TID :')) {
        const timeString = line.replace('TID :', '').trim();
        timestamp = parseTimestamp(timeString);
      }
    }

    // Validera att vi har nödvändig information
    if (!station || !category) {
      console.warn('Ofullständigt larmmeddelande:', message);
      return null;
    }

    return {
      sender: SMS_SENDER,
      station,
      alarmType,
      category,
      isTotalAlarm,
      timestamp: timestamp || Date.now(),
      rawMessage: message,
      parsed: true
    };

  } catch (error) {
    console.error('SMS-parseringsfel:', error);
    return null;
  }
};

/**
 * Parsear tidsstämpel från SMS
 * @param {string} timeString - Tidsträng från SMS (format: "YYYY-MM-DD HH:MM:SS.mmm")
 * @returns {number} - Unix timestamp
 */
const parseTimestamp = (timeString) => {
  try {
    // Format: "2025-10-28 14:30:15.123"
    const [datePart, timePart] = timeString.split(' ');
    const [year, month, day] = datePart.split('-');
    const [time, milliseconds] = timePart.split('.');
    const [hours, minutes, seconds] = time.split(':');

    const date = new Date(
      parseInt(year),
      parseInt(month) - 1, // JavaScript months är 0-baserade
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds),
      parseInt(milliseconds || 0)
    );

    return date.getTime();
  } catch (error) {
    console.error('Kunde inte parsea tidsstämpel:', error);
    return Date.now();
  }
};

/**
 * Kontrollera om SMS är ett larm från 3315
 * @param {string} message - SMS-meddelandet
 * @param {string} sender - Avsändarens nummer
 * @returns {boolean}
 */
export const isAlarmSMS = (message, sender) => {
  return sender.includes(SMS_SENDER) &&
         message.includes('Larminformation från VRR Ledningscentral');
};

/**
 * Kontrollera om larmet är ett TOTALLARM
 * @param {object} parsedAlarm - Parseat larmdata
 * @returns {boolean}
 */
export const isTotalAlarm = (parsedAlarm) => {
  return parsedAlarm?.isTotalAlarm === true;
};

/**
 * Formatera larmdata för visning
 * @param {object} parsedAlarm - Parseat larmdata
 * @returns {string}
 */
export const formatAlarmDisplay = (parsedAlarm) => {
  if (!parsedAlarm) return 'Ogiltigt larm';

  const date = new Date(parsedAlarm.timestamp);
  const timeStr = date.toLocaleTimeString('sv-SE');
  const dateStr = date.toLocaleDateString('sv-SE');

  return `🚨 ${parsedAlarm.category}\n` +
         `📍 ${parsedAlarm.station}\n` +
         `⏰ ${dateStr} ${timeStr}\n` +
         `${parsedAlarm.isTotalAlarm ? '🔴 TOTALLARM' : '🟡 Utryckning'}`;
};

/**
 * Test-funktion för att validera parser
 */
export const testParser = () => {
  const testMessages = [
    {
      message: `Larminformation från VRR Ledningscentral
LARM Mölnlycke RIB
TOTALLARM - Fri inryckning
TID : 2025-10-28 14:30:15.123`,
      sender: '3315',
      expected: { isTotalAlarm: true }
    },
    {
      message: `Larminformation från VRR Ledningscentral
LARM Mölnlycke RIB
Larmkategori namn : Brand i byggnad
TID : 2025-10-28 14:30:15.123`,
      sender: '3315',
      expected: { isTotalAlarm: false }
    }
  ];

  console.log('=== SMS Parser Test ===');
  testMessages.forEach((test, index) => {
    const result = parseSMS(test.message, test.sender);
    console.log(`Test ${index + 1}:`, result);
    console.log('Förväntat TOTALLARM:', test.expected.isTotalAlarm);
    console.log('Faktiskt TOTALLARM:', result?.isTotalAlarm);
    console.log('---');
  });
};
