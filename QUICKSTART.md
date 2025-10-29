# Snabbstart - Brandlarm-app

Kom igång på 10 minuter!

## 1. Firebase-setup (5 min)

### A. Skapa projekt
1. Gå till https://console.firebase.google.com/
2. Klicka "Add project"
3. Namnge: "brandlarm-app"
4. Skapa projekt

### B. Aktivera Realtime Database
1. Build → Realtime Database → Create Database
2. Välj **europe-west1**
3. Starta i test mode
4. Gå till Rules, klistra in från `firebase-rules.json`

### C. Aktivera Authentication
1. Build → Authentication → Get started
2. Sign-in method → Anonymous → Enable

### D. Hämta config
1. Project Settings (⚙️) → Your apps → Add web app
2. Registrera app
3. Kopiera `firebaseConfig`
4. Klistra in i `firebase.config.js`

**Viktigt**: Lägg till denna rad i config:
```javascript
databaseURL: "https://firefighter-training-app-c860e-default-rtdb.europe-west1.firebasedatabase.app"
```

## 2. Installera dependencies (2 min)

```bash
cd brandlarm-app
npm install
```

## 3. Testa lokalt (1 min)

```bash
npx expo start
```

- Scanna QR-kod med Expo Go-appen
- OBS: SMS-läsning fungerar ej i Expo Go, endast i Development Build

## 4. Bygg Development APK (10 min byggtid)

```bash
# Installera EAS CLI
npm install -g eas-cli

# Logga in
eas login

# Konfigurera
eas build:configure

# Bygg Android
eas build --profile development --platform android
```

Vänta ~10 minuter. Ladda ner APK från länken och installera på Android.

## 5. Första körning

1. **Öppna appen**
2. **Ange ditt namn** (t.ex. "Johan Andersson")
3. **Klicka "Fortsätt"**
4. **Ge permissions**:
   - SMS-läsning ✅
   - Notifikationer ✅
   - Batterioptimering ✅
5. **Aktivera SMS-övervakning**
6. **Testa**: Klicka "Simulera larm från 3315"

## 6. Konfigurera för dina behov

### Endast TOTALLARM?
- Aktivera switchen "Endast TOTALLARM"

### Tidsschema?
- Klicka "⏰ Tidsschema"
- Aktivera och välj tider

### Annat alarmljud?
- Klicka "🔊 Ljudinställningar"
- Välj ljud och volym

## Färdig! 🎉

Appen övervakar nu SMS från 3315 och delar larm med alla enheter via Firebase.

---

## Snabbtips

### Testläge
För att testa utan att vänta på riktiga larm:
1. Aktivera "Testläge (alla avsändare)"
2. Appen larmar nu för ALLA SMS som innehåller "larm"

### Larmhistorik
Klicka "📚 Visa larmhistorik" för att se tidigare larm från alla användare.

### Flera enheter
Installera på flera telefoner - alla får larm samtidigt!

### Problem?
Se `SETUP_GUIDE.md` för detaljerad felsökning.

---

**Lycka till! 🚒**
