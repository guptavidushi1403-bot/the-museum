/**
 * Inside Girl with a Pearl Earring — Vermeer's room, made of light.
 *
 * Not a portrait floating in void but the room itself: a quiet wooden
 * interior, the famous window on the left pouring a soft shaft of daylight
 * across the dark, dust turning slowly in the beam, a fall of ultramarine
 * and gold silk on the table, and — at the heart of it all — the pearl,
 * luminous, the emotional center. Vermeer's mastery of light, expanded
 * into space. Environmental sense-lines only (docs/research/pearl-earring.md);
 * node ids preserved so the reveals still surface.
 */
import { az, createGlow } from './strokes.js';

const TAU = Math.PI * 2;
const WINDOW = [-5.2, 2.6, -2.5];      // the light source, upper left
const PEARL = [1.0, 1.15, 1.2];        // the glowing heart, near and low
const SILK = [0.2, 0.2, 0.6];          // cloth on the table
const HER = [0.2, 1.7, -0.4];          // the soft warm presence in the light

export default {
  slug: 'pearl-earring',
  seed: 1665,
  background: 0x1a130c,                 // warm umber dark, not black
  fog: [0x1a130c, 6, 30],
  camera: { radius: 4.2, height: 1.6, speed: 0.016, bob: 0.12, lookHeight: 1.4 },

  strokes: [
    // ---- the wooden room: warm horizontal grain, all around ----
    {
      count: 3200,
      home: (i, r) => {
        // a shallow box: back and side walls + floor
        const face = r();
        if (face < 0.4) return [(r() - 0.5) * 20, r() * 8 - 1.5, -8];          // back wall
        if (face < 0.6) return [(r() - 0.5) * 20, -1.5 + r() * 0.4, (r() - 0.5) * 18]; // floor
        if (face < 0.8) return [8, r() * 8 - 1.5, (r() - 0.5) * 18];           // right wall
        return [-8, r() * 8 - 1.5, (r() - 0.5) * 18];                          // left wall
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.5) return [0.18 + r() * 0.1, 0.12 + r() * 0.06, 0.06];       // deep umber
        return [0.3 + r() * 0.14, 0.2 + r() * 0.08, 0.1];                       // warm oak
      },
      size: [0.6, 1.6], aspect: [2.4, 3.8], angle: 'horizontal',
      orbit: { radius: [0.03, 0.12], speed: [0.01, 0.05] },
      opacity: 0.55, blending: 'normal',
    },

    // ---- the window: cool daylight through leaded panes ----
    {
      name: 'window', origin: WINDOW, count: 700,
      home: (i, r) => {
        const gx = Math.floor(r() * 3), gy = Math.floor(r() * 4);   // a 3x4 lattice
        const x = (gx - 1) * 0.7 + (r() - 0.5) * 0.5;
        const y = (gy - 1.5) * 0.8 + (r() - 0.5) * 0.6;
        return [x, y, (r() - 0.5) * 0.2];
      },
      color: (i, r) => [0.72 + r() * 0.2, 0.82 + r() * 0.15, 0.92],            // cool pearl daylight
      size: [0.5, 1.2], aspect: [1.4, 2.2], angle: (i, rnd) => (rnd() < 0.5 ? 0 : Math.PI / 2),
      orbit: { radius: [0.02, 0.06], speed: [0.02, 0.06] },
      opacity: 0.75,
    },

    // ---- the light shaft: motes of daylight crossing the room ----
    {
      name: 'shaft', count: 900,
      home: (i, r) => {
        // a soft column travelling from the window down to the floor-centre
        const t = r();
        const x = WINDOW[0] + (PEARL[0] - WINDOW[0]) * t + (r() - 0.5) * 2.2;
        const y = WINDOW[1] + (-1 - WINDOW[1]) * t + (r() - 0.5) * 1.6;
        const z = WINDOW[2] + (PEARL[2] - WINDOW[2]) * t + (r() - 0.5) * 2.2;
        return [x, y, z];
      },
      color: () => [0.95, 0.92, 0.82],
      size: [0.12, 0.4], aspect: [1, 1.5],
      orbit: { radius: [0.1, 0.5], speed: [0.02, 0.08] },
      opacity: 0.16,
    },

    // ---- the silk: ultramarine and gold cloth on the table ----
    {
      name: 'silk', origin: SILK, count: 700,
      home: (i, r) => {
        const a = r() * TAU, rr = Math.pow(r(), 0.5) * 1.8;
        return [Math.cos(a) * rr, Math.sin(r() * 3) * 0.2, Math.sin(a) * rr * 0.7];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.55) return [0.13, 0.22 + r() * 0.1, 0.62 + r() * 0.15];       // ultramarine
        if (p < 0.8) return [0.82, 0.68, 0.28];                                  // lead-tin yellow
        return [0.5, 0.14, 0.12];                                                // deep carmine fold
      },
      size: [0.5, 1.3], aspect: [1.8, 2.8], angle: 'swirl',
      orbit: { radius: [0.02, 0.08], speed: [0.02, 0.07] },
      opacity: 0.8, blending: 'normal',
    },

    // ---- her presence, softly lit where the light falls (no features) ----
    {
      name: 'her', origin: HER, count: 500,
      home: (i, r) => {
        const face = r();
        if (face < 0.5) { const a = r() * TAU, rr = Math.pow(r(), 0.6) * 0.7; return [Math.cos(a) * rr, Math.sin(a) * rr, (r() - 0.5) * 0.4]; }
        return [(r() - 0.5) * 1.2, -0.6 - r() * 1.2, (r() - 0.5) * 0.6];        // shoulder/cloak
      },
      color: (i, r) => (r() < 0.4 ? [0.72, 0.58, 0.46] : [0.2, 0.16, 0.14]),    // lit cheek / dark cloak
      size: [0.4, 1.0], aspect: [1.4, 2.2], angle: 'vertical',
      orbit: { radius: [0.02, 0.06], speed: [0.02, 0.06] },
      opacity: 0.75, blending: 'normal',
    },

    // ---- the pearl: two strokes of white, the heart of the room ----
    {
      name: 'pearl', origin: PEARL, count: 70,
      home: (i, r) => {
        if (i < 24) return [(r() - 0.5) * 0.14, 0.07 + (r() - 0.5) * 0.05, (r() - 0.5) * 0.08];
        const a = r() * TAU, rr = Math.pow(r(), 0.6) * 0.18;
        return [Math.cos(a) * rr, Math.sin(a) * rr, (r() - 0.5) * 0.1];
      },
      color: (i) => (i < 24 ? [0.98, 0.98, 1.0] : [0.6, 0.66, 0.76]),
      size: [0.3, 0.8], aspect: [1.2, 1.8],
      orbit: { radius: [0.004, 0.02], speed: [0.04, 0.12] },
      opacity: 0.95,
    },
  ],

  glows: [
    { pos: WINDOW, color: 0xdfe8f2, size: 7, opacity: 0.4 },       // daylight through the glass
    { pos: [-2.5, 1.6, -1], color: 0xcbd6e2, size: 6, opacity: 0.14 }, // the shaft's soft body
    { pos: HER, color: 0xd8b183, size: 2.4, opacity: 0.2 },        // warm light on her cheek
    { pos: PEARL, color: 0xdfeaf6, size: 0.9, opacity: 0.9 },      // the pearl
  ],

  nodes: [
    { id: 'pearl', pos: PEARL, color: 0xdfeaf6, size: 0.7, reach: 1.7 },
    { id: 'gaze', pos: [HER[0], HER[1] + 0.05, HER[2] + 0.3], color: 0xe0b984, size: 0.9, reach: 1.9 },
    { id: 'blue', pos: SILK, color: 0x4a6fd8, size: 1.0, reach: 2.0 },
    { id: 'darkness', pos: [6, 1.5, 3], color: 0x3a2a18, size: 1.6, reach: 4 },
  ],

  onTick(clock, tempo, api) {
    // the pearl breathes with light — the emotional center
    const pearl = api.field('pearl');
    if (pearl) pearl.scale.setScalar(1 + 0.08 * Math.sin(clock * 0.7 * tempo));
    // dust turns slowly in the shaft of daylight
    const shaft = api.field('shaft');
    if (shaft) shaft.rotation.y = clock * 0.015 * tempo;
    // the silk shifts almost imperceptibly
    const silk = api.field('silk');
    if (silk) silk.rotation.y = Math.sin(clock * 0.2 * tempo) * 0.05;
  },

  music: {
    root: 261.63, scale: [0, 4, 7, 11], brightness: 0.35,
    padLevel: 0.03, pluckEvery: [9, 18], timbre: 'sine',
  },
};
