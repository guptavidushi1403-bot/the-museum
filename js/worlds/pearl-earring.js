/**
 * Inside Girl with a Pearl Earring — the painting's own elements, in 3D.
 *
 * The quietest world: near-black space that was once deep green. She is
 * present in it — the blue-and-lemon turban wound above, the turned face
 * held in warm light, the white collar, and the pearl: a small bright drop
 * you can come close to, down to its two strokes of white. No quoted words
 * exist and none are used; every reveal is an environmental sense-line from
 * docs/research/pearl-earring.md. The absence is the room's story.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;
const HER = [0, 1.7, 0];        // she sits at the world's heart
const PEARL = [0.55, 1.15, 0.7];

export default {
  slug: 'pearl-earring',
  seed: 1665,
  background: 0x05060b,
  fog: [0x05060b, 5, 26],
  camera: { radius: 4.2, height: 1.7, speed: 0.018, bob: 0.15, lookHeight: 1.6 },

  strokes: [
    // ---- the dark that was green: deep glaze filling the far space ----
    {
      count: 2600,
      home: (i, r) => {
        const a = r() * TAU, el = Math.acos(r() * 2 - 1), R = 6 + r() * 14;
        return [Math.sin(el) * Math.cos(a) * R, Math.cos(el) * R, Math.sin(el) * Math.sin(a) * R];
      },
      color: (i, r) => [0.03, 0.1 + r() * 0.06, 0.06],
      size: [1.0, 3.0],
      orbit: { radius: [0.1, 0.4], speed: [0.01, 0.05] },
      opacity: 0.35,
      blending: 'normal',
    },
    // dust in candlelight, close
    {
      count: 700,
      home: (i, r) => {
        const a = r() * TAU, rr = 1.2 + r() * 5;
        return [Math.cos(a) * rr, r() * 4 - 0.5, Math.sin(a) * rr];
      },
      color: (i, r) => (r() < 0.7 ? [0.7, 0.6, 0.42] : [0.5, 0.55, 0.62]),
      size: [0.12, 0.4],
      orbit: { radius: [0.1, 0.5], speed: [0.03, 0.1] },
      opacity: 0.4,
    },

    // ---- the face: a turning of warm light where she looks out ----
    {
      name: 'face', origin: HER, count: 900,
      home: (i, r) => {
        const a = r() * TAU, rr = Math.pow(r(), 0.6) * 0.75;
        return [Math.cos(a) * rr * 0.85, Math.sin(a) * rr, (r() - 0.5) * 0.4 + 0.1];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.15) return [0.85, 0.5, 0.45];   // lips
        return [0.75 + r() * 0.2, 0.6 + r() * 0.15, 0.5];  // lit skin
      },
      size: [0.3, 0.9],
      orbit: { radius: [0.02, 0.08], speed: [0.02, 0.08] },
      opacity: 0.6,
    },

    // ---- the turban: ultramarine wound above ----
    {
      origin: [HER[0], HER[1] + 0.65, HER[2]], count: 700,
      home: (i, r) => {
        const a = Math.PI * (1.05 + r() * 0.9);   // wraps over the head
        const rr = 0.7 + r() * 0.15;
        return [Math.cos(a) * rr, Math.sin(a) * rr * 0.6, (r() - 0.5) * 0.5];
      },
      color: (i, r) => [0.13, 0.28 + r() * 0.12, 0.72 + r() * 0.15],
      size: [0.35, 0.9],
      orbit: { radius: [0.02, 0.08], speed: [0.03, 0.1] },
      opacity: 0.8,
    },
    // the lemon fall of cloth behind
    {
      origin: [HER[0] + 0.5, HER[1] + 0.3, HER[2] - 0.2], count: 340,
      home: (i, r) => [(r() - 0.5) * 0.5, -r() * 1.6, (r() - 0.5) * 0.4],
      color: (i, r) => [0.86, 0.74 + r() * 0.1, 0.32],
      size: [0.3, 0.8],
      orbit: { radius: [0.01, 0.06], speed: [0.02, 0.08] },
      opacity: 0.7,
    },

    // ---- the white collar ----
    {
      origin: [HER[0], HER[1] - 0.55, HER[2] + 0.1], count: 260,
      home: (i, r) => {
        const a = r() * Math.PI - Math.PI / 2;
        return [Math.cos(a) * 0.6, Math.sin(a) * 0.2, 0.2 + (r() - 0.5) * 0.3];
      },
      color: () => [0.9, 0.88, 0.82],
      size: [0.3, 0.7],
      orbit: { radius: [0.01, 0.05], speed: [0.02, 0.08] },
      opacity: 0.55,
    },

    // ---- the pearl: two strokes of white, close enough to reach ----
    {
      origin: PEARL, count: 60,
      home: (i, r) => {
        if (i < 20) return [(r() - 0.5) * 0.12, 0.06 + (r() - 0.5) * 0.05, (r() - 0.5) * 0.08]; // highlight
        const a = r() * TAU, rr = Math.pow(r(), 0.6) * 0.16;
        return [Math.cos(a) * rr, Math.sin(a) * rr, (r() - 0.5) * 0.1];
      },
      color: (i) => (i < 20 ? [0.95, 0.96, 0.98] : [0.55, 0.62, 0.72]),
      size: [0.25, 0.7],
      orbit: { radius: [0.005, 0.02], speed: [0.05, 0.15] },
      opacity: 0.9,
    },
  ],

  glows: [
    { pos: [HER[0] - 0.1, HER[1], HER[2] + 0.3], color: 0xd8a668, size: 3.2, opacity: 0.4 }, // candlelight on her
    { pos: PEARL, color: 0xcfe0f2, size: 0.7, opacity: 0.9 },   // the pearl
  ],

  nodes: [
    { id: 'pearl', pos: PEARL, color: 0xcfe0f2, size: 0.6, reach: 1.6 },
    { id: 'gaze', pos: [HER[0], HER[1] + 0.05, HER[2] + 0.3], color: 0xe0b984, size: 0.8, reach: 1.8 },
    { id: 'blue', pos: [HER[0], HER[1] + 0.9, HER[2]], color: 0x4a6fd8, size: 0.8, reach: 1.8 },
    { id: 'darkness', pos: az(200, 6, 2), color: 0x2c4a35, size: 1.4, reach: 4 },
  ],

  music: {
    root: 261.63, scale: [0, 4, 7, 11], brightness: 0.3,
    padLevel: 0.03, pluckEvery: [9, 18], timbre: 'sine',
  },
};
