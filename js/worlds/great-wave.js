/**
 * Inside Under the Wave off Kanagawa: a sea of Prussian blue around you,
 * the great claw rising at one side of the world and dissolving to spray,
 * three boats low on the swells, and Fuji — small, pale, utterly still —
 * at the far edge of everything moving. Environmental sense-lines only,
 * from docs/research/great-wave.md; the close belongs to the mountain.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;

export default {
  slug: 'great-wave',
  seed: 1831,
  background: 0x1c2c4a,
  fog: [0x1c2c4a, 14, 70],
  camera: { radius: 11, height: 2.4, speed: 0.04, bob: 0.55, lookHeight: 3.4 },

  strokes: [
    { // the sea, all around
      count: 7000,
      home: (i, r) => {
        const a = r() * TAU, rr = 5.5 + Math.pow(r(), 0.7) * 15;
        const swell = Math.sin(a * 3) * 0.8;
        return [Math.cos(a) * rr, -1.2 + r() * 2.6 + swell, Math.sin(a) * rr];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.08) return [0.85, 0.9, 0.94];             // foam flecks
        const v = 0.6 + r() * 0.4;
        return [0.1 * v, 0.25 * v, 0.55 * v];               // prussian
      },
      size: [0.5, 1.5],
      orbit: { radius: [0.2, 0.7], speed: [0.1, 0.3] },
      opacity: 0.5,
    },
    { // the great claw, rising and curling at one side of the world
      count: 2600,
      home: (i, r) => {
        const t = Math.pow(r(), 0.75); // dense at base
        const azm = 265 + (r() - 0.5) * 44 * (1 - t * 0.5);
        const curl = t > 0.72 ? (t - 0.72) * 9 : 0;
        const [x0, , z0] = az(azm, 8.5 - curl, 0);
        return [x0 + (r() - 0.5) * 1.6, t * 7.5 + (r() - 0.5) * 0.7, z0 + (r() - 0.5) * 1.6];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.3) return [0.88, 0.93, 0.96];             // foam of the claw
        const v = 0.5 + r() * 0.5;
        return [0.08 * v, 0.22 * v, 0.5 * v];
      },
      size: [0.6, 1.6],
      orbit: { radius: [0.15, 0.6], speed: [0.15, 0.45] },
      opacity: 0.6,
    },
    { // spray above the claw's lip
      count: 750,
      home: (i, r) => {
        const [x0, , z0] = az(265 + (r() - 0.5) * 30, 6.5 - r() * 2.5, 0);
        return [x0, 6.8 + r() * 3.2, z0];
      },
      color: () => [0.9, 0.94, 0.97],
      size: [0.2, 0.55],
      orbit: { radius: [0.4, 1.4], speed: [0.25, 0.7] },
      opacity: 0.5,
    },
    { // Fuji, far and still (almost no orbit: the one fixed thing)
      count: 520,
      home: (i, r) => {
        const h = r();
        const rr = (1 - h) * 4.2;
        const a = r() * TAU;
        const [x0, , z0] = az(30, 30, 0);
        return [x0 + Math.cos(a) * rr, h * 5 + 0.5, z0 + Math.sin(a) * rr];
      },
      color: (i, r) => (r() < 0.25 ? [0.92, 0.9, 0.86] : [0.45, 0.5, 0.62]),
      size: [0.7, 1.5],
      orbit: { radius: [0.01, 0.04], speed: [0.01, 0.04] },
      opacity: 0.8,
    },
    { // three boats, low on the water
      count: 180,
      home: (i, r) => {
        const which = i % 3;
        const [x0, , z0] = az([330, 10, 55][which], 9.5 + which, 0);
        return [x0 + (r() - 0.5) * 2.4, -0.1 + r() * 0.5, z0 + (r() - 0.5) * 0.8];
      },
      color: (i, r) => (r() < 0.75 ? [0.62, 0.45, 0.2] : [0.25, 0.18, 0.1]),
      size: [0.35, 0.8],
      orbit: { radius: [0.08, 0.25], speed: [0.15, 0.4] },
      opacity: 0.85,
    },
    { // the paper sky: cream air high above (the print confiding it's a print)
      count: 800,
      home: (i, r) => {
        const a = r() * TAU, rr = 8 + r() * 14;
        return [Math.cos(a) * rr, 9 + r() * 6, Math.sin(a) * rr];
      },
      color: (i, r) => [0.85, 0.8 - r() * 0.08, 0.66],
      size: [0.8, 2],
      orbit: { radius: [0.1, 0.4], speed: [0.03, 0.1] },
      opacity: 0.22,
    },
  ],

  glows: [
    { pos: az(30, 29, 3.2), color: 0xf4ede0, size: 4, opacity: 0.3 },  // light on Fuji
    { pos: az(265, 7, 7.5), color: 0xdfeefd, size: 5, opacity: 0.25 }, // the claw's breath
  ],

  nodes: [
    { id: 'fuji', pos: az(30, 30, 3), color: 0xf4ede0, size: 2.2, reach: 15 },
    { id: 'claw', pos: az(265, 7.5, 5.5), color: 0xcfe6ff, size: 1.8, reach: 5 },
    { id: 'boats', pos: az(10, 10.5, 0.4), color: 0xe8c07a, size: 1.4, reach: 5 },
    { id: 'print', pos: az(120, 11, 8.5), color: 0xf0e2c0, size: 1.6, reach: 6 },
  ],

  music: {
    root: 82.41, // E2
    scale: [0, 2, 3, 7, 9],
    brightness: 0.5,
    padLevel: 0.055,
    pluckEvery: [8, 15],
    timbre: 'triangle',
  },
};
