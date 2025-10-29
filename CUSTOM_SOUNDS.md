# Anpassade Alarmsignaler

## Hur du använder egna ljudfiler

### Metod 1: Välj från telefonen (REKOMMENDERAD) 📱

1. Öppna appen
2. Gå till "🔊 Ljudinställningar"
3. Scrolla ner till "Egen alarmsignal"
4. Klicka "📁 Välj egen ljudfil"
5. Välj din ljudfil (MP3, WAV, OGG, AAC)
6. Klart! Appen använder nu ditt ljud

### Metod 2: Ladda ner från URL 🌐

Om du har en URL till ett ljud kan jag hjälpa dig ladda ner det:

**Skicka mig länken så här:**
```
Ladda ner detta ljud: [URL]
```

**Exempel på bra URL:er:**
- Fria ljudeffekter: https://freesound.org/
- Brandkårssirener: https://www.zapsplat.com/
- Egna ljudfiler på Dropbox/Google Drive

### Metod 3: Manuell installation 🔧

Om du har ljudfiler på din dator:

**För Android via Termux:**
```bash
# 1. Överför ljudfilen till Termux
termux-storage-get /data/data/com.termux/files/home/brandlarm-app/assets/sounds/my_alarm.wav

# 2. Eller använd adb
adb push my_alarm.wav /sdcard/Download/

# 3. Välj sedan filen i appen via filväljaren
```

**För iOS:**
- Överför ljudfil till iCloud Drive eller Files-appen
- Välj sedan i appen via filväljaren

---

## Rekommenderade ljudformat

✅ **Fungerar bra:**
- MP3 (bästa kompression)
- WAV (bästa kvalitet)
- AAC
- OGG

❌ **Fungerar INTE:**
- FLAC
- ALAC
- WMA

---

## Tips för bra alarmsignaler

### 🎵 Ljudegenskaper

- **Volym**: Välj ett högt ljud
- **Längd**: 5-30 sekunder
- **Stil**: Tydlig start, upprepande ton
- **Frekvens**: Högre toner hörs bättre när man sover

### 🔊 Rekommenderade ljud

1. **Klassisk brandsiren** - Traditionellt och igenkännligt
2. **Högt pipande** - Penetrerande och väckande
3. **Talsyntes** - "LARM! LARM! TOTALLARM!"
4. **Egna brandkårens signal** - Perfekt för igenkänning!

---

## Hitta fria ljudeffekter

### 🆓 Gratis ljudbibliotek

**Freesound.org**
- https://freesound.org/
- Sök: "fire alarm", "emergency siren", "alert"
- Licens: CC0 (fritt att använda)

**Zapsplat**
- https://www.zapsplat.com/
- Kategori: Emergency > Fire Alarms
- Kräver gratis registrering

**YouTube Audio Library**
- https://studio.youtube.com/
- Kategori: Sound Effects
- Helt gratis, ingen attribution krävs

**BBC Sound Effects**
- https://sound-effects.bbcrewind.co.uk/
- Sök: "alarm", "siren"
- Gratis för alla ändamål

---

## Exempel på bra larmsignaler

Om du vill att jag laddar ner specifika ljud, säg bara till!

**Här är några förslag:**
```
1. "Klassisk amerikansk brandsiren"
2. "Europeisk brandbilssignal"
3. "Högfrekvent alarmsignal"
4. "Svenska nödsignalen"
```

---

## Skapa eget ljud med talsyntes 🗣️

**Google Text-to-Speech:**
```
1. Gå till https://cloud.google.com/text-to-speech
2. Skriv: "LARM! TOTALLARM! Alla brandmän rycker ut!"
3. Välj svensk röst (sv-SE)
4. Ladda ner MP3
```

**Offline-alternativ (Android):**
```bash
# Använd termux-tts-speak
pkg install termux-api
echo "LARM TOTALLARM" | termux-tts-speak
```

---

## Felsökning 🔧

### Ljudet spelas inte

1. Kontrollera att filen är i ett stödformat (MP3/WAV/AAC)
2. Testa ljudet i annan app först
3. Kontrollera att filen inte är korrupt
4. Försök med en mindre fil (<5MB)

### Kan inte välja fil

1. Kontrollera fil-permissions i Android-inställningar
2. Flytta filen till Downloads-mappen
3. Använd en filhanterare-app (Google Files)

### Ljudet är för tyst

1. Öka volymen i appen (🔊 100%)
2. Redigera ljudfilen för att öka volymen
3. Använd en annan ljudfil med högre volym

---

## Dela ljud med brandkåren 🚒

Vill du dela ditt ljud med andra i brandkåren?

1. Ladda upp till Google Drive/Dropbox
2. Dela länken med kollegor
3. Alla kan ladda ner och använda samma signal!

---

**Behöver du hjälp att ladda ner ett specifikt ljud? Skicka bara URL:en så fixar jag det! 🎵**
