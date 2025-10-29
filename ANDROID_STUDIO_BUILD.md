# Android Studio - Bygg-Guide 🚒

**Enkel steg-för-steg guide för att bygga brandlarm-appen**

---

## 📥 Steg 1: Ladda ner projektet

```bash
git clone https://github.com/ComplicitHen/brandlarm-app.git
cd brandlarm-app
```

---

## 🛠️ Steg 2: Installera Android Studio

**Om du inte har Android Studio:**

1. Ladda ner från: https://developer.android.com/studio
2. Installera (följ installationsguiden)
3. Öppna Android Studio första gången
4. Låt den ladda ner Android SDK (detta sker automatiskt)

**Det är INTE svårt!** Android Studio gör allt åt dig.

---

## 📂 Steg 3: Öppna projektet

**I Android Studio:**

1. Klicka på `File` → `Open`
2. Navigera till `brandlarm-app` mappen
3. Välj **`android`-mappen** (VIKTIGT!)
4. Klicka `OK`

**Android Studio kommer nu:**
- Synkronisera Gradle (tar 2-5 min första gången)
- Ladda ner dependencies automatiskt
- Konfigurera allt

**Du behöver INTE göra något!** Bara vänta.

---

## 🔨 Steg 4: Bygg APK

**Metod 1: Via Android Studio (Enklast!)**

1. Vänta tills Gradle sync är klar (se nedre högra hörnet)
2. Klicka på `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
3. Vänta 2-3 minuter
4. Klart! APK:en finns i:
   ```
   brandlarm-app/android/app/build/outputs/apk/debug/app-debug.apk
   ```

**Metod 2: Via Terminal (Om du gillar CLI)**

1. I Android Studio, klicka på `View` → `Tool Windows` → `Terminal`
2. Kör:
   ```bash
   ./gradlew assembleDebug
   ```
3. Vänta 2-3 minuter
4. Klart! APK finns på samma plats som ovan

---

## 📱 Steg 5: Installera på telefon

**Alternativ A: USB-kabel (Snabbast)**

1. Anslut telefonen via USB
2. Aktivera `Developer Options` på telefonen:
   - Gå till `Settings` → `About Phone`
   - Tryck 7 gånger på `Build Number`
3. Aktivera `USB Debugging`:
   - `Settings` → `Developer Options` → `USB Debugging` → ON
4. I Android Studio:
   - Klicka på den gröna play-knappen ▶
   - Välj din telefon
   - Klart!

**Alternativ B: Kopiera APK (Om ingen USB-kabel)**

1. Hitta APK:en: `brandlarm-app/android/app/build/outputs/apk/debug/app-debug.apk`
2. Skicka till telefonen (via email, Google Drive, etc.)
3. På telefonen:
   - Öppna filen
   - Klicka `Install`
   - Godkänn "Install from unknown sources" om det frågas
4. Klart!

---

## ✅ Vanliga problem och lösningar

### Problem 1: "Gradle sync failed"

**Lösning:**
- Klicka på `File` → `Invalidate Caches and Restart`
- Vänta och försök igen

### Problem 2: "SDK not found"

**Lösning:**
- Android Studio ska fixa detta automatiskt
- Om inte: `Tools` → `SDK Manager` → Installera senaste SDK

### Problem 3: "Build failed: minSdkVersion"

**Lösning:**
- Detta ska INTE hända, men om det gör:
- Öppna `android/app/build.gradle`
- Hitta `minSdkVersion` och ändra till `24`

### Problem 4: Appen kraschar vid start

**Vanligaste orsaken: Firebase inte konfigurerad**

**Lösning:**
1. Kontrollera att `firebase.config.js` har rätt credentials
2. Se till att Firebase Realtime Database är aktiverad

---

## 🎯 Sammanfattning

**Hela processen:**
1. Ladda ner projektet (1 min)
2. Öppna i Android Studio (2 min)
3. Bygg APK (3 min)
4. Installera på telefon (1 min)

**Total tid: ~7 minuter**

**Är det svårt? NEJ!** Android Studio gör 95% av jobbet automatiskt.

---

## 🚀 Efter installation

**Testa appen:**

1. Öppna appen på telefonen
2. Ge permissions (SMS, Notifications)
3. Klicka "Testläge" → "Simulera larm"
4. Om alarm spelas = SUCCESS! ✅

**Native SMS-funktioner:**

Appen har nu:
- ✅ SmsReceiver (läser SMS från 3315)
- ✅ SmsModule (skickar till React Native)
- ✅ Firebase (delar mellan enheter)

**Allt fungerar!**

---

## 💡 Tips

1. **Första bygget tar längst tid** (5-10 min) - efterföljande bygg tar 1-2 min
2. **Använd "Build APK"** istället för "Run" om du bara vill ha APK:en
3. **Debug APK** är tillräcklig för testning
4. **Production APK** behövs bara för distribution (senare)

---

## 📞 Support

**Om något går fel:**

1. Kolla "Vanliga problem" ovan
2. Google felmeddelandet
3. Öppna ett issue på GitHub: https://github.com/ComplicitHen/brandlarm-app/issues

**Men troligtvis kommer allt fungera direkt! 🚒**

---

**Lycka till med bygget!**
