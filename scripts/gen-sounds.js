// Synthesises the cue sounds described in the handoff (same recipes as the HTML's WebAudio).
// Usage: node scripts/gen-sounds.js  → writes assets/sounds/*.wav
const fs = require('fs');
const path = require('path');

const RATE = 22050;
const out = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(out, { recursive: true });

const sine = (f, t) => Math.sin(2 * Math.PI * f * t);
const triangle = (f, t) => 2 * Math.abs(2 * ((f * t) % 1) - 1) - 1;

// Short linear attack + exponential decay to ~-60 dB at `decay` seconds.
function tone(fn, decay, gain = 0.8) {
  const n = Math.ceil(RATE * (decay + 0.05));
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const env = Math.min(1, t / 0.005) * Math.exp((-6.9 * t) / decay);
    buf[i] = gain * env * fn(t);
  }
  return buf;
}

function concat(parts, gapSec) {
  const step = Math.round(gapSec * RATE);
  const len = step * (parts.length - 1) + parts[parts.length - 1].length;
  const buf = new Float32Array(Math.max(len, ...parts.map((p, i) => i * step + p.length)));
  parts.forEach((p, i) => p.forEach((v, j) => (buf[i * step + j] += v)));
  return buf;
}

function writeWav(name, buf) {
  const data = Buffer.alloc(buf.length * 2);
  buf.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(RATE, 24); h.writeUInt32LE(RATE * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(out, name), Buffer.concat([h, data]));
  console.log('wrote', name);
}

writeWav('campana.wav', tone((t) => 0.7 * sine(880, t) + 0.3 * sine(880 * 2.76, t) * Math.exp(-3 * t), 1.1));
writeWav('cristal.wav', tone((t) => 0.75 * sine(1568, t) + 0.25 * sine(3136, t), 0.6));
writeWav('madera.wav', tone((t) => triangle(440, t), 0.18, 0.9));
writeWav('soft-tick.wav', tone((t) => sine(523, t), 0.25, 0.3));
writeWav('final.wav', concat([660, 880, 1175].map((f) => tone((t) => sine(f, t), 0.5, 0.6)), 0.18));
writeWav('metronome.wav', tone((t) => sine(1200, t), 0.04, 0.35));
