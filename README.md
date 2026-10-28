# BeEffic · Terapia visual (patient app mockup)

Expo + TypeScript + expo-router implementation of the Claude Design handoff in `../design_handoff_terapia_visual_app`.

## Run it

```bash
npm install
npx expo start          # press "w" for the browser, or scan the QR code
```

Everything except background audio works in the browser and in **Expo Go**. For an installable Android APK (what the handoff asks for):

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview   # cloud build, outputs a .apk download link
```

## Demo tips

- Tap the **EG avatar** to open *Modo demostración*. It resets the day to the "plan updated by the therapist" state (4 exercises, banner) or to the normal plan (3 exercises).
- During an exercise, **⏭** jumps to the next block, so you can show the block-change overlay and chimes without waiting 2 minutes. On the last block, it finishes the exercise.
- Tap **60 BPM** to mute or unmute the metronome.
- When the report is sent, the (mock) payload is logged to the console.

## Structure

| Path | What |
|---|---|
| `src/app/` | Screens (routes): `index` (3a/3b/4b + 4c sheet), `animo` (5a), `guia/[id]` (1a), `instrucciones/[id]` (5b), `ejercicio/[id]` (2a + 1e overlay), `ajustes` (2b), `terminado/[id]` (5c), `autoevaluacion` (5d), `fin` (5e) |
| `src/data/plan.ts` | Mock exercises and plan, shaped so a backend can replace it |
| `src/store.tsx` | App state, persisted in AsyncStorage |
| `src/audio.ts` | Block-change chimes (N tones = block N), pre-warning, final cue, metronome with ducking |
| `scripts/gen-sounds.js` | Synthesises `assets/sounds/*.wav` from the handoff's WebAudio recipes (`npm run gen-sounds`) |

## Known gaps

- Only *Pelota de Marsden* has final copy. The other exercises' instructions and blocks are placeholders.
- The logo and exercise videos are placeholders, as in the mockups.
- The timer is JS-driven, so chimes don't play reliably while the phone is locked. A production build needs an Android foreground service for that.
