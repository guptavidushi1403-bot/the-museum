/**
 * Inside The Two Fridas — the painting's own elements, in 3D.
 *
 * Two seated figures face you across the world: one in bone-white lace,
 * one in Tehuana earth, each with an exposed heart. A single vein arcs
 * between the hearts and loops down to the surgical clamp on one side and
 * the small oval portrait on the other. Their hands are joined at a point
 * of warmth below. A grey storm churns behind them. Words: her diary via
 * docs/research/two-fridas.md. Ceiling: the joined hands, never the wound.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;
const LEFT = az(158, 5, 0);    // white Frida
const RIGHT = az(202, 5, 0);   // Tehuana Frida
const HEART_L = [LEFT[0], 2.4, LEFT[2] + 0.6];
const HEART_R = [RIGHT[0], 2.4, RIGHT[2] + 0.6];
const HANDS = [(LEFT[0] + RIGHT[0]) / 2, 0.6, ((LEFT[2] + RIGHT[2]) / 2) + 1.4];
const CLAMP = [LEFT[0] - 1.4, 0.9, LEFT[2] + 1.2];
const LOCKET = [RIGHT[0] + 1.4, 1.4, RIGHT[2] + 1.2];

// A seated figure: gown cone + shoulders + head, from strokes.
function figure(color, headTone) {
  return (i, r) => {
    const part = r();
    if (part < 0.6) {                        // gown, widening to the base
      const h = r();
      const a = r() * TAU;
      const rr = (1 - h) * 1.6 + 0.4;
      return [Math.cos(a) * rr, h * 3.0, Math.sin(a) * rr * 0.8];
    }
    if (part < 0.85) {                        // torso + shoulders
      const a = r() * TAU;
      return [Math.cos(a) * 0.9, 3.0 + r() * 0.9, Math.sin(a) * 0.5];
    }
    return [(r() - 0.5) * 0.7, 4.1 + r() * 0.8, (r() - 0.5) * 0.7]; // head
  };
}

export default {
  slug: 'two-fridas',
  seed: 1939,
  background: 0x14201f,
  fog: [0x14201f, 16, 70],
  camera: { radius: 10, height: 2.4, speed: 0.024, bob: 0.3, lookHeight: 2.4 },

  strokes: [
    // ---- the storm sky, churning behind ----
    {
      name: 'storm', count: 4200,
      home: (i, r) => {
        const a = r() * TAU, el = 0.1 + r() * 0.85, R = 12 + r() * 10;
        return [Math.cos(a) * Math.cos(el) * R, 2 + Math.sin(el) * R * 0.8, Math.sin(a) * Math.cos(el) * R - 6];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.5) return [0.2, 0.26, 0.28];
        if (p < 0.85) return [0.34, 0.42, 0.44];
        return [0.55, 0.6, 0.6];
      },
      size: [0.8, 2.2], aspect: [2.2, 3.4],
      angle: (i, rnd, h) => Math.atan2(h[2], h[0]) + Math.PI / 2 + (rnd() - 0.5) * 0.7,
      orbit: { radius: [0.3, 1.2], speed: [0.05, 0.16] },
      opacity: 0.34,
    },

    // ---- white Frida (lace) ----
    {
      origin: HEART_L.map((v, k) => (k === 1 ? -2.2 : v)), count: 1500,
      home: figure(),
      color: (i, r) => [0.82, 0.8 - r() * 0.08, 0.72],   // soft bone-white, not glaring
      size: [0.4, 1.1], aspect: [1.6, 2.6], angle: 'vertical',
      orbit: { radius: [0.05, 0.2], speed: [0.05, 0.18] },
      opacity: 0.82, blending: 'normal',
    },
    // ---- Tehuana Frida (earth/teal/carmine) ----
    {
      origin: HEART_R.map((v, k) => (k === 1 ? -2.2 : v)), count: 1500,
      home: figure(),
      color: (i, r) => {
        const p = r();
        if (p < 0.4) return [0.16, 0.45, 0.4];
        if (p < 0.72) return [0.55, 0.32, 0.14];
        return [0.72, 0.14, 0.2];
      },
      size: [0.4, 1.1], aspect: [1.6, 2.6], angle: 'vertical',
      orbit: { radius: [0.05, 0.2], speed: [0.05, 0.18] },
      opacity: 0.9, blending: 'normal',
    },

    // ---- the two hearts, exposed ----
    ...[HEART_L, HEART_R].map((pos, k) => ({
      name: k === 0 ? 'heartL' : 'heartR', origin: pos, count: 260,
      home: (i, r) => {
        const a = r() * TAU, rr = Math.pow(r(), 0.5) * 0.6;
        return [Math.cos(a) * rr, Math.sin(a) * rr, (r() - 0.5) * 0.4];
      },
      color: (i, r) => [0.8, 0.12 + r() * 0.1, 0.18],
      size: [0.3, 0.8],
      orbit: { radius: [0.05, 0.2], speed: [0.1, 0.3] },
      opacity: 0.85,
    })),

    // ---- the vein arcing between the hearts, then to clamp and locket ----
    {
      name: 'vein', count: 340,
      home: (i, r) => {
        const t = i / 340;
        if (t < 0.55) {                       // heart to heart, arcing high
          const u = t / 0.55;
          const x = HEART_L[0] + (HEART_R[0] - HEART_L[0]) * u;
          const z = HEART_L[2] + (HEART_R[2] - HEART_L[2]) * u;
          const y = 2.4 + Math.sin(u * Math.PI) * 1.6;
          return [x + (r() - 0.5) * 0.12, y, z + (r() - 0.5) * 0.12];
        }
        if (t < 0.78) {                       // left heart down to clamp
          const u = (t - 0.55) / 0.23;
          return [HEART_L[0] + (CLAMP[0] - HEART_L[0]) * u, 2.4 + (CLAMP[1] - 2.4) * u,
            HEART_L[2] + (CLAMP[2] - HEART_L[2]) * u];
        }
        const u = (t - 0.78) / 0.22;          // right heart down to locket
        return [HEART_R[0] + (LOCKET[0] - HEART_R[0]) * u, 2.4 + (LOCKET[1] - 2.4) * u,
          HEART_R[2] + (LOCKET[2] - HEART_R[2]) * u];
      },
      color: (i, r) => [0.78, 0.1 + r() * 0.1, 0.16],
      size: [0.25, 0.55],
      orbit: { radius: [0.02, 0.08], speed: [0.1, 0.3] },
      opacity: 0.8,
    },
  ],

  glows: [
    { pos: HEART_L, color: 0xe8455a, size: 2.0, opacity: 0.5 },
    { pos: HEART_R, color: 0xd63050, size: 1.9, opacity: 0.55 },
    { pos: HANDS, color: 0xffc27a, size: 1.6, opacity: 0.7 },     // the answer
    { pos: LOCKET, color: 0xffd9a0, size: 0.9, opacity: 0.55 },   // Diego, as a child
    { pos: CLAMP, color: 0xbfc8d0, size: 0.6, opacity: 0.4 },     // the clamp
  ],

  nodes: [
    { id: 'vein', pos: [HANDS[0], 3.6, HANDS[2] - 0.6], color: 0xff9aa4, size: 1.3, reach: 3 },
    { id: 'hands', pos: HANDS, color: 0xffc27a, size: 1.1, reach: 2.6 },
    { id: 'torn', pos: HEART_L, color: 0xe8455a, size: 1.1, reach: 2.8 },
    { id: 'locket', pos: LOCKET, color: 0xffd9a0, size: 0.9, reach: 2.6 },
  ],

  onTick(clock, tempo, api) {
    // two hearts beating slightly out of time
    const beat = (ph) => 1 + Math.pow(Math.max(0, Math.sin(clock * 1.4 * tempo + ph)), 3) * 0.5;
    const hL = api.field('heartL'); const hR = api.field('heartR');
    if (hL) hL.scale.setScalar(beat(0));
    if (hR) hR.scale.setScalar(beat(0.9));
  },

  music: {
    root: 110, scale: [0, 3, 5, 7, 8], brightness: 0.4,
    padLevel: 0.05, pluckEvery: [7, 16], timbre: 'triangle',
  },
};
