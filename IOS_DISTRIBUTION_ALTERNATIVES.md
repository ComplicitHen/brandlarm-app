# iOS Distribution - Alternativ till App Store 🍎

Komplett guide för att distribuera iOS-appen utan att publicera på App Store.

---

## 💰 Kostnadsjämförelse

| Metod | Kostnad/år | Max användare | Giltighetstid | Bäst för |
|-------|-----------|---------------|---------------|----------|
| **TestFlight** | $99 | 10,000 | 90 dagar/build | Brandkårer (REKOMMENDERAT) ✅ |
| **Ad Hoc** | $99 | 100 enheter | 1 år | Små grupper |
| **Enterprise** | $299 | Obegränsat | 1 år | Stora organisationer (500+ anställda) |
| **App Store** | $99 | Obegränsat | Permanent | Publik distribution |
| **Sideloading** | $0 | Obegränsat | 7 dagar | Utvecklare/experimentellt ⚠️ |

---

## ✅ REKOMMENDATION: TestFlight (Perfekt för brandkårer!)

### Fördelar:
- ✅ Upp till **10,000 testare** (mer än tillräckligt!)
- ✅ Ingen App Store-granskning (snabbare)
- ✅ Enkelt att uppdatera
- ✅ Användare får pushnotiser vid uppdateringar
- ✅ Professionell lösning
- ✅ Ingen godkännandeprocess

### Nackdelar:
- ❌ Kräver Apple Developer Account ($99/år)
- ❌ Varje build är giltig i 90 dagar (måste bygga om var 3:e månad)
- ❌ Användare måste installera TestFlight-appen först

### Hur det fungerar:

```bash
# 1. Bygg och ladda upp automatiskt
eas build --profile production --platform ios --auto-submit

# 2. Gå till App Store Connect
# 3. Lägg till testare via email

# 4. De får inbjudan → laddar ner TestFlight → installerar appen
```

### För brandmännen:

**Steg 1:** Ladda ner "TestFlight" från App Store (gratis)

**Steg 2:** Öppna inbjudan du fick via email

**Steg 3:** Klicka "Installera" i TestFlight

**Steg 4:** Klart! Appen fungerar exakt som vanlig

### Uppdatera appen:

```bash
# Bygg ny version (t.ex. var 80:e dag)
eas build --profile production --platform ios --auto-submit

# Alla användare får notis automatiskt!
```

**Kostnad: $99/år för hela brandkåren!**

---

## 2️⃣ Ad Hoc Distribution

### Fördelar:
- ✅ Ingen 90-dagars begränsning
- ✅ Fungerar i 1 år
- ✅ Ingen extra app (TestFlight) behövs

### Nackdelar:
- ❌ Max **100 enheter**
- ❌ Kräver Apple Developer Account ($99/år)
- ❌ Måste registrera varje enhets UDID manuellt
- ❌ Krångligare installation

### Hur det fungerar:

**Steg 1: Samla in UDID från alla iPhones**

Användaren öppnar: https://get.udid.io/
Skickar sin UDID till dig

**Steg 2: Registrera alla UDID i Apple Developer Portal**

```bash
eas device:create
# Lägg till alla UDID
```

**Steg 3: Bygg med registrerade enheter**

```bash
eas build --profile preview --platform ios
```

**Steg 4: Distribuera IPA-fil**

- Via email
- Via intern webbserver
- Via USB + Xcode/Apple Configurator

**Kostnad: $99/år**

---

## 3️⃣ Apple Developer Enterprise Program

### Fördelar:
- ✅ Obegränsat antal användare
- ✅ Intern distribution
- ✅ Full kontroll

### Nackdelar:
- ❌ Kostar **$299/år**
- ❌ Kräver att du är en stor organisation (500+ anställda)
- ❌ Kräver D-U-N-S nummer
- ❌ Granskningsprocess för att kvalificera

### Krav:
- Legal entity (AB, kommun, etc.)
- 500+ anställda
- D-U-N-S nummer (gratis men tar tid)

**Inte aktuellt för en brandkår** (för dyrt och krångligt)

---

## 4️⃣ Sideloading (GRATIS men opraktiskt)

### AltStore / TrollStore

Detta är **INTE officiellt** från Apple men fungerar tekniskt.

### Fördelar:
- ✅ Helt gratis ($0)
- ✅ Ingen Apple Developer Account
- ✅ Obegränsat antal enheter

### Nackdelar:
- ❌ Måste förnyas var **7:e dag**
- ❌ Kräver dator ansluten
- ❌ Inte pålitligt för kritiska appar
- ❌ Kan sluta fungera när Apple uppdaterar iOS
- ❌ **INTE LÄMPLIGT FÖR BRANDLARM!** 🚨

### Hur det fungerar:

1. Installera AltStore på din iPhone
2. Installera AltServer på din dator
3. Håll datorn påslagen och ansluten till samma WiFi
4. AltStore förnyar appen automatiskt var 7:e dag

**REKOMMENDERAS INTE** för en brandlarm-app som måste fungera 24/7!

---

## 5️⃣ Web App (Progressive Web App)

Ett helt annat alternativ: gör det till en webbapp!

### Fördelar:
- ✅ Helt gratis
- ✅ Fungerar på iOS Safari
- ✅ Kan läggas till på hemskärmen
- ✅ Pushnotiser stöds (iOS 16.4+)
- ✅ Ingen App Store eller TestFlight

### Nackdelar:
- ❌ Kan inte läsa SMS (samma som native iOS)
- ❌ Begränsad bakgrundsfunktionalitet
- ❌ Kräver webb-hosting

Detta kan vara intressant om ni redan har Android-enheter som läser SMS!

---

## 🏆 MIN REKOMMENDATION FÖR ER BRANDKÅR

### TestFlight är det bästa alternativet:

**Varför:**
1. **$99/år för HELA brandkåren** (oavsett storlek)
2. **10,000 testare** (ni behöver troligen 10-50)
3. **Enkelt att använda** (alla brandmän kan det)
4. **Professionellt** (Apple officiell lösning)
5. **Inga krångel** med UDID, sideloading, etc.

**Hur ofta måste ni bygga om?**
- Var 90:e dag (tar 15 minuter)
- Eller när ni vill uppdatera appen
- Helt automatiskt via ett kommando

**Workflow:**
```bash
# Var 80:e dag (för säkerhets skull):
eas build --profile production --platform ios --auto-submit

# Klart! Alla får uppdateringen automatiskt
```

---

## 💡 Alternativ upplägg för er brandkår

### Scenario 1: Mest kostnadseffektivt

**Android-enheter endast:**
- Kräver INGEN Apple Developer Account
- SMS-läsning fungerar
- Google Play Console: $25 engångsavgift (eller intern distribution gratis)

**Kostnad: $25 en gång (eller $0 med intern distribution)**

### Scenario 2: Blandad miljö (REKOMMENDERAT)

**Android-enheter:**
- Läser SMS från 3315
- Delar via Firebase

**iOS-enheter:**
- Tar emot från Firebase via TestFlight
- Spelar alarmljud

**Kostnad: $99/år för iOS + $0-25 för Android**

### Scenario 3: Endast iOS (ej rekommenderat)

- Kan INTE läsa SMS automatiskt
- Måste ha minst 1 Android-enhet eller manuell inmatning

---

## 📊 Kostnadsjämförelse för 20 brandmän

| Lösning | Kostnad | Installation | Underhåll |
|---------|---------|--------------|-----------|
| **TestFlight** | $99/år | Enkel | Ombyggnad var 90:e dag |
| **Ad Hoc** | $99/år | Svår (UDID) | Enkel när installerad |
| **Sideloading** | $0 | Mycket svår | Förnya var 7:e dag ❌ |
| **App Store** | $99/år | Enklast | Ingen (permanent) |

---

## 🤔 Vanliga frågor

### Kan vi undvika $99-avgiften helt?
**Nej**, inte för en pålitlig lösning. Sideloading fungerar men är opraktiskt för kritiska appar.

### Vad händer om vi slutar betala?
Efter 1 år fungerar inte appen längre på iOS-enheter. Android fortsätter fungera.

### Kan vi dela mellan flera brandkårer?
**Ja!** Med TestFlight kan 10,000 personer använda samma build. Perfekt för region/kommun-bred distribution.

### Måste alla ha samma iOS-version?
Nej, appen fungerar på iOS 13+ (nästan alla iPhones från 2015+)

### Hur lång tid tar TestFlight-installation för användare?
**~2 minuter:**
1. Ladda ner TestFlight (30 sek)
2. Öppna inbjudan (10 sek)
3. Installera appen (1 min)
4. Klart!

---

## ✅ Min slutsats

För en brandkår med 10-50 medlemmar:

### Bästa lösningen:

**Android + iOS via TestFlight**

**Setup:**
1. Köp Apple Developer Account: **$99/år**
2. Bygg Android Development Build (gratis)
3. Bygg iOS för TestFlight (gratis)
4. Distribuera till alla brandmän

**Årlig kostnad:** $99/år

**Fördelar:**
- Fungerar på alla enheter
- SMS-läsning på Android
- Firebase-delning till alla
- Professionell lösning
- Enkelt underhåll

**Detta är exakt vad brandkårer världen över använder!** 🚒🔥

---

## 📞 Nästa steg

Om ni väljer TestFlight:

```bash
# 1. Registrera Apple Developer Account
https://developer.apple.com/programs/

# 2. Bygg för TestFlight
eas build --profile production --platform ios --auto-submit

# 3. Bjud in alla brandmän via email

# Klart!
```

**Vill du att jag guidar dig genom Apple Developer-registreringen? Eller har du andra frågor?**
