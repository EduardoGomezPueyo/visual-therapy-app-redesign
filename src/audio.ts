import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { Settings, SoundName } from './store';

const sources = {
  Campana: require('../assets/sounds/campana.wav'),
  Cristal: require('../assets/sounds/cristal.wav'),
  Madera: require('../assets/sounds/madera.wav'),
  tick: require('../assets/sounds/soft-tick.wav'),
  final: require('../assets/sounds/final.wav'),
  metronome: require('../assets/sounds/metronome.wav'),
};
type Key = keyof typeof sources;

const TONE_GAP_MS = 320;
const POOL = 4; // chimes overlap (1.1 s decay, 320 ms apart), so keep a few players per sound

const pools: Partial<Record<Key, AudioPlayer[]>> = {};
const cursor: Partial<Record<Key, number>> = {};
let duckUntil = 0;
let modeSet = false;

function ensureMode() {
  if (modeSet) return;
  modeSet = true;
  setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'duckOthers' }).catch(() => {});
}

function play(key: Key, volume = 1) {
  ensureMode();
  const pool = (pools[key] ??= Array.from({ length: key === 'metronome' ? 2 : POOL }, () => createAudioPlayer(sources[key])));
  const i = (cursor[key] = ((cursor[key] ?? -1) + 1) % pool.length);
  const p = pool[i];
  p.volume = volume;
  p.seekTo(0).catch(() => {});
  p.play();
}

/** Block-change cue: N tones for block N (or 1 if countTones is off). Ducks the metronome meanwhile. */
export function playSegmentCue(n: number, settings: Pick<Settings, 'sound' | 'countTones'>) {
  const count = settings.countTones ? n : 1;
  duckUntil = Date.now() + count * TONE_GAP_MS + 900;
  for (let k = 0; k < count; k++) setTimeout(() => play(settings.sound), k * TONE_GAP_MS);
}

export function previewSound(sound: SoundName) {
  play(sound);
}

export function playPreWarn() {
  play('tick', 0.3);
}

export function playFinal() {
  duckUntil = Date.now() + 1200;
  play('final');
}

export function playMetronomeTick() {
  play('metronome', Date.now() < duckUntil ? 0.15 : 0.6);
}
