# 🚒 Brandlarm-app

**SMS-baserad larmsystem för deltidsbrandmän**

En React Native-app som automatiskt läser SMS från larmcentral (3315), delar larm via Firebase mellan alla enheter, och spelar höga alarmljud som går igenom tystläge.

---

## ✨ Funktioner

- 📱 **Automatisk SMS-läsning** från nummer 3315
- 🔥 **Firebase Realtime Database** - Delar larm mellan Android och iOS
- 🔔 **Höga alarmljud** som går igenom tystläge och Stör ej
- 📚 **Larmhistorik** - Se alla tidigare larm
- ⏰ **Tidsschema** - Aktivera larm endast vissa tider
- 🚨 **TOTALLARM-filter** - Välj att endast larmast för TOTALLARM
- 🧪 **Testläge** - Testa funktionalitet utan riktiga larm
- 🎵 **Flera ljudalternativ** med volymkontroll
- 🔋 **Bakgrundskörning** - Fungerar även när appen är stängd

---

## 🚀 Snabbstart

```bash
# 1. Installera dependencies
npm install

# 2. Konfigurera Firebase (se QUICKSTART.md)
# Redigera firebase.config.js

# 3. Starta development server
npx expo start

# 4. Bygg för Android (Development Build)
eas build --profile development --platform android
```

**Fullständig guide**: Se [SETUP_GUIDE.md](./SETUP_GUIDE.md)
**Snabbstart**: Se [QUICKSTART.md](./QUICKSTART.md)

---

## 📋 Krav

- Node.js 18+
- Expo CLI
- Firebase-projekt
- Android-enhet för SMS-läsning
- (Valfritt) iOS-enhet för mottagning

---

## 🏗️ Teknisk stack

- **React Native 0.81.4** med Expo 54
- **Firebase Realtime Database** - Larmdelning
- **Firebase Authentication** - Säkerhet
- **Expo Notifications** - Push-notiser
- **Expo AV** - Alarmljud
- **AsyncStorage** - Lokala inställningar

---

## 📱 SMS-struktur från 3315

Appen förstår följande SMS-format:

```
Larminformation från VRR Ledningscentral
LARM Mölnlycke RIB
TOTALLARM - Fri inryckning
TID : 2025-10-28 14:30:15.123
```

Eller:

```
Larminformation från VRR Ledningscentral
LARM Mölnlycke RIB
Larmkategori namn : Brand i byggnad
TID : 2025-10-28 14:30:15.123
```

---

## 🔧 Projekstruktur

```
brandlarm-app/
├── App.js                      # Huvudkomponent
├── firebase.config.js          # Firebase-konfiguration
├── services/
│   ├── firebaseService.js     # Firebase-integration
│   └── smsMonitorService.js   # SMS-övervakningslogik
├── components/
│   └── AlarmHistoryModal.js   # Larmhistorik
└── utils/
    └── smsParser.js           # SMS-parsning för 3315
```

---

## 🧪 Testning

### Testläge
1. Aktivera "Testläge" i appen
2. Klicka "Simulera larm från 3315"
3. Appen kommer att visa och spela larm

### Simulera TOTALLARM
```javascript
const testSMS = `Larminformation från VRR Ledningscentral
LARM Mölnlycke RIB
TOTALLARM - Fri inryckning
TID : ${new Date().toISOString()}`;
```

---

## 🔐 Säkerhet

- Anonym Firebase-autentisering
- Säkerhetsregler begränsar åtkomst till autentiserade användare
- SMS-innehåll krypteras i transit (Firebase SSL)

**Firebase Rules**: Se [firebase-rules.json](./firebase-rules.json)

---

## 📦 Byggprocess

### Development Build
```bash
eas build --profile development --platform android
```

### Production Build
```bash
eas build --profile production --platform android
```

---

## 🐛 Felsökning

### Firebase initialiseras inte
- Kontrollera `firebase.config.js`
- Verifiera `databaseURL`
- Kontrollera internet

### SMS läses inte
- Verifiera SMS-permissions
- Kontrollera att avsändaren är "3315"
- Testa med testläge först

### Larm spelas inte
- Kontrollera ljudfiler i `assets/sounds/`
- Verifiera volym och tystläge
- Kontrollera "Stör ej"-inställningar

**Mer felsökning**: Se [SETUP_GUIDE.md](./SETUP_GUIDE.md#felsökning)

---

## 💰 Kostnader

**Firebase Realtime Database - Gratis tier:**
- 1 GB lagring
- 10 GB/månad nedladdning
- 100 samtidiga anslutningar

För en brandkår på ~20 personer räcker gratis tier!

---

## 📄 Licens

Detta projekt är skapat för deltidsbrandmän och får användas fritt.

---

## 🤝 Bidra

1. Forka projektet
2. Skapa en feature branch (`git checkout -b feature/ny-funktion`)
3. Commit dina ändringar (`git commit -m 'Lägg till ny funktion'`)
4. Push till branchen (`git push origin feature/ny-funktion`)
5. Öppna en Pull Request

---

## 📞 Support

För frågor och support:
- Öppna ett issue på GitHub
- Se dokumentation i [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 🙏 Tack till

- VRR Ledningscentral för SMS-format
- Mölnlycke RIB
- Alla deltidsbrandmän som testar appen

---

**Var säkra där ute! 🚒🔥**
