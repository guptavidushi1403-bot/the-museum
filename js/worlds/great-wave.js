/**
 * Inside Under the Wave off Kanagawa — the print's own elements, in 3D.
 *
 * The great wave rises and curls over your head, its crest breaking into
 * foam fingers (the claw); three boats ride the swells with their rowers;
 * Mount Fuji sits small, snow-capped and utterly still in the distance
 * while everything else moves. Prussian blue and foam white, built from
 * strokes. Environmental sense-lines only, from docs/research/great-wave.md.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;

export default {
  slug: 'great-wave',
  seed: 1831,
  background: 0x1b2a48,
  fog: [0x1b2a48, 22, 110],
  camera: { radius: 12, height: 2.2, speed: 0.03, bob: 0.6, lookHeight: 5 },

  strokes: [
    // ---- the sea around you, ridged into swells ----
    {
      count: 6000,
      home: (i, r) => {
        const a = r() * TAU, rr = 6 + Math.pow(r(), 0.7) * 20;
        const swell = Math.sin(a * 4) * 1.2 + Math.sin(rr * 0.3) * 0.8;
        return [Math.cos(a) * rr, -1.5 + r() * 1.5 + swell, Math.sin(a) * rr];
      },
      color: (i, r) => {
        if (r() < 0.07) return [0.85, 0.92, 0.96];
        const v = 0.55 + r() * 0.45;
        return [0.08 * v, 0.22 * v, 0.55 * v];
      },
      size: [0.5, 1.6], aspect: [2.4, 3.6], angle: 'horizontal',  // flowing sea lines
      orbit: { radius: [0.3, 1.0], speed: [0.1, 0.3] },
      opacity: 0.52,
    },

    // ---- the great wave body: a wall of blue rising on one side ----
    {
      name: 'wave', origin: [...az(250, 9, 0)], count: 4200,
      home: (i, r) => {
        // a curved sheet rising then curling forward at the top
        const u = r();               // along the crest
        const h = Math.pow(r(), 0.7); // base..crest
        const curl = h > 0.75 ? (h - 0.75) * 4 : 0;   // the overhang
        const x = (u - 0.5) * 18;
        const y = h * 13 - 1;
        const z = -curl * 4 + (r() - 0.5) * 2;         // curls toward viewer
        return [x, y, z];
      },
      color: (i, r) => {
        const foam = r() < 0.16;
        if (foam) return [0.86, 0.93, 0.97];
        const v = 0.4 + r() * 0.5;
        return [0.07 * v, 0.2 * v, 0.5 * v];
      },
      size: [0.6, 1.8], aspect: [2.4, 3.8],
      angle: (i, rnd, h) => Math.atan2(h[1], h[0]) + (rnd() - 0.5) * 0.5,  // curl of the wave
      orbit: { radius: [0.2, 0.8], speed: [0.12, 0.35] },
      opacity: 0.62,
    },

    // ---- the claw: foam fingers curling off the crest ----
    {
      name: 'claw', origin: [...az(250, 9, 3)], count: 1600,
      home: (i, r) => {
        const finger = Math.floor(r() * 7);
        const t = r();                       // out along a finger
        const base = (finger - 3) * 2.2;
        const droop = t * t * 3;             // fingers curl down/forward
        return [base + Math.sin(t * 6) * 0.6, 12 - droop + Math.sin(t * 10) * 0.3, -t * 5 - 1];
      },
      color: (i, r) => (r() < 0.7 ? [0.9, 0.95, 0.98] : [0.75, 0.85, 0.95]),
      size: [0.4, 1.3], aspect: [2.2, 3.6], angle: 'flow',  // foam fingers curl outward
      orbit: { radius: [0.15, 0.7], speed: [0.2, 0.55] },
      opacity: 0.72,
    },
    // spray flung from the claw
    {
      origin: [...az(250, 9, 2)], count: 700,
      home: (i, r) => [(r() - 0.5) * 16, 11 + r() * 5, -r() * 6],
      color: () => [0.92, 0.96, 0.99],
      size: [0.2, 0.6],
      orbit: { radius: [0.5, 1.6], speed: [0.3, 0.8] },
      opacity: 0.5,
    },

    // ---- three boats, low on the swells, with rowers ----
    ...[330, 8, 45].map((deg, bi) => ({
      origin: [...az(deg, 9.5 + bi, -0.5)], count: 130,
      home: (i, r) => {
        // long hull + a row of dark rower-beads
        if (i < 90) return [(r() - 0.5) * 5, (r() - 0.5) * 0.3, (r() - 0.5) * 0.9];
        return [(r() - 0.5) * 4, 0.25 + r() * 0.3, (r() - 0.5) * 0.3];
      },
      color: (i, r) => (i < 90 ? [0.6, 0.45, 0.2] : [0.15, 0.12, 0.1]),
      size: [0.35, 0.8],
      orbit: { radius: [0.05, 0.2], speed: [0.1, 0.3] },
      opacity: 0.85,
      blending: 'normal',
    })),

    // ---- Mount Fuji: small, snow-capped, dead still, far off ----
    {
      origin: [...az(30, 44, 0)], count: 900,
      home: (i, r) => {
        const h = r();
        const rr = (1 - h) * 7;
        const a = r() * TAU;
        return [Math.cos(a) * rr, h * 8, Math.sin(a) * rr * 0.4];
      },
      color: (i, r) => (r() < 0.3 ? [0.94, 0.93, 0.9] : [0.42, 0.48, 0.62]),
      size: [0.8, 1.8],
      orbit: { radius: [0.005, 0.02], speed: [0.005, 0.02] }, // barely breathes
      opacity: 0.85,
    },

    // ---- the papery cream sky high above ----
    {
      count: 1200,
      home: (i, r) => {
        const a = r() * TAU, rr = 10 + r() * 20;
        return [Math.cos(a) * rr, 12 + r() * 10, Math.sin(a) * rr];
      },
      color: (i, r) => [0.86, 0.8 - r() * 0.08, 0.66],
      size: [0.8, 2.2],
      orbit: { radius: [0.1, 0.5], speed: [0.02, 0.08] },
      opacity: 0.18,
    },
  ],

  glows: [
    { pos: az(30, 43, 4), color: 0xf6efe0, size: 6, opacity: 0.3 },   // light on Fuji
    { pos: az(250, 9, 6), color: 0xdfeefd, size: 8, opacity: 0.28 },  // the claw's breath
  ],

  nodes: [
    { id: 'fuji', pos: az(30, 44, 3), color: 0xf4ede0, size: 2.4, reach: 20 },
    { id: 'claw', pos: az(250, 10, 4), color: 0xcfe6ff, size: 2.2, reach: 7 },
    { id: 'boats', pos: az(8, 9.5, 0), color: 0xe8c07a, size: 1.5, reach: 6 },
    { id: 'print', pos: az(120, 13, 9), color: 0xf0e2c0, size: 1.7, reach: 7 },
  ],

  onTick(clock, tempo, api) {
    // the wave and claw sway together, breathing toward the viewer
    const wave = api.field('wave');
    const claw = api.field('claw');
    const s = Math.sin(clock * 0.35 * tempo) * 0.06;
    if (wave) wave.rotation.z = s;
    if (claw) { claw.rotation.z = s; claw.position.y = 3 + Math.sin(clock * 0.35 * tempo) * 0.4; }
  },

  music: {
    root: 82.41, scale: [0, 2, 3, 7, 9], brightness: 0.5,
    padLevel: 0.055, pluckEvery: [8, 15], timbre: 'triangle',
  },
};
