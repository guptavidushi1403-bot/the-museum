/**
 * Inside The Starry Night — rebuilt to Van Gogh's own hand.
 *
 * The sky is a dense, swirling mass of impasto brushstrokes: long ribbons
 * of blue and gold flowing in S-curves, two great vortices turning, and
 * eleven stars that are spiral swirls of concentric paint. Below, the
 * cypress is a tall flame of vertical green-black strokes; the village and
 * its Dutch spire glow warm; the hills roll in ribboned bands. No empty
 * black — the whole world is loaded paint. Words: letters 691, 783, 777
 * via docs/research/starry-night.md.
 */
import { az, createGlow } from './strokes.js';

const TAU = Math.PI * 2;

// A spiral of brushstrokes in the XY plane (a swirl seen face-on).
function spiral(turns, spread, thickness) {
  return (i, r) => {
    const t = Math.pow(r(), 0.5);
    const a = t * TAU * turns + r() * 0.3;
    const rad = t * spread;
    return [Math.cos(a) * rad, Math.sin(a) * rad, (r() - 0.5) * thickness];
  };
}
// strokes lie tangent to the spiral arm
function spiralAngle(i, rnd, h) {
  return Math.atan2(h[1], h[0]) + Math.PI / 2 + (rnd() - 0.5) * 0.3;
}

// A single star as a tight spiral swirl of bright strokes.
function starField(pos, radius, warm) {
  return {
    origin: pos, count: 70,
    home: spiral(1.5, radius, radius * 0.25),
    color: (i, r) => (warm
      ? [0.95, 0.8 + r() * 0.15, 0.42 + r() * 0.18]
      : [0.7 + r() * 0.2, 0.82, 0.98]),
    size: [0.4, 0.9], aspect: [2.0, 3.0], angle: spiralAngle,
    orbit: { radius: [0.03, 0.1], speed: [0.06, 0.16] },
    opacity: 0.3,
  };
}

const STARS = [
  az(80, 20, 15), az(20, 15, 9), az(-8, 16, 11), az(-30, 17, 8),
  az(45, 18, 10), az(110, 17, 9), az(135, 16, 6), az(160, 18, 7),
];

export default {
  slug: 'starry-night',
  seed: 1889,
  background: 0x0a1330,
  fog: [0x0a1330, 22, 95],
  camera: { radius: 11, height: 2, speed: 0.025, bob: 0.4, lookHeight: 8 },

  strokes: [
    // ---- the swirling sky: a dense dome of flowing ribbons ----
    {
      name: 'sky', count: 7000,
      home: (i, r) => {
        const a = r() * TAU;
        const el = 0.02 + Math.pow(r(), 0.8) * 1.25;  // reach down toward the horizon
        const R = 15 + r() * 11;
        return [Math.cos(a) * Math.sin(el) * R, 1 + Math.cos(el) * R * 0.9, Math.sin(a) * Math.sin(el) * R - 4];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.14) return [0.95, 0.85, 0.45];       // gold current
        if (p < 0.2) return [0.9, 0.93, 0.98];         // white foam of light
        const v = 0.55 + r() * 0.4;
        return [0.22 * v, 0.4 * v, 0.9 * v];           // deep cobalt/ultramarine
      },
      size: [0.7, 1.7], aspect: [2.6, 4.2],
      angle: (i, rnd, h) => Math.atan2(h[2], h[0]) + Math.PI / 2 + (rnd() - 0.5) * 0.6,
      orbit: { radius: [0.5, 1.6], speed: [0.06, 0.18] },
      opacity: 0.34,
    },

    // ---- the great vortex (turns via onTick) ----
    {
      name: 'swirlA', origin: [3, 12, -5], count: 3200,
      home: spiral(2.4, 8, 1.8),
      color: (i, r) => {
        const p = r();
        if (p < 0.22) return [0.98, 0.88, 0.5];
        return [0.4 + r() * 0.2, 0.55 + r() * 0.2, 0.98];
      },
      size: [0.7, 1.7], aspect: [3.0, 4.6], angle: spiralAngle,
      orbit: { radius: [0.1, 0.5], speed: [0.1, 0.28] },
      opacity: 0.34,
    },
    // second vortex
    {
      name: 'swirlB', origin: [-6, 13.5, -3], count: 2000,
      home: spiral(2.0, 5.4, 1.5),
      color: (i, r) => (r() < 0.2 ? [0.95, 0.85, 0.5] : [0.35 + r() * 0.2, 0.5 + r() * 0.2, 0.95]),
      size: [0.7, 1.6], aspect: [3.0, 4.4], angle: spiralAngle,
      orbit: { radius: [0.1, 0.45], speed: [0.12, 0.32] },
      opacity: 0.32,
    },

    // ---- the wheat field: ribboned strokes below ----
    {
      count: 3600,
      home: (i, r) => {
        const a = r() * TAU, rr = 3 + Math.pow(r(), 0.7) * 20;
        return [Math.cos(a) * rr, -2.4 + r() * 1.6, Math.sin(a) * rr];
      },
      color: (i, r) => (r() < 0.55 ? [0.45 + r() * 0.3, 0.4, 0.14] : [0.12, 0.28, 0.14]),
      size: [0.5, 1.1], aspect: [2.0, 3.2], angle: 'horizontal',
      orbit: { radius: [0.06, 0.22], speed: [0.1, 0.4] },
      opacity: 0.4,
    },

    // ---- the cypress: a flame of vertical green-black strokes ----
    {
      name: 'cypress', origin: [...az(206, 6.5, 0)], count: 2600,
      home: (i, r) => {
        const h = Math.pow(r(), 0.8);
        const taper = (1 - h) * 1.7 + 0.12;
        const a = r() * TAU;
        const rr = Math.pow(r(), 0.5) * taper;
        return [Math.cos(a) * rr, h * 11 - 2, Math.sin(a) * rr];
      },
      color: (i, r) => (r() < 0.7 ? [0.02, 0.05, 0.025] : [0.06, 0.14, 0.06]),
      size: [0.6, 1.5], aspect: [2.8, 4.6], angle: 'vertical',
      orbit: { radius: [0.06, 0.26], speed: [0.15, 0.4] },
      opacity: 0.95, blending: 'normal',
    },

    // ---- the village + windows + spire ----
    {
      origin: [...az(332, 11, 0)], count: 900,
      home: (i, r) => [(Math.floor(r() * 9) - 4) * 1.5 + (r() - 0.5), -2.2 + r() * 1.4, (r() - 0.5) * 3],
      color: (i, r) => (r() < 0.7 ? [0.1, 0.12, 0.2] : [0.16, 0.14, 0.22]),
      size: [0.5, 1.1], aspect: [1.6, 2.4], angle: 'horizontal',
      orbit: { radius: [0.02, 0.08], speed: [0.03, 0.1] },
      opacity: 0.8, blending: 'normal',
    },
    {
      origin: [...az(332, 11, 0)], count: 130,
      home: (i, r) => [(Math.floor(r() * 9) - 4) * 1.5 + (r() - 0.5), -1.6 + r() * 0.9, (r() - 0.5) * 2.5],
      color: () => [1.0, 0.78, 0.38],
      size: [0.5, 1.0], aspect: [1, 1.6],
      orbit: { radius: [0.01, 0.05], speed: [0.05, 0.15] },
      opacity: 0.9,
    },
    {
      origin: [...az(332, 11, 0)], count: 240,
      home: (i, r) => [(r() - 0.5) * 0.4, -1 + r() * 4.5, (r() - 0.5) * 0.4],
      color: () => [0.16, 0.16, 0.24],
      size: [0.4, 0.8], aspect: [2.4, 3.6], angle: 'vertical',
      orbit: { radius: [0.01, 0.05], speed: [0.05, 0.15] },
      opacity: 0.85, blending: 'normal',
    },

    // ---- rolling hills behind ----
    {
      count: 1600,
      home: (i, r) => {
        const a = (0.55 + r() * 0.5) * Math.PI;
        const rr = 16 + r() * 8;
        return [Math.cos(a) * rr, -1 + Math.sin(r() * TAU) * 1.5, -Math.abs(Math.sin(a)) * rr - 4];
      },
      color: (i, r) => [0.16 + r() * 0.1, 0.22 + r() * 0.12, 0.4],
      size: [0.7, 1.6], aspect: [2.4, 3.6], angle: 'horizontal',
      orbit: { radius: [0.1, 0.4], speed: [0.05, 0.15] },
      opacity: 0.42,
    },

    // ---- the eleven stars as spiral swirls ----
    ...STARS.map((p, i) => starField(p, i === 0 ? 2.4 : 1.2 + (i % 3) * 0.3, i % 2 === 0)),
  ],

  glows: [
    { pos: az(80, 20, 15), color: 0xffe08a, size: 8, opacity: 0.4 },   // moon halo
    { pos: az(20, 15, 9), color: 0xbfe0ff, size: 4, opacity: 0.5 },    // Venus halo
    { pos: [3, 12, -5], color: 0x9fb8ff, size: 7, opacity: 0.2 },
    { pos: [-6, 13.5, -3], color: 0x9fb8ff, size: 6, opacity: 0.18 },
  ],

  nodes: [
    { id: 'sky', pos: [3, 12, -5], color: 0xffe6a0, size: 2.0, reach: 6 },
    { id: 'cypress', pos: az(206, 6.2, 4), color: 0x9fd8a8, size: 1.6, reach: 6 },
    { id: 'village', pos: az(332, 10, 0.5), color: 0xffd27a, size: 1.5, reach: 6 },
    { id: 'venus', pos: az(20, 15, 9), color: 0xcfe6ff, size: 1.3, reach: 6 },
  ],

  onTick(clock, tempo, api) {
    const a = api.field('swirlA');
    const b = api.field('swirlB');
    const sky = api.field('sky');
    if (a) a.rotation.z = clock * 0.22 * tempo;
    if (b) b.rotation.z = -clock * 0.26 * tempo;
    if (sky) sky.rotation.y = clock * 0.01 * tempo; // the whole sky slowly turns
  },

  music: {
    root: 146.83, scale: [0, 3, 5, 7, 10], brightness: 0.55,
    padLevel: 0.05, pluckEvery: [6, 14], timbre: 'triangle',
  },
};
