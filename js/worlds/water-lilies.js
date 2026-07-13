/**
 * Inside Water Lilies — rebuilt to Monet's hand.
 *
 * Not Van Gogh's ribbons but Monet's soft luminous dabs: a bright,
 * high-key pond of blue, green, lavender and rose touches, flecked with
 * pure yellow and white, spreading without a horizon in any direction.
 * Lily-pad clusters float with opening blossoms; willow reflections hang
 * into the water; the light drifts through the hours. Words: Monet's
 * documented intention via docs/research/water-lilies.md.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;
const CLUSTERS = [
  az(40, 6, 0), az(150, 7, 0), az(255, 6, 0), az(320, 9, 0),
  az(90, 11, 0), az(200, 12, 0), az(0, 14, 0),
];

export default {
  slug: 'water-lilies',
  seed: 1926,
  background: 0x2a5a63,
  fog: [0x2a5a63, 16, 78],
  camera: { radius: 8, height: 1.4, speed: 0.03, bob: 0.2, lookHeight: 0.4 },

  strokes: [
    // ---- the water: dense soft dabs, edge to edge, luminous ----
    {
      count: 9000,
      home: (i, r) => {
        const a = r() * TAU, rr = 1.2 + Math.pow(r(), 0.6) * 24;
        return [Math.cos(a) * rr, -0.2 + Math.sin(rr * 0.4 + a * 3) * 0.18, Math.sin(a) * rr];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.30) return [0.28, 0.58, 0.55];   // teal water
        if (p < 0.52) return [0.4, 0.6, 0.78];      // sky blue
        if (p < 0.70) return [0.62, 0.55, 0.78];    // lavender
        if (p < 0.85) return [0.92, 0.68, 0.72];    // rose
        return [0.95, 0.9, 0.6];                     // yellow fleck
      },
      size: [0.7, 1.7], aspect: [1.2, 1.9],          // soft dabs, barely elongated
      angle: 'horizontal',
      orbit: { radius: [0.1, 0.45], speed: [0.04, 0.14] },
      opacity: 0.5,
    },

    // ---- bright sky reflected across the surface ----
    {
      count: 2200,
      home: (i, r) => {
        const a = r() * TAU, rr = 2 + Math.pow(r(), 0.5) * 22;
        return [Math.cos(a) * rr, 0.06, Math.sin(a) * rr];
      },
      color: (i, r) => (r() < 0.5 ? [0.8, 0.86, 0.95] : [0.95, 0.82, 0.8]),
      size: [0.6, 1.4], aspect: [1.2, 1.8], angle: 'horizontal',
      orbit: { radius: [0.2, 0.7], speed: [0.04, 0.14] },
      opacity: 0.22,
    },

    // ---- lily pad clusters + opening blossoms ----
    ...CLUSTERS.map((c, ci) => ({
      name: `pads${ci}`, origin: [c[0], 0.03, c[2]], count: 240,
      home: (i, r) => {
        const a = r() * TAU, rr = Math.pow(r(), 0.6) * 2.6;
        const y = i % 9 === 0 ? 0.2 : 0.0;
        return [Math.cos(a) * rr, y, Math.sin(a) * rr];
      },
      color: (i, r) => {
        if (i % 9 === 0) return r() < 0.5 ? [1.0, 0.75, 0.85] : [1.0, 0.97, 0.88]; // blossoms
        return [0.2 + r() * 0.16, 0.5 + r() * 0.2, 0.28];                          // pads
      },
      size: [0.7, 1.9], aspect: [1.3, 2.0], angle: (i, rnd) => rnd() * TAU,
      orbit: { radius: [0.03, 0.12], speed: [0.03, 0.1] },
      opacity: 0.72,
    })),

    // ---- willow reflections hanging into the blue ----
    ...[70, 190, 300].map((deg) => ({
      origin: [...az(deg, 13, 0)], count: 600,
      home: (i, r) => {
        const strand = Math.floor(r() * 8);
        const t = r();
        return [(strand - 4) * 0.7 + Math.sin(t * 4) * 0.5, 0.2 - t * 5, (r() - 0.5) * 1.5];
      },
      color: (i, r) => [0.22 + r() * 0.15, 0.5 + r() * 0.2, 0.28],
      size: [0.5, 1.1], aspect: [2.4, 3.6], angle: 'vertical',
      orbit: { radius: [0.05, 0.25], speed: [0.05, 0.16] },
      opacity: 0.4,
    })),
  ],

  glows: [
    { pos: [0, 4, 0], color: 0xfff0d8, size: 20, opacity: 0.14 },   // bright sky overhead
    { pos: az(150, 7, 0.4), color: 0xffc4da, size: 3, opacity: 0.22 },
    { pos: az(40, 6, 0.4), color: 0xfff0d0, size: 2.6, opacity: 0.22 },
  ],

  nodes: [
    { id: 'surface', pos: az(40, 6, 0.5), color: 0xbfe8e0, size: 1.6, reach: 5 },
    { id: 'blooms', pos: az(150, 7, 0.5), color: 0xffc4da, size: 1.6, reach: 5 },
    { id: 'refuge', pos: az(255, 6, 0.5), color: 0xd9c8ff, size: 1.6, reach: 5 },
  ],

  music: {
    root: 196, scale: [0, 2, 4, 7, 9], brightness: 0.7,
    padLevel: 0.045, pluckEvery: [5, 11], timbre: 'sine',
  },
};
