# Build & Deploy Commands - Snabbguide 🚀

Alla kommandon du behöver för att bygga och distribuera appen.

---

## 📱 Android

### Development Build (för testning med SMS)
```bash
eas build --profile development --platform android
```
**Resultat:** APK som kan installeras direkt på Android

### Preview Build (snabb testning)
```bash
eas build --profile preview --platform android
```
**Resultat:** Snabbare APK utan dev-verktyg

### Production Build (för Play Store)
```bash
eas build --profile production --platform android
```
**Resultat:** AAB-fil för Google Play Store

### Submit till Play Store
```bash
eas submit --platform android
```

---

## 🍎 iOS

### Development Build (för testning)
```bash
eas build --profile development --platform ios
```
**Resultat:** IPA för TestFlight

### Preview Build (intern testning)
```bash
eas build --profile preview --platform ios
```

### Production Build (för App Store)
```bash
eas build --profile production --platform ios
```

### Submit till App Store (manuellt)
```bash
eas submit --platform ios
```

### Bygg OCH submit automatiskt
```bash
eas build --profile production --platform ios --auto-submit
```

---

## 🔄 Båda plattformarna samtidigt

### Development Build (Android + iOS)
```bash
eas build --profile development --platform all
```

### Production Build (båda)
```bash
eas build --profile production --platform all
```

---

## 🧪 Lokal testning

### Starta Expo development server
```bash
npx expo start
```

### Starta med development build
```bash
npx expo start --dev-client
```

### Starta och rensa cache
```bash
npx expo start --clear
```

---

## 🔑 Credentials & Setup

### Konfigurera EAS första gången
```bash
eas login
eas build:configure
```

### Visa/hantera credentials
```bash
eas credentials
```

### Ta bort alla credentials (reset)
```bash
eas credentials -p ios
# Välj "Remove all credentials"
```

---

## 📊 Build Status & History

### Lista alla byggen
```bash
eas build:list
```

### Visa specifik build
```bash
eas build:view [BUILD_ID]
```

### Avbryt pågående build
```bash
eas build:cancel
```

---

## 📦 Version Management

### Innan varje production build:

**1. Uppdatera version i app.json:**
```json
{
  "expo": {
    "version": "1.0.1",  // <-- Öka detta
    "android": {
      "versionCode": 5   // <-- Öka detta
    },
    "ios": {
      "buildNumber": "1.0.1"  // <-- Öka detta
    }
  }
}
```

**2. Commita ändringarna:**
```bash
git add .
git commit -m "Bump version to 1.0.1"
git push
```

**3. Bygg:**
```bash
eas build --profile production --platform all
```

---

## 🐛 Troubleshooting Commands

### Rensa Expo cache
```bash
npx expo start --clear
```

### Rensa npm cache
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Rensa Metro bundler
```bash
npx react-native start --reset-cache
```

### Rensa allt
```bash
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

---

## 🔥 Firebase Deployment

Om du vill deploya Firebase functions eller hosting:

### Deploy säkerhetsregler
```bash
firebase deploy --only database
```

### Deploy alla Firebase-resurser
```bash
firebase deploy
```

---

## 📱 Testning på fysisk enhet

### Android via ADB
```bash
# Installera APK
adb install brandlarm.apk

# Se loggar
adb logcat | grep -i expo
```

### iOS via Xcode
```bash
# Öppna i Xcode
open ios/brandlarmapp.xcworkspace

# Eller via command line
xcrun simctl install booted brandlarm.app
```

---

## 🔐 Environment Variables

### Skapa .env-fil (lokalt)
```bash
cat > .env << EOF
FIREBASE_API_KEY=din_api_key
FIREBASE_PROJECT_ID=ditt_projekt_id
EOF
```

### Sätt secrets för EAS Build
```bash
eas secret:create --scope project --name FIREBASE_API_KEY --value "din_api_key"
```

### Lista alla secrets
```bash
eas secret:list
```

---

## 📝 Git Commands (om du använder Git)

### Initial setup
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

### Push till GitHub
```bash
git remote add origin https://github.com/complicithen/brandlarm-app.git
git push -u origin main
```

### Skapa ny version
```bash
git add .
git commit -m "Version 1.0.1 - Lade till egna ljudfiler"
git tag v1.0.1
git push && git push --tags
```

---

## 🚨 Emergency Commands

### Om bygget fastnar
```bash
# Ctrl+C för att avbryta lokalt
# Sedan:
eas build:cancel
```

### Om credentials är trasiga
```bash
eas credentials -p android
# Välj "Remove all credentials"
# Sedan:
eas build --profile production --platform android
```

### Om appen inte startar efter build
```bash
# Kontrollera loggar från senaste bygget:
eas build:list
# Klicka på bygget och läs felmeddelanden
```

---

## ⚡ Quick Reference

| Vad vill du göra? | Kommando |
|-------------------|----------|
| Testa lokalt | `npx expo start` |
| Bygga för Android-test | `eas build --profile development --platform android` |
| Bygga för iOS-test | `eas build --profile development --platform ios` |
| Bygga för Play Store | `eas build --profile production --platform android` |
| Bygga för App Store | `eas build --profile production --platform ios` |
| Bygga för båda | `eas build --profile production --platform all` |
| Ladda upp till Play Store | `eas submit --platform android` |
| Ladda upp till App Store | `eas submit --platform ios` |
| Se bygghistorik | `eas build:list` |
| Rensa allt och börja om | `rm -rf node_modules && npm install` |

---

## 💡 Pro Tips

### 1. Alltid testa lokalt först
```bash
npx expo start
# Testa alla funktioner i Expo Go först
```

### 2. Bygg development build först
```bash
eas build --profile development --platform android
# Testa SMS-läsning och alla features
```

### 3. Använd TestFlight/Internal Testing
```bash
# iOS: TestFlight
eas build --profile production --platform ios --auto-submit

# Android: Internal Testing Track
eas build --profile production --platform android
eas submit --platform android
```

### 4. Håll version-nummer synkat
- Öka ALLTID version innan production build
- Använd semantic versioning: MAJOR.MINOR.PATCH
- Example: 1.0.0 → 1.0.1 (bugfix) → 1.1.0 (ny feature) → 2.0.0 (breaking change)

---

**Spara denna fil som bokmärke för snabb åtkomst! 🚒🔥**
