/**
 * Inside The Starry Night: two vortices of night turning overhead, wheat
 * breathing below, the cypress a dark flame at your shoulder, the village
 * asleep at the far side, Venus enormous and low. Words: letters 691, 783,
 * 777 via docs/research/starry-night.md.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;

export default {
  slug: 'starry-night',
  seed: 1889,
  background: 0x070b18,
  fog: [0x070b18, 12, 55],
  camera: { radius: 9, height: 2.2, speed: 0.03, bob: 0.4, lookHeight: 4.6 },

  strokes: [
    { // the sky: two turning vortices
      count: 5200,
      home: (i, r) => {
        const s = i % 2;
        const cx = s ? 4 : -3.5, cy = s ? 9.5 : 8, cz = s ? 2.5 : -2, R = s ? 3.4 : 5.2;
        const a = r() * TAU;
        const rr = Math.pow(r(), 0.6) * R;
        return [
          cx + Math.cos(a) * rr,
          cy + Math.sin(a * 2) * 0.9 + (r() - 0.5) * 1.3,
          cz + Math.sin(a) * rr * 0.75,
        ];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.13) return [0.95, 0.8, 0.4];
        if (p < 0.2) return [0.95, 0.95, 0.98];
        const v = 0.75 + r() * 0.25;
        return [0.42 * v, 0.55 * v, 0.95 * v];
      },
      size: [0.4, 1.3],
      orbit: { radius: [0.3, 1.3], speed: [0.08, 0.3] },
      opacity: 0.5,
    },
    { // far stars on the dome
      count: 260,
      home: (i, r) => {
        const a = r() * TAU, el = 0.15 + r() * 0.7, R = 15 + r() * 6;
        return [Math.cos(a) * Math.cos(el) * R, 3 + Math.sin(el) * R, Math.sin(a) * Math.cos(el) * R];
      },
      color: (i, r) => (r() < 0.5 ? [0.98, 0.88, 0.6] : [0.85, 0.9, 1]),
      size: [1.2, 2.6],
      orbit: { radius: [0.05, 0.2], speed: [0.02, 0.08] },
      opacity: 0.8,
    },
    { // the wheat field below
      count: 4200,
      home: (i, r) => {
        const a = r() * TAU, rr = 3 + Math.pow(r(), 0.7) * 14;
        return [Math.cos(a) * rr, -1.3 + r() * 1.5, Math.sin(a) * rr];
      },
      color: (i, r) => {
        const p = r();
        return p < 0.6 ? [0.5 + r() * 0.3, 0.42, 0.12] : [0.16, 0.3, 0.14];
      },
      size: [0.3, 0.8],
      orbit: { radius: [0.06, 0.22], speed: [0.1, 0.4] },
      opacity: 0.34,
    },
    { // the cypress — a flame of darkness (normal blending: it occludes light)
      count: 1100,
      home: (i, r) => {
        const [x0, , z0] = az(205, 6.2, 0);
        const h = r();
        const rr = (1 - h) * 1.5 + 0.15;
        const a = r() * TAU;
        return [x0 + Math.cos(a) * rr, h * 8 - 1.2, z0 + Math.sin(a) * rr];
      },
      color: (i, r) => (r() < 0.6 ? [0.02, 0.07, 0.03] : [0.05, 0.14, 0.06]),
      size: [0.5, 1.2],
      orbit: { radius: [0.05, 0.2], speed: [0.15, 0.4] },
      opacity: 0.9,
      blending: 'normal',
    },
    { // the sleeping village: warm windows far across the field
      count: 90,
      home: (i, r) => {
        const [x0, , z0] = az(330, 9.5, 0);
        return [x0 + (r() - 0.5) * 4, -0.5 + r() * 1.1, z0 + (r() - 0.5) * 4];
      },
      color: () => [0.98, 0.75, 0.35],
      size: [0.5, 1.1],
      orbit: { radius: [0.02, 0.06], speed: [0.05, 0.15] },
      opacity: 0.85,
    },
  ],

  glows: [
    { pos: az(80, 15, 11), color: 0xffe9a8, size: 5, opacity: 0.5 },   // the moon
    { pos: az(20, 9.5, 5.5), color: 0xbfe0ff, size: 3.6, opacity: 0.65 }, // Venus
    { pos: az(330, 9.5, 0.2), color: 0xffc37a, size: 3, opacity: 0.2 },   // village warmth
  ],

  nodes: [
    { id: 'sky', pos: [-3.5, 8, -2], color: 0xffe6a0, size: 1.7, reach: 5 },
    { id: 'cypress', pos: az(205, 5.4, 4.2), color: 0x9fd8a8, size: 1.4, reach: 5 },
    { id: 'village', pos: az(330, 8.6, 0.4), color: 0xffd27a, size: 1.4, reach: 5 },
    { id: 'venus', pos: az(20, 9.5, 5.5), color: 0xcfe6ff, size: 1.2, reach: 5.5 },
  ],

  music: {
    root: 146.83, // D3
    scale: [0, 3, 5, 7, 10],
    brightness: 0.55,
    padLevel: 0.05,
    pluckEvery: [6, 14],
    timbre: 'triangle',
  },
};
