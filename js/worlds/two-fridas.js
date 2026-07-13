/**
 * Inside The Two Fridas — Frida Kahlo's world, as feeling.
 *
 * Not a grey double portrait but the emotional landscape beneath it: a
 * warm, intimate garden of magical realism. Roots and vines climb from
 * below, flowers bloom and breathe in rich reds and magentas, butterflies
 * drift and flutter, and at the heart of it two joined hearts beat, linked
 * by a single living vein — the friend who never left. Words: her diary
 * via docs/research/two-fridas.md. Ceiling: the joined hearts and the
 * butterflies carry the close, never the wound.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;
const HEART_L = [-1.6, 2.6, 0.4];
const HEART_R = [1.6, 2.6, 0.4];
const HANDS = [0, 1.0, 1.6];
const LOCKET = [2.4, 1.6, 1.0];

const FLOWERS = [
  { pos: [-3.2, 1.2, 1], hue: [0.85, 0.15, 0.25] },   // deep red
  { pos: [3.0, 1.0, 0.5], hue: [0.9, 0.3, 0.55] },    // magenta
  { pos: [-2.0, 0.4, 2.2], hue: [0.95, 0.55, 0.15] }, // orange
  { pos: [2.2, 0.6, 2.4], hue: [0.95, 0.8, 0.2] },    // yellow
  { pos: [-4.0, 2.0, -0.5], hue: [0.8, 0.2, 0.4] },
  { pos: [4.0, 1.8, -0.5], hue: [0.7, 0.15, 0.5] },
  { pos: [0, 0.2, 3.0], hue: [0.95, 0.4, 0.5] },
];
const BUTTERFLIES = [
  { c: [0.95, 0.5, 0.15], p: 0 },
  { c: [0.9, 0.25, 0.5], p: 1.6 },
  { c: [0.95, 0.8, 0.3], p: 3.1 },
  { c: [0.7, 0.3, 0.7], p: 4.5 },
];

// a butterfly: two wing lobes of vivid strokes in the XY plane
function butterfly() {
  return (i, r) => {
    const side = i % 2 ? 1 : -1;
    const a = r() * Math.PI - Math.PI / 2;
    const rr = Math.pow(r(), 0.6) * 0.6;
    return [side * (0.15 + Math.abs(Math.cos(a)) * rr), Math.sin(a) * rr, (r() - 0.5) * 0.1];
  };
}

export default {
  slug: 'two-fridas',
  seed: 1939,
  background: 0x2a1420,
  fog: [0x2a1420, 14, 64],
  camera: { radius: 8, height: 2.2, speed: 0.024, bob: 0.3, lookHeight: 2.0 },

  strokes: [
    // ---- the warm, moody sky, softly churning ----
    {
      name: 'sky', count: 3400,
      home: (i, r) => {
        const a = r() * TAU, el = 0.2 + r() * 0.8, R = 12 + r() * 10;
        return [Math.cos(a) * Math.cos(el) * R, 3 + Math.sin(el) * R * 0.8, Math.sin(a) * Math.cos(el) * R - 4];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.4) return [0.28, 0.12, 0.18];    // deep wine
        if (p < 0.8) return [0.4, 0.22, 0.28];      // dusk rose
        return [0.6, 0.35, 0.3];                     // warm cloud edge
      },
      size: [0.8, 2.2], aspect: [2.2, 3.4],
      angle: (i, rnd, h) => Math.atan2(h[2], h[0]) + Math.PI / 2 + (rnd() - 0.5) * 0.7,
      orbit: { radius: [0.3, 1.2], speed: [0.05, 0.16] },
      opacity: 0.34,
    },

    // ---- roots climbing from below ----
    {
      name: 'roots', count: 2600,
      home: (i, r) => {
        const a = r() * TAU, spread = 2 + r() * 9;
        const t = r();
        return [Math.cos(a) * spread, -6 + t * 6, Math.sin(a) * spread];
      },
      color: (i, r) => (r() < 0.5 ? [0.25, 0.1, 0.08] : [0.15, 0.22, 0.1]),
      size: [0.5, 1.4], aspect: [2.8, 4.4], angle: 'vertical',
      orbit: { radius: [0.06, 0.3], speed: [0.05, 0.16] },
      opacity: 0.6, blending: 'normal',
    },

    // ---- climbing vines, deep green ----
    {
      name: 'vines', count: 1400,
      home: (i, r) => {
        const strand = Math.floor(r() * 10);
        const t = r();
        const base = (strand - 5) * 1.4;
        return [base + Math.sin(t * 5 + strand) * 1.2, -2 + t * 7, Math.cos(t * 4 + strand) * 1.2 - 1];
      },
      color: (i, r) => [0.12 + r() * 0.1, 0.4 + r() * 0.2, 0.16],
      size: [0.4, 1.0], aspect: [2.6, 4.0], angle: 'vertical',
      orbit: { radius: [0.05, 0.2], speed: [0.06, 0.2] },
      opacity: 0.5, blending: 'normal',
    },

    // ---- flowers that bloom and breathe (each named) ----
    ...FLOWERS.map((f, fi) => ({
      name: `flower${fi}`, origin: f.pos, count: 90,
      home: (i, r) => {
        // petals radiating from a center
        const petal = Math.floor(r() * 6);
        const a = (petal / 6) * TAU + (r() - 0.5) * 0.4;
        const rr = 0.15 + Math.pow(r(), 0.5) * 0.7;
        return [Math.cos(a) * rr, Math.sin(a) * rr, (r() - 0.5) * 0.2];
      },
      color: (i, r) => (r() < 0.15 ? [0.98, 0.85, 0.3] : f.hue.map((c) => c * (0.7 + r() * 0.5))),
      size: [0.6, 1.3], aspect: [2.0, 3.2], angle: 'flow',
      orbit: { radius: [0.02, 0.08], speed: [0.03, 0.1] },
      opacity: 0.85,
    })),

    // ---- butterflies, drifting and fluttering (each named) ----
    ...BUTTERFLIES.map((b, bi) => ({
      name: `fly${bi}`, origin: [0, 3, 0], count: 40,
      home: butterfly(),
      color: (i, r) => (i % 5 === 0 ? [0.05, 0.03, 0.03] : b.c.map((c) => c * (0.75 + r() * 0.4))),
      size: [0.4, 0.9], aspect: [1.6, 2.4], angle: (i) => (i % 2 ? 0.6 : -0.6),
      orbit: { radius: [0.01, 0.04], speed: [0.05, 0.15] },
      opacity: 0.9,
    })),

    // ---- the two hearts, exposed, at the emotional center ----
    ...[HEART_L, HEART_R].map((pos, k) => ({
      name: k === 0 ? 'heartL' : 'heartR', origin: pos, count: 220,
      home: (i, r) => {
        const a = r() * TAU, rr = Math.pow(r(), 0.5) * 0.55;
        return [Math.cos(a) * rr, Math.sin(a) * rr, (r() - 0.5) * 0.35];
      },
      color: (i, r) => [0.85, 0.14 + r() * 0.12, 0.2],
      size: [0.4, 0.9], aspect: [1.8, 2.8], angle: 'flow',
      orbit: { radius: [0.03, 0.12], speed: [0.1, 0.3] },
      opacity: 0.9, blending: 'normal',
    })),

    // ---- the living vein between the hearts, down to the locket ----
    {
      name: 'vein', count: 300,
      home: (i, r) => {
        const t = i / 300;
        if (t < 0.6) {
          const u = t / 0.6;
          const x = HEART_L[0] + (HEART_R[0] - HEART_L[0]) * u;
          const y = 2.6 + Math.sin(u * Math.PI) * 1.4;
          return [x + (r() - 0.5) * 0.12, y, HEART_L[2] + (r() - 0.5) * 0.12];
        }
        const u = (t - 0.6) / 0.4;
        return [HEART_R[0] + (LOCKET[0] - HEART_R[0]) * u, 2.6 + (LOCKET[1] - 2.6) * u,
          HEART_R[2] + (LOCKET[2] - HEART_R[2]) * u];
      },
      color: (i, r) => [0.8, 0.12 + r() * 0.1, 0.18],
      size: [0.3, 0.6], aspect: [2.0, 3.0], angle: 'flow',
      orbit: { radius: [0.02, 0.08], speed: [0.1, 0.3] },
      opacity: 0.82,
    },
  ],

  glows: [
    { pos: HEART_L, color: 0xe8455a, size: 2.2, opacity: 0.5 },
    { pos: HEART_R, color: 0xd63050, size: 2.0, opacity: 0.55 },
    { pos: HANDS, color: 0xffc27a, size: 1.8, opacity: 0.7 },     // the warmth that holds
    { pos: LOCKET, color: 0xffd9a0, size: 1.0, opacity: 0.55 },
    { pos: [0, 4, -3], color: 0x6a2a3a, size: 12, opacity: 0.18 }, // warm interior light
  ],

  nodes: [
    { id: 'vein', pos: [0, 4.0, 0.4], color: 0xff9aa4, size: 1.3, reach: 3 },
    { id: 'hands', pos: HANDS, color: 0xffc27a, size: 1.2, reach: 2.8 },
    { id: 'torn', pos: HEART_L, color: 0xe8455a, size: 1.2, reach: 2.8 },
    { id: 'locket', pos: LOCKET, color: 0xffd9a0, size: 1.0, reach: 2.6 },
  ],

  onTick(clock, tempo, api) {
    // two hearts beating slightly out of time
    const beat = (ph) => 1 + Math.pow(Math.max(0, Math.sin(clock * 1.4 * tempo + ph)), 3) * 0.5;
    const hL = api.field('heartL'); const hR = api.field('heartR');
    if (hL) hL.scale.setScalar(beat(0));
    if (hR) hR.scale.setScalar(beat(0.9));

    // flowers bloom and breathe
    for (let i = 0; i < FLOWERS.length; i++) {
      const fl = api.field(`flower${i}`);
      if (fl) {
        const open = 0.8 + 0.35 * (0.5 + 0.5 * Math.sin(clock * 0.5 * tempo + i * 1.3));
        fl.scale.setScalar(open);
        fl.rotation.z = Math.sin(clock * 0.2 + i) * 0.15;
      }
    }

    // butterflies drift on slow paths and flutter their wings
    for (let i = 0; i < BUTTERFLIES.length; i++) {
      const fly = api.field(`fly${i}`);
      if (!fly) continue;
      const ph = BUTTERFLIES[i].p;
      const t = clock * 0.3 * tempo + ph;
      fly.position.set(
        Math.sin(t * 0.7) * 4.5 + Math.cos(t * 1.3) * 1.5,
        2.5 + Math.sin(t) * 1.6,
        1 + Math.cos(t * 0.9) * 3,
      );
      const flap = 0.35 + 0.65 * Math.abs(Math.sin(clock * 6 * tempo + ph));
      fly.scale.set(flap, 1, 1);
      fly.rotation.y = Math.atan2(Math.cos(t * 0.7), 1) + Math.sin(t) * 0.3;
    }

    // vines sway
    const vines = api.field('vines');
    if (vines) vines.rotation.z = Math.sin(clock * 0.4 * tempo) * 0.03;
  },

  music: {
    root: 110, scale: [0, 3, 5, 7, 8], brightness: 0.45,
    padLevel: 0.05, pluckEvery: [7, 16], timbre: 'triangle',
  },
};
