# Brandlarm-app - Komplett Setup-guide

En React Native-app för deltidsbrandmän som automatiskt läser SMS från larmcentral (3315), delar larm via Firebase mellan Android och iOS, och spelar höga alarmljud.

## Innehållsförteckning

1. [Översikt](#översikt)
2. [Förutsättningar](#förutsättningar)
3. [Firebase-konfiguration](#firebase-konfiguration)
4. [Installation](#installation)
5. [Projekstruktur](#projekstruktur)
6. [Byggprocess](#byggprocess)
7. [Testning](#testning)
8. [Felsökning](#felsökning)
9. [SMS-läsning (Android)](#sms-läsning-android)
10. [Deployment](#deployment)

---

## Översikt

### Funktionalitet

- **SMS-läsning**: Automatisk läsning av SMS från nummer 3315
- **SMS-parsing**: Intelligent tolkning av larmstruktur från VRR Ledningscentral
- **Firebase Realtime Database**: Delar larm mellan alla enheter i realtid
- **Firebase Authentication**: Säker anonym autentisering
- **Push-notiser**: Höga notifikationer som går igenom tystläge
- **Alarmljud**: Flera ljudalternativ med volymkontroll
- **Larmhistorik**: Visar tidigare larm från Firebase
- **Tidsschema**: Aktivera larm endast vissa tider
- **TOTALLARM-filter**: Välj att endast larmast för TOTALLARM
- **Testläge**: Testa funktionalitet utan riktiga larm

### Teknisk stack

- React Native 0.81.4 med Expo 54
- Firebase SDK (Realtime Database, Auth)
- Expo Notifications
- Expo AV (audio)
- AsyncStorage för lokala inställningar

---

## Förutsättningar

### System

- Node.js 18+ och npm
- Android Studio (för Android-utveckling)
- Xcode (för iOS-utveckling, endast på Mac)
- Expo CLI
- Git

### Termux (för Android-utveckling i Termux)

```bash
pkg update && pkg upgrade
pkg install nodejs git
npm install -g expo-cli eas-cli
```

---

## Firebase-konfiguration

### Steg 1: Skapa Firebase-projekt

1. Gå till [Firebase Console](https://console.firebase.google.com/)
2. Klicka på "Add project" / "Lägg till projekt"
3. Namnge projektet (t.ex. "brandlarm-app")
4. Inaktivera Google Analytics (ej nödvändigt)
5. Klicka "Create project"

### Steg 2: Aktivera Realtime Database

1. I Firebase Console, gå till "Build" → "Realtime Database"
2. Klicka "Create Database"
3. Välj location: **Europe (europe-west1)**
4. Välj "Start in test mode" (vi ändrar regler senare)
5. Klicka "Enable"

### Steg 3: Aktivera Authentication

1. Gå till "Build" → "Authentication"
2. Klicka "Get started"
3. Under "Sign-in method", aktivera "Anonymous"
4. Spara

### Steg 4: Hämta Firebase-konfiguration

1. Gå till Project Settings (kugghjul-ikon)
2. Scrolla ner till "Your apps"
3. Klicka på "</>" (Web) för att lägga till en webb-app
4. Registrera appen (t.ex. "brandlarm-web")
5. Kopiera `firebaseConfig`-objektet
6. Klistra in i `firebase.config.js`

**VIKTIGT**: Lägg till `databaseURL` om den saknas:
```javascript
databaseURL: "https://DITT-PROJEKT-default-rtdb.europe-west1.firebasedatabase.app"
```

### Steg 5: Konfigurera säkerhetsregler

1. Gå tillbaka till "Realtime Database"
2. Klicka på "Rules"
3. Kopiera innehållet från `firebase-rules.json` i projektet
4. Klistra in och publicera

**Observera**: Detta begränsar åtkomst till endast autentiserade användare.

---

## Installation

### 1. Klona eller navigera till projektet

```bash
cd brandlarm-app
```

### 2. Installera dependencies

```bash
npm install
```

### 3. Uppdatera Firebase-config

Redigera `firebase.config.js` med dina Firebase-uppgifter (se ovan).

### 4. Kontrollera ljudfiler

Appen förväntar sig ljudfiler i `assets/sounds/`:
- `alarm.wav` - Standard alarmljud

Om du inte har ljudfiler, kan du skapa dummy-filer eller hitta fria alarmljud online.

---

## Projekstruktur

```
brandlarm-app/
├── App.js                          # Huvudkomponent
├── firebase.config.js              # Firebase-konfiguration
├── package.json                    # Dependencies
├── app.json                        # Expo-konfiguration
├── assets/
│   ├── sounds/
│   │   └── alarm.wav              # Alarmljud
│   ├── icon.png                   # App-ikon
│   └── splash.png                 # Splash screen
├── services/
│   ├── firebaseService.js         # Firebase-integration
│   └── smsMonitorService.js       # SMS-övervakningslogik
├── components/
│   └── AlarmHistoryModal.js       # Larmhistorik-komponent
├── utils/
│   └── smsParser.js               # SMS-parsning för 3315
└── docs/
    ├── SETUP_GUIDE.md             # Denna fil
    └── firebase-rules.json        # Firebase-säkerhetsregler
```

---

## Byggprocess

### Development Build (rekommenderas)

Development Build krävs för att använda custom native modules (SMS-läsning).

#### 1. Installera EAS CLI (om ej gjort)

```bash
npm install -g eas-cli
```

#### 2. Logga in på Expo

```bash
eas login
```

Använd ditt Expo-konto eller skapa ett nytt på [expo.dev](https://expo.dev).

#### 3. Konfigurera EAS Build

Om `eas.json` inte finns, skapa det:

```bash
eas build:configure
```

Välj:
- Platform: **Android**
- Build profile: **development**

#### 4. Bygg Development APK

```bash
eas build --profile development --platform android
```

Detta bygger en development APK som du kan installera på din Android-enhet.

**OBS**: Bygget sker i Expo:s moln och tar ~10-15 minuter.

#### 5. Ladda ner och installera APK

När bygget är klart, ladda ner APK från länken som visas. Överför till din Android-enhet och installera.

#### 6. Starta development server

```bash
npx expo start --dev-client
```

Scanna QR-koden med appen du just installerade.

### Production Build

För att bygga en produktions-APK:

```bash
eas build --profile production --platform android
```

---

## Testning

### 1. Testläge

Appen har ett inbyggt testläge:
- Aktivera "Testläge" i appen
- Klicka "Simulera larm från 3315"
- Appen kommer att visa och spela larm

### 2. Simulera TOTALLARM vs Vanligt larm

Testläget genererar slumpmässiga SMS:
- **TOTALLARM**: Innehåller "TOTALLARM - Fri inryckning"
- **Vanligt larm**: Innehåller "Larmkategori namn : Brand i byggnad"

Testa att aktivera "Endast TOTALLARM" och se att endast TOTALLARM triggar.

### 3. Testa Firebase-integration

1. Installera appen på två enheter
2. Simulera ett larm på enhet A
3. Se att larmet dyker upp på enhet B

### 4. Testa SMS-parser

Kör test-funktionen i appen eller:

```javascript
import { testParser } from './utils/smsParser';
testParser();
```

---

## SMS-läsning (Android)

### Begränsning i Expo

Expo SDK har **begränsad SMS-läsning**. För fullständig bakgrundsläsning behöver du:

#### Alternativ 1: Expo Development Build + Native Module

1. Installera `react-native-android-sms-listener`:

```bash
npx expo install react-native-android-sms-listener
```

2. Bygg om development build:

```bash
eas build --profile development --platform android
```

3. Implementera native listener i `services/smsMonitorService.js`:

```javascript
import SmsListener from 'react-native-android-sms-listener';

SmsListener.addListener(message => {
  const { originatingAddress, body } = message;
  handleIncomingSMS(body, originatingAddress, Date.now());
});
```

#### Alternativ 2: Eject till Bare Workflow

För maximal kontroll, ejekta från Expo:

```bash
npx expo prebuild
```

Detta skapar native Android/iOS-kod som du kan anpassa.

### Permissions

Appen kräver följande permissions (redan konfigurerade i `app.json`):

- `READ_SMS`
- `RECEIVE_SMS`
- `VIBRATE`

---

## Firebase Realtime Database-struktur

### Larm-nod

```json
{
  "alarms": {
    "-NqK3sX8YzJm9L4oPqR": {
      "id": "-NqK3sX8YzJm9L4oPqR",
      "timestamp": 1735404615123,
      "userId": "anonymous_user_id",
      "userName": "Johan Andersson",
      "sender": "3315",
      "station": "Mölnlycke RIB",
      "alarmType": "TOTALLARM",
      "category": "TOTALLARM - Fri inryckning",
      "isTotalAlarm": true,
      "rawMessage": "Larminformation från VRR Ledningscentral\nLARM Mölnlycke RIB\nTOTALLARM - Fri inryckning\nTID : 2025-10-28 14:30:15.123"
    }
  }
}
```

### Användarstatus-nod (valfritt)

```json
{
  "userStatus": {
    "anonymous_user_id": {
      "lastUpdated": 1735404615123,
      "userId": "anonymous_user_id",
      "userName": "Johan Andersson",
      "isMonitoring": true,
      "onlyTotalAlarm": false
    }
  }
}
```

---

## Felsökning

### Problem: Firebase initialiseras inte

**Symptom**: "Kör i offline-läge utan Firebase"

**Lösning**:
1. Kontrollera att `firebase.config.js` har korrekta uppgifter
2. Verifiera att `databaseURL` är korrekt
3. Kontrollera internet-anslutning
4. Se console-loggar: `npx react-native log-android`

### Problem: SMS läses inte

**Symptom**: Inga SMS triggar larm

**Lösning**:
1. Verifiera att SMS-permissions är beviljade
2. Kontrollera att avsändaren är exakt "3315"
3. Testa med testläge först
4. Se om native SMS-listener är implementerad

### Problem: Larm spelas inte

**Symptom**: Notifikation visas men inget ljud

**Lösning**:
1. Kontrollera att ljudfiler finns i `assets/sounds/`
2. Verifiera att telefonen inte är i tystläge
3. Kontrollera "Stör ej"-inställningar på Android
4. Öka volym i appen

### Problem: Appen stannar i bakgrunden

**Symptom**: SMS läses inte när appen är stängd

**Lösning**:
1. Inaktivera batterioptimering för appen
2. Android: Gå till Inställningar → Appar → Brandlarm → Batteri → Obegränsad
3. Vissa telefoner (Xiaomi, Huawei) kräver extra "Autostart"-tillåtelse

---

## Deployment

### Android Play Store

1. Bygg production APK:

```bash
eas build --profile production --platform android
```

2. Skapa Signing Key:

```bash
eas credentials
```

3. Ladda upp APK till Google Play Console:
   - Gå till [play.google.com/console](https://play.google.com/console)
   - Skapa ny app
   - Ladda upp APK under "Production" → "Create new release"

### iOS App Store

1. Lägg till iOS-konfiguration i `app.json`:

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.brandkaren.larmapp",
  "buildNumber": "1.0.0"
}
```

2. Bygg iOS:

```bash
eas build --profile production --platform ios
```

3. Ladda upp till App Store Connect via Transporter eller Xcode.

**OBS**: iOS kräver en Mac för utveckling och en Apple Developer-konto ($99/år).

---

## Viktig information

### Säkerhet

- Appen använder anonym autentisering. För produktionsmiljö, överväg email/password.
- Firebase-regler begränsar åtkomst till autentiserade användare.
- SMS-innehåll lagras i Firebase - se till att det är okej enligt GDPR.

### Batteriförbrukning

- SMS-polling var 5:e sekund kan öka batteriförbrukning.
- Överväg att öka intervallet eller implementera native broadcast receiver.

### Kostnader

- Firebase Realtime Database har en **gratis tier**:
  - 1 GB lagring
  - 10 GB/månad nedladdning
  - 100 samtidiga anslutningar
- För en brandkår på ~20 personer räcker gratis tier gott och väl.

---

## Support och utveckling

### Loggar

**Android**:
```bash
npx react-native log-android
```

**iOS**:
```bash
npx react-native log-ios
```

### Debugging

1. Aktivera Remote Debugging: Skaka enheten → "Debug"
2. Öppna Chrome DevTools: `chrome://inspect`

### Bidra

För att bidra till projektet:
1. Forka repot
2. Skapa en feature branch
3. Gör dina ändringar
4. Skicka en pull request

---

## Kontakt

För frågor och support, kontakta utvecklaren på GitHub.

---

**Lycka till med er brandlarm-app! Var säkra där ute! 🚒🔥**
