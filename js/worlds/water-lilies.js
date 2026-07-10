/**
 * Inside Water Lilies: a pond with no horizon in any direction — water
 * below, water ahead, willow curtains hanging from a sky you never see.
 * The light drifts through the pond's hours. Words: Monet's documented
 * intention via docs/research/water-lilies.md.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;
const CLUSTERS = [az(60, 6.5, 0.15), az(180, 7, 0.15), az(300, 6.5, 0.15), az(120, 10, 0.1), az(250, 11, 0.1)];

export default {
  slug: 'water-lilies',
  seed: 1926,
  background: 0x11312e,
  fog: [0x11312e, 9, 42],
  camera: { radius: 8, height: 1.5, speed: 0.035, bob: 0.25 },

  strokes: [
    { // the water sheet, edge to edge
      count: 7800,
      home: (i, r) => {
        const a = r() * TAU, rr = 1.5 + Math.pow(r(), 0.65) * 19;
        return [Math.cos(a) * rr, -0.4 + r() * 0.8, Math.sin(a) * rr];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.35) return [0.25, 0.55, 0.5];   // water green
        if (p < 0.6) return [0.3, 0.5, 0.65];     // sky in the water
        if (p < 0.8) return [0.55, 0.45, 0.7];    // lavender
        return [0.85, 0.6, 0.65];                  // dawn rose
      },
      size: [0.5, 1.4],
      orbit: { radius: [0.1, 0.45], speed: [0.04, 0.14] },
      opacity: 0.4,
    },
    { // lily pads and blossoms in five drifts
      count: 620,
      home: (i, r) => {
        const [cx, cy, cz] = CLUSTERS[i % CLUSTERS.length];
        const a = r() * TAU, rr = Math.pow(r(), 0.6) * 2.4;
        return [cx + Math.cos(a) * rr, cy + r() * 0.35, cz + Math.sin(a) * rr];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.5) return [0.2, 0.5, 0.28];      // pads
        if (p < 0.8) return [0.98, 0.72, 0.82];    // rose blossoms
        return [0.98, 0.95, 0.85];                  // white blossoms
      },
      size: [0.6, 1.7],
      orbit: { radius: [0.05, 0.18], speed: [0.05, 0.16] },
      opacity: 0.75,
    },
    { // willow curtains, hanging from above
      count: 1500,
      home: (i, r) => {
        const side = i % 2 ? 130 : 310;
        const [x0, , z0] = az(side + (r() - 0.5) * 30, 9.5 + r() * 2, 0);
        return [x0 + (r() - 0.5) * 1.5, 7.5 - r() * 6, z0 + (r() - 0.5) * 1.5];
      },
      color: (i, r) => [0.2 + r() * 0.15, 0.42 + r() * 0.18, 0.22],
      size: [0.35, 0.9],
      orbit: { radius: [0.08, 0.3], speed: [0.06, 0.2] },
      opacity: 0.55,
    },
  ],

  glows: [
    { pos: [0, 7.5, 0], color: 0xf6d9c8, size: 12, opacity: 0.16 }, // borrowed dawn
    { pos: az(180, 7, 0.4), color: 0xffc4da, size: 3, opacity: 0.22 },
  ],

  nodes: [
    { id: 'surface', pos: az(60, 6.5, 0.6), color: 0xbfe8e0, size: 1.5, reach: 5 },
    { id: 'blooms', pos: az(180, 7, 0.5), color: 0xffc4da, size: 1.5, reach: 5 },
    { id: 'refuge', pos: az(300, 6.5, 0.5), color: 0xd9c8ff, size: 1.5, reach: 5 },
  ],

  music: {
    root: 196, // G3
    scale: [0, 2, 4, 7, 9],
    brightness: 0.7,
    padLevel: 0.045,
    pluckEvery: [5, 11],
    timbre: 'sine',
  },
};
