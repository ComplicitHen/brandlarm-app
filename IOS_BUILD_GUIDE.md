# iOS Build & Distribution Guide 🍎

Komplett guide för att bygga och distribuera brandlarm-appen till iPhone.

---

## ⚠️ Viktiga begränsningar för iOS

### SMS-läsning fungerar INTE på iOS
- Apple tillåter INTE appar att läsa SMS
- iOS-versionen kan endast:
  - ✅ Ta emot larm från Firebase
  - ✅ Spela alarmljud
  - ✅ Visa larmhistorik
  - ✅ Dela larm mellan enheter
  - ❌ Läsa SMS från 3315

**Lösning**: En Android-telefon läser SMS och delar till Firebase → alla iOS-enheter får larmet!

---

## 📋 Krav

### 1. Apple Developer Account (Kostnad: $99/år)
- Gå till: https://developer.apple.com/programs/
- Registrera dig som utvecklare
- Betala $99/år (obligatoriskt för App Store-distribution)

### 2. Bygg-alternativ
Du behöver INTE en Mac! Expo EAS kan bygga i molnet.

**Alternativ A: EAS Build (Rekommenderat - ingen Mac behövs)** ✅
- Bygger i Expo:s moln
- Fungerar från Windows/Linux/Android/Termux
- Tar ~15-20 minuter

**Alternativ B: Lokal byggning (Kräver Mac)**
- Behöver Xcode på Mac
- Mer kontroll men krångligare

---

## 🚀 Steg-för-steg: Bygg för iOS

### Steg 1: Uppdatera app.json

Först måste vi konfigurera iOS-inställningar:

```bash
cd brandlarm-app
```

Lägg till detta i `app.json`:

```json
{
  "expo": {
    "name": "Brandlarm",
    "slug": "brandlarm-app",
    "version": "1.0.0",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.brandkaren.larmapp",
      "buildNumber": "1.0.0",
      "infoPlist": {
        "UIBackgroundModes": ["audio", "fetch"],
        "NSMicrophoneUsageDescription": "Vi spelar alarmljud även när appen är i bakgrunden",
        "NSUserTrackingUsageDescription": "Vi behöver inga tracking-permissions"
      }
    }
  }
}
```

### Steg 2: Logga in på Apple Developer

```bash
# Logga in på Expo
eas login

# Konfigurera Apple-credentials
eas credentials
```

Expo guidar dig genom:
1. Logga in med ditt Apple ID
2. Skapa App Store Connect API Key
3. Skapa Provisioning Profile
4. Skapa Push Notification Certificate

### Steg 3: Bygg för iOS

#### Development Build (för testning)
```bash
eas build --profile development --platform ios
```

Detta bygger en `.ipa`-fil som du kan installera via TestFlight.

#### Production Build (för App Store)
```bash
eas build --profile production --platform ios
```

---

## 📱 Distribuera till testare via TestFlight

TestFlight är Apples officiella beta-testningsplattform.

### Steg 1: Automatisk uppladdning till TestFlight

Lägg till detta i `eas.json`:

```json
{
  "build": {
    "production": {
      "ios": {
        "autoIncrement": true,
        "submitOnSuccess": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "DIN_APPLE_ID@gmail.com",
        "ascAppId": "DIN_APP_STORE_CONNECT_ID",
        "appleTeamId": "DITT_TEAM_ID"
      }
    }
  }
}
```

### Steg 2: Bygg och ladda upp

```bash
eas build --profile production --platform ios --auto-submit
```

Detta:
1. Bygger appen
2. Laddar upp till App Store Connect
3. Publicerar till TestFlight automatiskt

### Steg 3: Bjud in testare

1. Gå till https://appstoreconnect.apple.com/
2. Välj din app
3. Gå till TestFlight-fliken
4. Klicka "Add Testers"
5. Ange email-adresser till dina brandmän
6. De får en inbjudan via email

**Max 10,000 externa testare!**

---

## 🏪 Publicera till App Store

### Steg 1: Förbered App Store-listing

Gå till https://appstoreconnect.apple.com/

**Skapa ny app:**
1. Klicka "My Apps" → "+"
2. Välj "New App"
3. Fyll i:
   - Platform: iOS
   - Name: "Brandlarm"
   - Primary Language: Swedish
   - Bundle ID: com.brandkaren.larmapp
   - SKU: brandlarm-app-001

### Steg 2: App-information

**Beskrivning (svenska):**
```
En SMS-baserad larmapp för deltidsbrandmän.

FUNKTIONER:
• Tar emot larm via Firebase i realtid
• Höga alarmljud som går igenom tystläge
• Larmhistorik för alla utryckningar
• Tidsschema för aktiva timmar
• TOTALLARM-filter
• Anpassade ljudsignaler

OBS: SMS-läsning finns endast på Android. iOS-enheter tar emot larm som delas via Firebase från Android-enheter.

Perfekt för brandkårer som vill ha snabb och pålitlig larmfunktion!
```

**Keywords:**
```
brandlarm, brand, brandkår, larm, utryckning, sms, firebase, emergency
```

**Screenshots:**
- Ladda upp 3-5 screenshots från appen
- Krav: iPhone 6.7" och 5.5" (olika skärmstorlekar)

### Steg 3: Privacy Policy (obligatoriskt!)

Apple kräver en Privacy Policy. Här är en mall:

```markdown
# Sekretesspolicy för Brandlarm

## Datahantering
Brandlarm-appen lagrar följande data:
- Användarnamn och tjänstenummer (lokalt på enheten)
- Larmhistorik från brandkåren (Firebase Realtime Database)
- Ljudinställningar (lokalt på enheten)

## Datadelning
- Larmdata delas med andra användare i samma brandkår via Firebase
- Vi säljer ALDRIG användardata
- Ingen data skickas till tredje part

## Datalagring
- Användardata lagras i Firebase (Google Cloud, EU-region)
- Lokala inställningar lagras på enheten

## Kontakt
För frågor om sekretesspolicy, kontakta: [DIN EMAIL]
```

Publicera denna på en webbsida (GitHub Pages, Google Sites, etc.)

### Steg 4: Välj prissättning

**Gratis app:**
- Välj "Free"
- Tillgänglig i alla länder

**Betald app:**
- Välj pris (från 9 kr)
- Kräver skatteinfo

### Steg 5: Bygg och submit

```bash
# Bygg production-version
eas build --profile production --platform ios

# Submitta till App Store
eas submit --platform ios
```

### Steg 6: Vänta på godkännande

Apple granskar appen (tar 1-3 dagar):
- De testar funktionalitet
- Kontrollerar att privacy policy finns
- Verifierar att appen följer riktlinjer

**Vanliga avslag:**
- Saknar privacy policy ❌
- Appen kraschar ❌
- Bryter mot riktlinjer ❌

När godkänd: Appen är live på App Store! 🎉

---

## 🧪 Testa innan publicering

### TestFlight (Rekommenderat)

1. Bygg och ladda upp till TestFlight
2. Bjud in dina brandmän
3. De laddar ner "TestFlight" från App Store
4. De installerar din app via TestFlight
5. Samla feedback
6. Fixa buggar
7. Bygg ny version
8. Upprepa tills perfekt!

**Fördelar:**
- Snabb distribution
- Ingen godkännande-process
- Enkelt att uppdatera

### Ad Hoc Distribution (Manuell)

För upp till 100 enheter:

```bash
eas build --profile preview --platform ios
```

Installera via:
- Xcode
- Apple Configurator
- OTA-installation (kräver HTTPS-server)

---

## 💰 Kostnader

| Item | Kostnad |
|------|---------|
| Apple Developer Account | $99/år (obligatoriskt) |
| EAS Build | Gratis (upp till 30 byggen/månad) |
| Firebase | Gratis (free tier räcker) |
| **Total** | **$99/år** |

---

## 🔄 Uppdatera appen

När du har publicerat och vill uppdatera:

```bash
# 1. Uppdatera version i app.json
# "version": "1.0.1"
# "buildNumber": "2"

# 2. Bygg ny version
eas build --profile production --platform ios --auto-submit

# 3. Vänta på godkännande (1-3 dagar)

# 4. Publicera uppdateringen
```

Användare får uppdateringen via App Store automatiskt!

---

## 🚨 Troubleshooting

### "No bundle identifier found"
```bash
# Lägg till i app.json under "ios":
"bundleIdentifier": "com.brandkaren.larmapp"
```

### "Provisioning profile doesn't match"
```bash
# Ta bort gamla credentials
eas credentials

# Välj "Remove all credentials" → "Set up new"
```

### "Build failed"
```bash
# Kontrollera loggar
eas build:list

# Klicka på den failade builden
# Läs felmeddelandet
```

### "App rejected by Apple"
- Läs rejection-mailet noggrant
- Fixa problemet
- Submitta igen (ingen extra kostnad)

---

## 📚 Resurser

**Apple Developer:**
- https://developer.apple.com/

**App Store Connect:**
- https://appstoreconnect.apple.com/

**Expo EAS Docs:**
- https://docs.expo.dev/build/introduction/
- https://docs.expo.dev/submit/ios/

**TestFlight:**
- https://developer.apple.com/testflight/

---

## 🤔 Vanliga frågor

### Kan jag bygga iOS utan Mac?
**Ja!** EAS Build fungerar från vilken dator som helst (även Termux).

### Måste jag ha en iPhone för att bygga?
**Nej**, men du bör testa på en riktig iPhone innan publicering.

### Kan iOS läsa SMS?
**Nej**, Apple tillåter inte det. Använd Android för SMS-läsning.

### Hur många testare kan jag ha?
**10,000** via TestFlight. Gratis!

### Kan jag sälja appen?
**Ja**, men då behöver du också:
- Momsregistrering
- Skatteinfo till Apple
- Bokföring

### Vad händer om jag inte förnyar Developer Account?
Appen försvinner från App Store efter 30 dagar.

---

## ✅ Snabb checklista

- [ ] Apple Developer Account registrerad ($99)
- [ ] `app.json` uppdaterad med iOS-config
- [ ] `eas login` körd
- [ ] `eas credentials` konfigurerad
- [ ] Privacy Policy skapad
- [ ] Screenshots tagna
- [ ] App Store-beskrivning skriven
- [ ] TestFlight-testning genomförd
- [ ] Production build körd
- [ ] Submittat till App Store
- [ ] Godkänd av Apple ✅

---

**Behöver du hjälp med något specifikt steg? Fråga bara! 🍎🚒**
