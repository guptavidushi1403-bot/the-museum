/**
 * Inside Girl with a Pearl Earring: the smallest, quietest world — a dark
 * room that remembers being green, dust in candlelight, a turning of
 * warmth where a face would be, ultramarine and lemon above it, and the
 * pearl: two strokes of white. No quoted words exist, and none are used;
 * every reveal is an environmental sense-line from
 * docs/research/pearl-earring.md. The absence is the room's story.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;
const HER = az(0, 2.8, 0);

export default {
  slug: 'pearl-earring',
  seed: 1665,
  background: 0x04050a,
  fog: [0x04050a, 4, 18],
  camera: { radius: 3.8, height: 1.6, speed: 0.02, bob: 0.15 },

  strokes: [
    { // dust in candlelight
      count: 900,
      home: (i, r) => {
        const a = r() * TAU, rr = 1.5 + r() * 5.5;
        return [Math.cos(a) * rr, r() * 4.5 - 0.5, Math.sin(a) * rr];
      },
      color: (i, r) => (r() < 0.7 ? [0.7, 0.6, 0.42] : [0.5, 0.55, 0.62]),
      size: [0.1, 0.35],
      orbit: { radius: [0.1, 0.5], speed: [0.03, 0.1] },
      opacity: 0.4,
    },
    { // the dark that was green: deep glaze at the world's far side
      count: 700,
      home: (i, r) => {
        const a = ((120 + r() * 140) * Math.PI) / 180;
        const rr = 4 + r() * 4;
        return [Math.cos(a) * rr, r() * 4, Math.sin(a) * rr];
      },
      color: (i, r) => [0.03, 0.1 + r() * 0.05, 0.06],
      size: [1.2, 2.8],
      orbit: { radius: [0.1, 0.3], speed: [0.02, 0.07] },
      opacity: 0.5,
      blending: 'normal',
    },
    { // the ultramarine, wound above the light
      count: 340,
      home: (i, r) => {
        const t = r() * Math.PI;
        const rr = 0.75 + r() * 0.2;
        return [HER[0] + Math.cos(t) * rr, 2.3 + Math.sin(t) * rr * 0.55, HER[2] + (r() - 0.5) * 0.5];
      },
      color: (i, r) => [0.15, 0.3 + r() * 0.1, 0.75],
      size: [0.3, 0.7],
      orbit: { radius: [0.03, 0.1], speed: [0.04, 0.12] },
      opacity: 0.75,
    },
    { // the lemon fall, behind
      count: 170,
      home: (i, r) => [
        HER[0] + 0.55 + (r() - 0.5) * 0.3,
        2.4 - r() * 1.3,
        HER[2] + 0.3 + (r() - 0.5) * 0.3,
      ],
      color: (i, r) => [0.85, 0.72 + r() * 0.1, 0.3],
      size: [0.25, 0.6],
      orbit: { radius: [0.02, 0.08], speed: [0.04, 0.1] },
      opacity: 0.7,
    },
  ],

  glows: [
    { pos: [HER[0], 1.7, HER[2]], color: 0xd8a668, size: 2.6, opacity: 0.4 },  // her light
    { pos: [HER[0] - 0.15, 1.5, HER[2] + 0.2], color: 0xb37d4e, size: 1.2, opacity: 0.35 },
    { pos: [HER[0] + 0.1, 1.05, HER[2] + 0.25], color: 0xcfe0f2, size: 0.4, opacity: 0.9 }, // the pearl
  ],

  nodes: [
    { id: 'pearl', pos: [HER[0] + 0.1, 1.05, HER[2] + 0.25], color: 0xcfe0f2, size: 0.5, reach: 1.5 },
    { id: 'gaze', pos: [HER[0], 2.0, HER[2]], color: 0xe0b984, size: 0.7, reach: 1.6 },
    { id: 'blue', pos: [HER[0] - 0.5, 2.75, HER[2] - 0.2], color: 0x4a6fd8, size: 0.7, reach: 1.6 },
    { id: 'darkness', pos: az(200, 5, 2), color: 0x2c4a35, size: 1.2, reach: 3.6 },
  ],

  music: {
    root: 261.63, // C4
    scale: [0, 4, 7, 11],
    brightness: 0.3,
    padLevel: 0.03,
    pluckEvery: [9, 18],
    timbre: 'sine',
  },
};
