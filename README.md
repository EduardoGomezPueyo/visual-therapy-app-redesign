# BeEffic · Terapia visual: redesign concept

> Unsolicited concept redesign of the BeEffic visual therapy patient app, made by a patient who uses it daily. Not affiliated with or endorsed by BeEffic.

I'm a product designer, and I do my visual therapy exercises with this app every day. This repo is a working prototype of how I think it should work, built with Expo, React Native and TypeScript.

| Current app | Redesign |
|---|---|
| <img src="docs/screenshots/before-today-plan.jpeg" width="260" alt="Current app: today's plan"> | <img src="docs/screenshots/01-today-plan-updated.jpeg" width="260" alt="Redesign: today's plan with the plan-updated banner"> |
| <img src="docs/screenshots/before-exercise-running.jpeg" width="260" alt="Current app: running exercise with a single timer"> | <img src="docs/screenshots/06-exercise-running.jpeg" width="260" alt="Redesign: running exercise with the segmented block ring"> |

## The problem

Many of my exercises are measured by **time and repetitions**, and are split into parts: sitting, then standing; left eye, then right eye. The current app gives me nothing that tells me **when it's time to move to the next part**. I end up watching a clock instead of doing the exercise.

## What I changed

- **Exercises split into blocks.** Each exercise is a sequence of timed blocks, each with its own short instruction.
- **Sound cues for every block change.** The number of tones matches the block you're starting (two tones means block 2), so you know where you are without looking at the screen. A pre-warning comes before each change and a different cue plays at the end.
- **Visual block progress**: a segmented ring shows the current block and the time left.
- **A friendlier, more modern visual design** across the whole flow: today's plan, mood check-in, exercise guide and instructions, the exercise itself, then a short self-assessment and a report for the therapist.
- **A block editor for the therapist** (design only): the therapist splits each exercise into blocks, writes the instruction for each one, and leaves notes the patient sees in the app.

## The flow

| | | |
|---|---|---|
| <img src="docs/screenshots/01-today-plan-updated.jpeg" width="220" alt="Today's plan"><br>Today's plan | <img src="docs/screenshots/02-plan-update-sheet.jpeg" width="220" alt="Plan update sheet"><br>What the therapist changed | <img src="docs/screenshots/03-mood-checkin-b.jpeg" width="220" alt="Mood check-in"><br>Mood check-in |
| <img src="docs/screenshots/04-exercise-guide.jpeg" width="220" alt="Exercise guide"><br>Exercise guide | <img src="docs/screenshots/05-instructions.jpeg" width="220" alt="Instructions"><br>Instructions | <img src="docs/screenshots/06-exercise-running.jpeg" width="220" alt="Running exercise"><br>Exercise in blocks |
| <img src="docs/screenshots/07-block-change.jpeg" width="220" alt="Block change overlay"><br>Block change | <img src="docs/screenshots/09-exercise-done.jpeg" width="220" alt="Exercise done"><br>Exercise done | <img src="docs/screenshots/08-self-assessment.jpeg" width="220" alt="Self-assessment"><br>Self-assessment |
| <img src="docs/screenshots/10-session-end.jpeg" width="220" alt="End of session"><br>End of session | | |

## The therapist side

> Design concept only. This screen isn't part of the Expo prototype.

The blocks come from the therapist. In this editor they set the exercise's total time, repetitions and metronome, then split it into blocks, each with an instruction for the patient, a duration, the eye and the position. The footer checks that the blocks add up to the total and reminds them that the patient will hear N tones when block N starts.

<img src="docs/screenshots/therapist-set-exercise.png" alt="Therapist editor: Pelota de Marsden split into 4 blocks, with notes for the patient and a change log">

It's the other half of the patient screens above. These are the same four blocks the patient runs through (*Bloque 2 de 4 · Pelota quieta*), and the note about block 3 is the one shown during the exercise. Adding block 4 is logged under *Anotaciones y cambios*, and it's the change behind the "plan updated" banner on the patient's home screen.

## Run it

```bash
npm install
npx expo start          # press "w" for the browser, or scan the QR code with Expo Go
```

Everything except background audio works in the browser and in Expo Go. To build an installable Android APK:

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview   # cloud build, outputs a .apk download link
```

## Demo tips

- Tap the **EG avatar** to open *Modo demostración*. It resets the day either to the "plan updated by the therapist" state (4 exercises and a banner) or to the normal plan (3 exercises).
- During an exercise, **⏭** jumps to the next block, so you can see the block-change overlay and hear the cues without waiting. On the last block, it finishes the exercise.
- Tap **60 BPM** to mute or unmute the metronome.
- When the report is sent, the mock payload is logged to the console.

## Structure

| Path | What |
|---|---|
| `src/app/` | Screens (Expo Router routes): today's plan, mood check-in, exercise guide, instructions, running exercise, settings, exercise done, self-assessment, end of session |
| `src/components/` | Shared UI: segment ring, mood picker, week card, note input |
| `src/data/plan.ts` | Mock exercises and plan, shaped so a backend could replace it |
| `src/store.tsx` | App state, persisted in AsyncStorage |
| `src/audio.ts` | Block-change cues, pre-warning, final cue, metronome with ducking |
| `scripts/gen-sounds.js` | Synthesises `assets/sounds/*.wav` (`npm run gen-sounds`) |

## Known gaps

- Only *Pelota de Marsden* has full copy. The other exercises' instructions and blocks are placeholders.
- The logo and exercise videos are placeholders.
- The therapist editor is a static design. The prototype's plan and blocks come from mock data in `src/data/plan.ts`.
- The timer runs in JavaScript, so cues don't play reliably while the phone is locked. A production version would need an Android foreground service.
