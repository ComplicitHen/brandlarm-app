# ✅ Brandlarm-app - Implementeringschecklista

Använd denna checklista för att säkerställa att allt är konfigurerat korrekt.

---

## 📋 Pre-launch Checklista

### Firebase-konfiguration

- [ ] Firebase-projekt skapat på console.firebase.google.com
- [ ] Realtime Database aktiverad (europe-west1)
- [ ] Authentication aktiverad (Anonymous)
- [ ] Firebase config kopierad till `firebase.config.js`
- [ ] `databaseURL` finns i config
- [ ] Säkerhetsregler från `firebase-rules.json` publicerade

### Lokal installation

- [ ] `npm install` körd utan fel
- [ ] Ljudfil finns i `assets/sounds/alarm.wav`
- [ ] `npx expo start` fungerar
- [ ] Firebase initialiseras (kontrollera console)

### Testing

- [ ] Testläge fungerar
- [ ] Simulering av larm fungerar
- [ ] Alarmljud spelas
- [ ] Notifikationer visas
- [ ] Firebase tar emot larm (kontrollera console.firebase.google.com)

### Development Build

- [ ] EAS CLI installerad (`npm install -g eas-cli`)
- [ ] Inloggad på Expo (`eas login`)
- [ ] Development build körd (`eas build --profile development --platform android`)
- [ ] APK nedladdad och installerad på Android-enhet
- [ ] Appen öppnas utan krascher

### Permissions (På fysisk enhet)

- [ ] SMS-läsning godkänd
- [ ] Notifikationer godkända
- [ ] Batterioptimering inaktiverad
- [ ] App kan köras i bakgrunden

### Funktionalitet

- [ ] SMS från 3315 detekteras
- [ ] TOTALLARM parseas korrekt
- [ ] Vanligt larm parseas korrekt
- [ ] Larm publiceras till Firebase
- [ ] Larm visas i historik
- [ ] Flera enheter får larm samtidigt
- [ ] Tidsschema fungerar
- [ ] Alarmljud går igenom tystläge
- [ ] Vibration fungerar

---

## 🔥 Production Checklist

### Säkerhet

- [ ] Firebase-regler verifierade
- [ ] API-nycklar ej committade till public repo
- [ ] GDPR-compliance för SMS-data

### Performance

- [ ] Batteriförbrukning testad över 24h
- [ ] App fungerar i bakgrunden
- [ ] Ingen memory leak
- [ ] Firebase-kostnader övervakas

### User Experience

- [ ] Onboarding tydlig
- [ ] Fel-meddelanden hjälpsamma
- [ ] Alla inställningar sparas
- [ ] App återstartar korrekt efter reboot

### Deployment

- [ ] Production build körd (`eas build --profile production --platform android`)
- [ ] App signerad med production key
- [ ] Version bumpad i `app.json`
- [ ] Play Store-listing förberedd (beskrivning, screenshots)
- [ ] Privacy Policy skapad
- [ ] Testgrupp beta-testar appen

### iOS (Valfritt)

- [ ] iOS bundleIdentifier konfigurerad
- [ ] Apple Developer-konto aktivt
- [ ] iOS build körd
- [ ] Testad på iOS-enhet
- [ ] App Store-listing förberedd

---

## 🐛 Troubleshooting Checklist

### Firebase fungerar inte

- [ ] Internet-anslutning aktiv?
- [ ] Firebase config korrekt?
- [ ] Database URL korrekt?
- [ ] Authentication aktiverad?
- [ ] Säkerhetsregler korrekt?

### SMS läses inte

- [ ] Development Build (ej Expo Go)?
- [ ] SMS-permissions godkända?
- [ ] SMS från exakt "3315"?
- [ ] SMS-format matchar parser?
- [ ] Native SMS-listener implementerad?

### Larm spelas inte

- [ ] Ljudfiler finns?
- [ ] Volym ej på 0?
- [ ] Telefon ej i tystläge?
- [ ] "Stör ej" inaktiverat?
- [ ] Notifikations-permissions godkända?

### App stannar i bakgrunden

- [ ] Batterioptimering inaktiverad?
- [ ] Background restrictions avaktiverade?
- [ ] Autostart aktiverat (Xiaomi, Huawei)?
- [ ] App låst i recent apps?

---

## 📊 Success Metrics

### Efter 1 vecka

- [ ] Alla brandmän har installerat appen
- [ ] Minst 1 TOTALLARM testat framgångsrikt
- [ ] Feedback insamlad
- [ ] Buggar dokumenterade

### Efter 1 månad

- [ ] 95%+ uptime
- [ ] <5 sekunder latency från SMS till larm
- [ ] Nöjdhet >4/5
- [ ] Inga missade larm

---

## 🎯 Optimeringar för framtiden

- [ ] Push till iOS-enheter via APNs
- [ ] Kartvy med larmposition
- [ ] Integration med brandkårens schema-system
- [ ] Kvittering när brandman bekräftar larm
- [ ] Statistik över utryckningar
- [ ] Export av larmhistorik till Excel
- [ ] Darkmode

---

**Lycka till! 🚒**
