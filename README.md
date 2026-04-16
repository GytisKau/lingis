# Lingis

https://lingis.web.app/

## Apie projektą

Lingis – tai individualizuota mokymosi ir poilsio programėlė, skirta padėti studentams efektyviau mokytis ir išvengti perdegimo.

Programėlė orientuota į dažniausiai pasitaikančių problemų sprendimą:

* perdegimas (burnout)
* poilsio trūkumas
* neefektyvus mokymasis

Tikslas – padėti vartotojui rasti balansą tarp produktyvumo ir poilsio.

## Naudojamos technologijos

* React
* Ionic Framework (naudojamas UI komponentams, kaip PWA)
* Firebase:
  * Authentication
  * Authentication Emulator

## Diegimas

```bash
npm install -g @ionic/cli
git clone https://github.com/GytisKau/lingis.git
cd lingis
npm install
```

## Paleidimas (Development)

```bash
ionic serve
```

Atidaro aplikaciją naršyklėje: http://localhost:8100

### Paleidimas su prieiga per tinklą

```bash
ionic serve --external
```

Galima atidaryti telefone: http://192.168.x.x:8100


## Firebase autentifikacija

Projektas šiuo metu naudoja:

* Firebase Authentication
* Firebase Authentication Emulator (lokaliam testavimui)

Prieš paleidžiant projektą įsitikinkite, kad Firebase emulatorius yra sukonfigūruotas ir paleistas.

### Firebase emulatoriaus paleidimas

```bash
npm install -g firebase-tools
firebase login
firebase emulators:start --only auth
```

Taip pat reikia atkomentuoti `src/utils/Firebase.ts` failo `24` eilutę:
```ts
connectAuthEmulator(auth, 'http://localhost:9099', {disableWarnings: true})
```

## PWA informacija

Projektas veikia kaip Progressive Web App (PWA). Ionic naudojamas tik vartotojo sąsajos komponentams.

## Komanda

Produkto vystymo projekto K626 komanda.
