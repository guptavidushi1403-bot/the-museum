/**
 * Inside Under the Wave off Kanagawa — Hokusai's wave, towering.
 *
 * You are low on the water and the great wave rears overhead, a curling
 * cliff of Prussian blue whose crest breaks into foam fingers that reach
 * down toward you. Spray drifts, mist hangs, three boats are dwarfed in
 * the trough, and Mount Fuji sits small and still far beyond. A dramatic
 * sense of scale. Environmental sense-lines only, from
 * docs/research/great-wave.md.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;

// The great wave as a curling cliff: a wide sheet that rises on the left,
// arcs overhead and curls forward (toward -z) into an overhanging crest.
function waveBody() {
  return (i, r) => {
    const u = r();                       // 0..1 along the crest (left→right)
    const h = Math.pow(r(), 0.7);        // base → crest
    const rise = Math.sin(u * Math.PI * 0.6);           // tallest at the left shoulder
    const y = h * (10 + rise * 8) - 1;
    const curl = h > 0.7 ? (h - 0.7) * 4.5 : 0;         // the overhang curls forward
    const x = -14 + u * 26;
    const z = -6 - curl * 4 + (r() - 0.5) * 2.5;
    return [x, y, z];
  };
}

export default {
  slug: 'great-wave',
  seed: 1831,
  background: 0x1a2c50,
  fog: [0x1a2c50, 24, 120],
  camera: { radius: 13, height: 1.2, speed: 0.028, bob: 0.7, lookHeight: 7 },

  strokes: [
    // ---- the sea around and beneath you, ridged into swells ----
    {
      count: 6000,
      home: (i, r) => {
        const a = r() * TAU, rr = 5 + Math.pow(r(), 0.7) * 22;
        const swell = Math.sin(a * 4) * 1.4 + Math.sin(rr * 0.3) * 0.9;
        return [Math.cos(a) * rr, -1.8 + r() * 1.6 + swell, Math.sin(a) * rr];
      },
      color: (i, r) => {
        if (r() < 0.08) return [0.85, 0.92, 0.96];
        const v = 0.5 + r() * 0.5;
        return [0.07 * v, 0.2 * v, 0.55 * v];
      },
      size: [0.6, 1.7], aspect: [2.4, 3.8], angle: 'horizontal',
      orbit: { radius: [0.3, 1.0], speed: [0.1, 0.3] },
      opacity: 0.55,
    },

    // ---- the great wave: a towering curling cliff of blue and foam ----
    {
      name: 'wave', count: 6500,
      home: waveBody(),
      color: (i, r) => {
        const foam = r() < 0.2;
        if (foam) return [0.86, 0.93, 0.97];
        const v = 0.4 + r() * 0.55;
        return [0.06 * v, 0.2 * v, 0.52 * v];
      },
      size: [0.7, 2.0], aspect: [2.6, 4.2],
      angle: (i, rnd, h) => Math.atan2(h[1] + 4, h[0]) + (rnd() - 0.5) * 0.5,
      orbit: { radius: [0.2, 0.9], speed: [0.1, 0.3] },
      opacity: 0.62,
    },

    // ---- the claw: foam fingers curling down off the crest ----
    {
      name: 'claw', count: 2200,
      home: (i, r) => {
        const finger = Math.floor(r() * 9);
        const t = r();
        const base = -10 + finger * 2.6;
        const droop = t * t * 5;
        return [base + Math.sin(t * 6) * 0.8, 15 - droop + Math.sin(t * 12) * 0.4, -10 - t * 6];
      },
      color: (i, r) => (r() < 0.75 ? [0.92, 0.96, 0.99] : [0.75, 0.86, 0.96]),
      size: [0.5, 1.5], aspect: [2.4, 3.8], angle: 'flow',
      orbit: { radius: [0.15, 0.7], speed: [0.2, 0.55] },
      opacity: 0.72,
    },

    // ---- spray flung from the crest ----
    {
      name: 'spray', count: 900,
      home: (i, r) => [-10 + r() * 20, 12 + r() * 6, -10 - r() * 7],
      color: () => [0.93, 0.96, 0.99],
      size: [0.3, 0.7], aspect: [1.6, 2.4], angle: (i, rnd) => rnd() * TAU,
      orbit: { radius: [0.5, 1.8], speed: [0.3, 0.8] },
      opacity: 0.5,
    },

    // ---- ocean mist hanging low ----
    {
      name: 'mist', count: 700,
      home: (i, r) => {
        const a = r() * TAU, rr = 4 + Math.pow(r(), 0.5) * 20;
        return [Math.cos(a) * rr, 0.5 + r() * 3, Math.sin(a) * rr];
      },
      color: () => [0.8, 0.86, 0.92],
      size: [5, 12], aspect: [1.6, 2.6], angle: 'horizontal',
      orbit: { radius: [0.6, 2.0], speed: [0.02, 0.06] },
      opacity: 0.05,
    },

    // ---- three boats, dwarfed in the trough (each named, bobbing) ----
    ...[330, 8, 42].map((deg, bi) => ({
      name: `boat${bi}`, origin: [...az(deg, 9 + bi * 1.5, -0.5)], count: 120,
      home: (i, r) => {
        if (i < 84) return [(r() - 0.5) * 4.5, (r() - 0.5) * 0.3, (r() - 0.5) * 0.9];
        return [(r() - 0.5) * 3.6, 0.25 + r() * 0.3, (r() - 0.5) * 0.3];
      },
      color: (i) => (i < 84 ? [0.6, 0.45, 0.2] : [0.14, 0.11, 0.09]),
      size: [0.35, 0.8], aspect: [1.6, 2.6], angle: 'horizontal',
      orbit: { radius: [0.05, 0.2], speed: [0.1, 0.3] },
      opacity: 0.9, blending: 'normal',
    })),

    // ---- Mount Fuji: small, snow-capped, dead still, far off ----
    {
      origin: [...az(35, 46, 0)], count: 900,
      home: (i, r) => {
        const h = r();
        const rr = (1 - h) * 7;
        const a = r() * TAU;
        return [Math.cos(a) * rr, h * 8, Math.sin(a) * rr * 0.4];
      },
      color: (i, r) => (r() < 0.3 ? [0.94, 0.93, 0.9] : [0.42, 0.48, 0.62]),
      size: [0.8, 1.8], aspect: [1.6, 2.4], angle: 'flow',
      orbit: { radius: [0.005, 0.02], speed: [0.005, 0.02] },
      opacity: 0.85,
    },

    // ---- pale cream sky high above ----
    {
      count: 1200,
      home: (i, r) => {
        const a = r() * TAU, rr = 12 + r() * 22;
        return [Math.cos(a) * rr, 14 + r() * 12, Math.sin(a) * rr];
      },
      color: (i, r) => [0.86, 0.8 - r() * 0.08, 0.66],
      size: [0.9, 2.2], aspect: [1.6, 2.4], angle: 'horizontal',
      orbit: { radius: [0.1, 0.5], speed: [0.02, 0.08] },
      opacity: 0.18,
    },
  ],

  glows: [
    { pos: az(35, 45, 5), color: 0xf6efe0, size: 6, opacity: 0.3 },   // light on Fuji
    { pos: [-4, 13, -11], color: 0xdfeefd, size: 10, opacity: 0.24 }, // the crest's breath
  ],

  nodes: [
    { id: 'fuji', pos: az(35, 46, 4), color: 0xf4ede0, size: 2.4, reach: 22 },
    { id: 'claw', pos: [-2, 13, -12], color: 0xcfe6ff, size: 2.4, reach: 8 },
    { id: 'boats', pos: az(8, 9, 0), color: 0xe8c07a, size: 1.5, reach: 6 },
    { id: 'print', pos: az(120, 13, 9), color: 0xf0e2c0, size: 1.7, reach: 7 },
  ],

  onTick(clock, tempo, api) {
    // the whole wave heaves and leans toward you, breathing
    const wave = api.field('wave');
    const claw = api.field('claw');
    const spray = api.field('spray');
    const lean = Math.sin(clock * 0.28 * tempo);
    if (wave) { wave.rotation.z = lean * 0.05; wave.position.y = lean * 0.6; }
    if (claw) { claw.rotation.z = lean * 0.07; claw.position.y = 1 + lean * 0.8; }
    if (spray) spray.rotation.y = clock * 0.05 * tempo;
    // boats bob and pitch in the swell
    for (let i = 0; i < 3; i++) {
      const boat = api.field(`boat${i}`);
      if (boat) {
        boat.position.y = -0.4 + Math.sin(clock * 0.6 * tempo + i * 2) * 0.35;
        boat.rotation.z = Math.cos(clock * 0.6 * tempo + i * 2) * 0.12;
      }
    }
    const mist = api.field('mist');
    if (mist) mist.rotation.y = clock * 0.015 * tempo;
  },

  music: {
    root: 82.41, scale: [0, 2, 3, 7, 9], brightness: 0.5,
    padLevel: 0.055, pluckEvery: [8, 15], timbre: 'triangle',
  },
};
