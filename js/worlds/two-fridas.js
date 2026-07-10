/**
 * Inside The Two Fridas: a storm-dome sky, and below it two pillars of
 * weather — bone-white lace and Tehuana earth — hearts beating out of
 * time, one vein between them, hands joined at a warmth that never dims.
 * Words: her diary via docs/research/two-fridas.md. Ceiling: the held
 * hands, never the wound, carry the close.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;
const LEFT = az(150, 4.5, 0);
const RIGHT = az(210, 4.5, 0);
const HEART_L = [LEFT[0], 2.6, LEFT[2]];
const HEART_R = [RIGHT[0], 2.6, RIGHT[2]];
const HANDS = az(180, 3.9, 1.2);

export default {
  slug: 'two-fridas',
  seed: 1939,
  background: 0x131c1e,
  fog: [0x131c1e, 9, 40],
  camera: { radius: 7.5, height: 2.2, speed: 0.028, bob: 0.3, lookHeight: 2.6 },

  strokes: [
    { // the storm, churning overhead
      count: 5200,
      home: (i, r) => {
        const a = r() * TAU, el = 0.1 + r() * 0.85, R = 10 + r() * 6;
        return [Math.cos(a) * Math.cos(el) * R, 1 + Math.sin(el) * R * 0.8, Math.sin(a) * Math.cos(el) * R];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.5) return [0.22, 0.28, 0.3];
        if (p < 0.85) return [0.32, 0.4, 0.42];
        return [0.5, 0.55, 0.55];
      },
      size: [0.8, 2.2],
      orbit: { radius: [0.3, 1.1], speed: [0.05, 0.16] },
      opacity: 0.3,
    },
    { // the white presence — lace
      count: 950,
      home: (i, r) => {
        const h = r();
        const rr = (1.4 - h * 0.9) * (0.4 + r() * 0.8);
        const a = r() * TAU;
        return [LEFT[0] + Math.cos(a) * rr, h * 4.6, LEFT[2] + Math.sin(a) * rr];
      },
      color: (i, r) => [0.9, 0.87 - r() * 0.06, 0.76],
      size: [0.35, 0.95],
      orbit: { radius: [0.08, 0.3], speed: [0.08, 0.25] },
      opacity: 0.5,
    },
    { // the Tehuana presence — earth, teal, carmine
      count: 950,
      home: (i, r) => {
        const h = r();
        const rr = (1.4 - h * 0.9) * (0.4 + r() * 0.8);
        const a = r() * TAU;
        return [RIGHT[0] + Math.cos(a) * rr, h * 4.6, RIGHT[2] + Math.sin(a) * rr];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.4) return [0.16, 0.45, 0.4];
        if (p < 0.75) return [0.55, 0.32, 0.14];
        return [0.72, 0.14, 0.2];
      },
      size: [0.35, 0.95],
      orbit: { radius: [0.08, 0.3], speed: [0.08, 0.25] },
      opacity: 0.55,
    },
    { // the vein: one line of life between the hearts, arcing high
      count: 160,
      home: (i, r) => {
        const t = i / 159;
        const x = HEART_L[0] + (HEART_R[0] - HEART_L[0]) * t;
        const z = HEART_L[2] + (HEART_R[2] - HEART_L[2]) * t;
        const y = 2.6 + Math.sin(t * Math.PI) * 1.7 + (r() - 0.5) * 0.15;
        return [x + (r() - 0.5) * 0.15, y, z + (r() - 0.5) * 0.15];
      },
      color: (i, r) => [0.8, 0.12 + r() * 0.08, 0.18],
      size: [0.3, 0.6],
      orbit: { radius: [0.02, 0.08], speed: [0.1, 0.3] },
      opacity: 0.85,
    },
  ],

  glows: [
    { pos: HEART_L, color: 0xe8455a, size: 1.7, opacity: 0.55 },
    { pos: HEART_R, color: 0xd63050, size: 1.5, opacity: 0.6 },
    { pos: HANDS, color: 0xffc27a, size: 1.3, opacity: 0.7 },   // the answer
    { pos: [RIGHT[0] + 0.7, 1.8, RIGHT[2] + 0.5], color: 0xffd9a0, size: 0.7, opacity: 0.5 }, // the locket
  ],

  nodes: [
    { id: 'vein', pos: [az(180, 3.9, 0)[0], 4.3, az(180, 3.9, 0)[2]], color: 0xff9aa4, size: 1.1, reach: 2.6 },
    { id: 'hands', pos: HANDS, color: 0xffc27a, size: 1.0, reach: 2.4 },
    { id: 'torn', pos: HEART_L, color: 0xe8455a, size: 1.0, reach: 2.6 },
    { id: 'locket', pos: [RIGHT[0] + 0.7, 1.8, RIGHT[2] + 0.5], color: 0xffd9a0, size: 0.9, reach: 2.4 },
  ],

  music: {
    root: 110, // A2
    scale: [0, 3, 5, 7, 8],
    brightness: 0.4,
    padLevel: 0.05,
    pluckEvery: [7, 16],
    timbre: 'triangle',
  },
};
