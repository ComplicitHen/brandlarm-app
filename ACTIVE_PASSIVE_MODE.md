# Aktivt vs Passivt Läge 🚨📱

Förklaring av de två enhetsläge i brandlarm-appen.

---

## 🎯 Översikt

Appen stöder nu två lägen:

| Läge | Läser SMS | Skickar till Firebase | Tar emot från Firebase | Bäst för |
|------|-----------|----------------------|----------------------|----------|
| **🚨 Aktiv Larmstation** | ✅ Ja | ✅ Ja | ✅ Ja | Dedikerade larmstationer |
| **📱 Passiv Mottagare** | ❌ Nej | ❌ Nej | ✅ Ja | Personliga telefoner |

---

## 🚨 Aktivt Läge (Larmstation)

### Vad den gör:
1. **Läser SMS från 3315**
2. **Parsear larmdata**
3. **Skickar till Firebase**
4. **Tar emot från Firebase** (får även larm från andra larmstationer)
5. **Spelar alarmljud**

### Perfekt för:
- ✅ Gamla Android-telefoner som larmstationer
- ✅ Brandstationen
- ✅ Brandchefens hem
- ✅ Enheter som är inkopplade 24/7

### Exempel-setup:
```
3 larmstationer (Aktivt läge)
↓
Läser SMS från 3315
↓
Skickar till Firebase
↓
Alla enheter får larmet
```

---

## 📱 Passivt Läge (Mottagare)

### Vad den gör:
1. **Tar emot från Firebase**
2. **Spelar alarmljud**
3. **Visar larmhistorik**

### Läser INTE:
- ❌ Läser inte SMS
- ❌ Kräver inte SMS-permissions
- ❌ Skickar inte till Firebase

### Perfekt för:
- ✅ Personliga telefoner
- ✅ Telefoner utan SIM-kort
- ✅ Telefoner där du inte vill ge SMS-permissions
- ✅ Backup-enheter

### Exempel:
```
Brandman Johans personliga telefon (Passivt läge)
↓
Tar emot från Firebase
↓
Spelar alarmljud
```

---

## 🔄 Hur det fungerar tillsammans

### Scenario: Brandkår med 20 brandmän

**Setup:**

**3 Aktiva larmstationer:**
- Larmstation 1: Brandstationen (läser SMS)
- Larmstation 2: Brandchef hem (läser SMS)
- Larmstation 3: Vice chef hem (läser SMS)

**17 Passiva mottagare:**
- Brandmännens personliga Android-telefoner
- Tar emot från Firebase
- Spelar alarmljud

**Flöde:**
```
SMS från 3315
  ↓
Larmstation 1, 2 eller 3 läser SMS
  ↓
Parsear och skickar till Firebase
  ↓
Firebase distribuerar till ALLA 20 enheter
  ↓
Alla 20 enheter spelar alarmljud samtidigt!
```

---

## ⚙️ Hur du byter läge

### I appen:

**Steg 1:** Öppna appen

**Steg 2:** Scrolla till "Enhetsläge"-kortet

**Steg 3:** Välj läge:

**För larmstation:**
```
Tryck på "🚨 Aktiv Larmstation"
→ Läser SMS + Firebase
```

**För personlig telefon:**
```
Tryck på "📱 Passiv Mottagare"
→ Endast Firebase
```

**Steg 4:** Inställningen sparas automatiskt!

---

## 🔧 Tekniska detaljer

### Aktivt läge:

**Kräver:**
- SMS-läsning permission ✅
- Notifikationer permission ✅
- Batterioptimering OFF ✅
- SIM-kort med SMS-mottagning ✅
- Firebase-anslutning ✅

**Funktionalitet:**
```javascript
SMS mottaget från 3315
→ parseSMS(message, sender)
→ publishAlarm(alarmData) → Firebase
→ Firebase notifierar alla enheter
→ playAlarmSound()
```

### Passivt läge:

**Kräver:**
- Firebase-anslutning ✅
- Notifikationer permission (rekommenderat)

**Behöver INTE:**
- ❌ SMS-läsning permission
- ❌ SIM-kort
- ❌ Batterioptimering OFF (men rekommenderat)

**Funktionalitet:**
```javascript
Firebase.onValue('alarms')
→ Ny larm detekterad
→ playAlarmSound()
```

---

## 📊 Fördelar med detta system

### Redundans:
- Om en larmstation missar SMS får de andra det
- Flera källor ökar pålitligheten

### Flexibilitet:
- Brandmän kan använda personliga telefoner utan att ge SMS-permissions
- Fungerar även utan SIM-kort (WiFi-only)

### Kostnadseffektivt:
- Gamla telefoner som larmstationer (gratis)
- Personliga telefoner behöver inte SIM-kort

### Skalbarhet:
- Lägg till fler larmstationer vid behov
- Obegränsat antal passiva mottagare

---

## 🧪 Testning

### Testa Aktivt läge:

1. Sätt enhet till "Aktiv Larmstation"
2. Aktivera SMS-övervakning
3. Klicka "Simulera larm från 3315"
4. Verifiera att:
   - Alarm spelas på denna enhet ✅
   - Larm visas i Firebase (kontrollera andra enheter) ✅

### Testa Passivt läge:

1. Sätt enhet till "Passiv Mottagare"
2. På en annan enhet (Aktiv): Simulera larm
3. Verifiera att:
   - Passiv enhet får larmet från Firebase ✅
   - Alarm spelas på passiv enhet ✅
   - Ingen SMS läses på passiv enhet ✅

---

## 💡 Rekommenderade setups

### Liten brandkår (5-10 brandmän):
```
1 Aktiv larmstation (brandstationen)
9 Passiva mottagare (personliga telefoner)
```

### Medelstor brandkår (10-30 brandmän):
```
3 Aktiva larmstationer (brandstation + 2 hem)
27 Passiva mottagare (personliga telefoner)
```

### Stor brandkår (30+ brandmän):
```
5 Aktiva larmstationer (strategiskt placerade)
X Passiva mottagare (alla personliga telefoner)
```

---

## 🤔 Vanliga frågor

### Kan jag byta läge när som helst?
**Ja!** Bara tryck på knappen i appen.

### Behöver jag starta om appen efter byte?
**Nej**, ändringen sker direkt.

### Vad händer om alla larmstationer är i passivt läge?
**Ingen läser SMS** - minst 1 enhet måste vara i aktivt läge!

### Kan en personlig telefon vara aktiv?
**Ja**, men då läser den SMS från din egen telefon. Rekommenderas inte.

### Fungerar passivt läge utan internet?
**Nej**, passivt läge kräver Firebase-anslutning (WiFi eller mobildata).

### Kostar passivt läge mer data?
**Nej**, Firebase använder minimal data (~1-5 MB/månad).

---

## ✅ Best Practices

### För larmstationer (Aktivt läge):
1. Använd gamla telefoner du inte använder
2. Håll inkopplade 24/7
3. Inaktivera batterioptimering
4. Placera nära WiFi-router
5. Testa månadsvis

### För personliga telefoner (Passivt läge):
1. Sätt till passivt läge som standard
2. Aktivera notifikationer
3. Testa att du får larm
4. Håll appen uppdaterad

---

## 🎯 Sammanfattning

**Aktivt läge = Larmstation** 🚨
- Läser SMS
- Skickar till Firebase
- För dedikerade enheter

**Passivt läge = Mottagare** 📱
- Tar emot från Firebase
- För personliga telefoner

**Bästa setup:**
- 2-5 aktiva larmstationer
- Alla andra passiva mottagare
- Maximal pålitlighet + flexibilitet!

---

**Detta är exakt hur professionella brandkårer sätter upp sina larmsystem!** 🚒🔥
