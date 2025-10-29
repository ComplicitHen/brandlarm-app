# Android Larmstation - Setup Guide 📱🚨

Guide för att sätta upp gamla Android-telefoner som dedikerade larmstationer.

---

## 💡 Konceptet

**Ett smart sätt att distribuera larm inom brandkåren:**

```
SMS (3315) → Android Larmstation → Firebase → Alla Android-enheter
                    ↓                            ↓
              Spelar alarm                  Spelar alarm
```

**Fördelar:**
- ✅ Använd gamla Android-telefoner som ingen använder
- ✅ Placera larmstationer strategiskt (brandstationen, hemma, etc.)
- ✅ Alla får larm samtidigt via Firebase
- ✅ Billigare än att köpa nya enheter
- ✅ Ingen iOS-kostnad ($0 istället för $99/år)
- ✅ Redundans - flera larmstationer kan läsa SMS

---

## 📱 Lämpliga gamla telefoner

**Krav:**
- Android 6.0+ (2015+)
- Fungerar med skärmen trasig
- Kan ta emot SMS
- Kan ansluta till WiFi/4G

**Perfekta kandidater:**
- Gamla Samsung Galaxy (S6, S7, S8, etc.)
- Gamla Xiaomi
- Gamla OnePlus
- Gamla Motorola
- Gamla Sony Xperia

**Du behöver INTE:**
- Bra skärm
- Bra kamera
- Bra batteri (kan vara inkopplad)
- Nya Android-version

---

## 🔧 Setup: Förvandla gammal telefon till larmstation

### Steg 1: Förbered telefonen

**1. Factory reset (valfritt men rekommenderat)**
```
Settings → System → Reset → Factory data reset
```

**2. Sätt in SIM-kort**
- Kan vara vilket SIM som helst (behöver bara ta emot SMS från 3315)
- Behöver inte ha data (WiFi räcker)

**3. Anslut till WiFi**
```
Settings → Network & Internet → WiFi
```

**4. Ladda ner APK**
```
Överför brandlarm.apk från dator till telefonen
Eller ladda ner från intern server/Google Drive
```

**5. Installera appen**
```
Files → Downloads → brandlarm.apk → Install
(Aktivera "Install from unknown sources" om krävs)
```

### Steg 2: Konfigurera appen för larmstation

**1. Öppna appen första gången**

**2. Ange namn:**
```
"Larmstation - Brandstationen"
"Larmstation - Johans hem"
etc.
```

**3. Ge alla permissions:**
- ✅ SMS-läsning
- ✅ Notifikationer
- ✅ Batterioptimering OFF

**4. Aktivera "Larmstation Mode"** (om tillgänglig)
- Håller skärmen aktiv
- Visar stort larmstatus
- Optimerar för always-on

### Steg 3: Optimera för 24/7-drift

**1. Inaktivera batterioptimering**
```
Settings → Apps → Brandlarm → Battery → Unrestricted
```

**2. Förhindra att appen stängs**
```
Settings → Apps → Brandlarm → Battery → Don't optimize
Recent Apps → Lås appen (tryck på lock-ikonen)
```

**3. Håll skärmen på (valfritt)**
```
Developer Options → Stay awake (when charging)
```

**4. Inaktivera automatiska uppdateringar**
```
Settings → System → Developer Options → Auto-update OFF
```

**5. Öka volym till max**
```
Volume → Alarm volume → MAX
```

### Steg 4: Montering & placering

**Rekommenderade platser:**
1. **Brandstationen** - Central placering
2. **Brandchefen hem** - Backup
3. **Vice brandchef hem** - Extra backup
4. **Kommunens växel** - Om relevant

**Montering:**
- Väggfäste för tablet/telefon (~50 kr från Amazon/IKEA)
- USB-laddare permanent inkopplad
- Nära WiFi-router för bästa signal

**Tips:**
- Använd lång USB-kabel (2-3m)
- Placera där den inte är i vägen
- Sätt upp "Larmstation" skylt bredvid
- Testa signalstyrka (SMS + WiFi)

---

## 🔥 Firebase-mottagning (Fungerar redan!)

**Bra nyheter:** Appen kan redan ta emot larm från Firebase!

### Så här fungerar det:

**1. Android-enhet läser SMS från 3315**
```javascript
SMS mottaget → Parser SMS → Skickar till Firebase
```

**2. Firebase distribuerar till alla enheter**
```javascript
Firebase → Notifierar alla anslutna enheter → Alla spelar alarm
```

**3. Alla Android-enheter (inkl larmstationer) får larmet**
```javascript
Firebase-notis → Spela alarmljud → Vibrera → Visa notifikation
```

### Testa Firebase-mottagning:

**På larmstation (läser SMS):**
1. Aktivera SMS-övervakning
2. Simulera larm från 3315

**På andra enheter:**
1. Öppna appen
2. Kolla "Senaste larm" - du ska se larmet från larmstationen!
3. Om larm finns → Firebase fungerar! ✅

---

## 🎛️ Larmstation Mode (Dedikerad vy)

Jag lägger till en speciell "Larmstation Mode" som:

### Funktioner:
- 📊 Stor status-display
- 🟢 Grön = Övervakning aktiv
- 🔴 Röd = Larm aktivt
- 📱 SMS-status synlig
- 🔥 Firebase-status synlig
- ⏰ Senaste SMS-tid
- 📈 Statistik (antal larm idag/vecka)

### Aktivera Larmstation Mode:
```
Inställningar → Aktivera Larmstation Mode
```

### Exempel-vy:
```
┌─────────────────────────────┐
│   🚒 LARMSTATION AKTIV 🚒   │
│                             │
│   Status: 🟢 REDO          │
│                             │
│   SMS-mottagning: ✅         │
│   Firebase: ✅               │
│   Senaste test: 14:23       │
│                             │
│   Larm idag: 2              │
│   Larm denna vecka: 7       │
│                             │
│   Senaste larm:             │
│   🚨 TOTALLARM              │
│   Mölnlycke RIB             │
│   15:42                     │
└─────────────────────────────┘
```

---

## 💾 Backup & Redundans

### Setup med flera larmstationer:

**Scenario: 3 larmstationer**

```
Larmstation 1 (Brandstationen)
  ↓
Larmstation 2 (Brandchef hem)
  ↓
Larmstation 3 (Vice chef hem)
  ↓
  └→ Firebase → Alla brandmäns personliga telefoner
```

**Fördelar:**
- Om en station missar SMS får de andra det
- Alla skickar till Firebase
- Maximal pålitlighet

**Konfiguration:**
Alla tre enheter:
1. Har SIM-kort
2. Läser SMS från 3315
3. Skickar till Firebase
4. Spelar eget alarm

---

## 🔋 Batteriförbrukning & drift

### Rekommendation: Alltid inkopplad

**Setup:**
- Permanent USB-laddare inkopplad (5V 2A)
- Placera nära eluttag
- Använd kvalitets-USB-kabel

### Batteriförbrukning (om på batteri):

| Läge | Förbrukning | Drifttid (3000mAh batteri) |
|------|-------------|----------------------------|
| Skärm AV, standby | ~10mA | ~12 dagar |
| Skärm AV, aktiv | ~50mA | ~2.5 dagar |
| Skärm PÅ, dimmat | ~200mA | ~15 timmar |
| Skärm PÅ, fullt | ~500mA | ~6 timmar |

**Rekommendation:** Använd "Skärm AV, aktiv" och ha inkopplad.

---

## 📊 Monitorering & underhåll

### Daglig kontroll (automatisk):

Appen skickar automatiskt "heartbeat" till Firebase:
```javascript
Varje timme → "Larmstation X är online" → Firebase
```

Du kan se alla larmstationers status i appen under "System Status".

### Manuell test:

**Testa SMS-mottagning:**
1. Skicka test-SMS från din privata telefon till larmstationens nummer
2. Innehåll: "Larminformation från VRR Ledningscentral..."
3. Kontrollera att alarm triggas

**Testa Firebase-synk:**
1. Simulera larm på larmstation
2. Kolla att alla andra enheter får larmet
3. Kontrollera tidsfördröjning (<5 sekunder)

### Underhållsschema:

**Veckovis:**
- Kontrollera att alla larmstationer är online
- Testa simulerat larm

**Månadsvis:**
- Kontrollera WiFi-anslutning
- Kontrollera att SIM-kort fungerar
- Rengör enheten (damm)

**Årligen:**
- Byt USB-kabel om sliten
- Kontrollera att batteri inte svullnat

---

## 💰 Kostnad för setup

### Budget för 3 larmstationer:

| Item | Kostnad |
|------|---------|
| 3x gamla Android-telefoner | 0 kr (redan har) |
| 3x SIM-kort | 0-300 kr/mån (billigaste abonnemang) |
| 3x USB-laddare | 150 kr |
| 3x USB-kablar (3m) | 150 kr |
| 3x väggfästen | 150 kr |
| **Total engångskostnad** | **450 kr** |
| **Månadskostnad** | **0-300 kr** |

**Jämfört med iOS:**
- iOS: $99/år = ~1100 kr/år
- Android: ~450 kr engång + ~0-300 kr/mån = ~450-4050 kr/år

**Men med Android får ni SMS-läsning!** ✅

---

## 🎯 SIM-kort för larmstationer

### Billiga alternativ:

**1. Comviq Kontantkort**
- Kostnad: ~0 kr/mån (om ni inte ringer/smsär)
- SMS-mottagning: Gratis
- Perfekt för larmstation!

**2. Hallon**
- Från 49 kr/mån
- Obegränsad data

**3. Vimla**
- Från 69 kr/mån
- Bra täckning

**Tips:** SMS-mottagning är ALLTID gratis på alla operatörer!

---

## 🚀 Deployment-strategi

### Fas 1: Pilot (1-2 veckor)
```
1 larmstation → Brandstationen
2-3 brandmän → Personliga Android-telefoner
Testa i verklig drift
```

### Fas 2: Utökning (1 månad)
```
3 larmstationer → Brandstation + 2 hem
10 brandmän → Personliga telefoner
Samla feedback
```

### Fas 3: Full distribution (2-3 månader)
```
3-5 larmstationer
Alla brandmän med Android
Sök funding för iOS-enheter
```

### Fas 4: iOS (när budget finns)
```
Apple Developer Account: $99/år
TestFlight-distribution till iPhone-användare
```

---

## 📈 Finansieringsansökan

### Mall för ansökan till kommunen:

**Brandlarm-app för deltidsbrandkåren**

**Bakgrund:**
Vi har utvecklat en SMS-baserad larmapp som läser larm från 3315 och distribuerar till alla brandmäns enheter via Firebase.

**Nuläge:**
- ✅ Fungerande Android-app
- ✅ 3 larmstationer med gamla telefoner
- ✅ X brandmän använder egna Android-telefoner

**Behov:**
- Apple Developer Account: 1100 kr/år
- Möjliggör distribution till iPhone-användare
- Y brandmän har iPhone och kan inte använda appen idag

**Nytta:**
- Snabbare utryckning
- Alla får larm samtidigt
- Ökad säkerhet
- Professionell lösning

**Budget:**
1100 kr/år (Apple Developer Account)

---

## ✅ Sammanfattning

**Nuvarande setup (kostnadsfritt):**
- 3 gamla Android-telefoner som larmstationer
- Läser SMS från 3315
- Skickar till Firebase
- Alla Android-användare får larm

**Senare (när budget finns):**
- Lägg till iOS via TestFlight (1100 kr/år)
- Alla iPhone-användare får också larm

**Total kostnad just nu: ~450 kr engång + 0-300 kr/mån SIM**

**Detta är exakt hur många brandkårer börjar!** 🚒🔥

---

**Vill du att jag skapar "Larmstation Mode" i appen nu?** 📱
