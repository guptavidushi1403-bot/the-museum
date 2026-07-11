/**
 * Inside Water Lilies — the painting's own elements, in 3D.
 *
 * You drift just above a pond that has no horizon: water spreading in every
 * direction, holding the sky upside down. Real clusters of lily pads float
 * on the surface with blossoms opening among them; willow branches hang as
 * reflections reaching down into the blue; the light drifts through the
 * hours. Words: Monet's documented intention via docs/research/water-lilies.md.
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
  background: 0x123430,
  fog: [0x123430, 14, 70],
  camera: { radius: 8, height: 1.4, speed: 0.03, bob: 0.2, lookHeight: 0.2 },

  strokes: [
    // ---- the water surface, spreading flat in every direction ----
    {
      count: 7000,
      home: (i, r) => {
        const a = r() * TAU, rr = 1.5 + Math.pow(r(), 0.6) * 22;
        return [Math.cos(a) * rr, -0.2 + Math.sin(rr * 0.4 + a * 3) * 0.15, Math.sin(a) * rr];
      },
      color: (i, r) => {
        const p = r();
        if (p < 0.35) return [0.2, 0.5, 0.46];
        if (p < 0.6) return [0.28, 0.46, 0.62];
        if (p < 0.82) return [0.5, 0.42, 0.66];
        return [0.82, 0.58, 0.64];
      },
      size: [0.5, 1.5],
      orbit: { radius: [0.1, 0.4], speed: [0.03, 0.12] },
      opacity: 0.42,
    },

    // ---- the sky, reflected: brighter dabs lying flat on the water ----
    {
      count: 1800,
      home: (i, r) => {
        const a = r() * TAU, rr = 2 + Math.pow(r(), 0.5) * 20;
        return [Math.cos(a) * rr, 0.05, Math.sin(a) * rr];
      },
      color: (i, r) => (r() < 0.5 ? [0.7, 0.78, 0.9] : [0.85, 0.7, 0.75]),
      size: [0.4, 1.2],
      orbit: { radius: [0.2, 0.7], speed: [0.04, 0.14] },
      opacity: 0.16,
    },

    // ---- lily pad clusters + blossoms floating on the surface ----
    ...CLUSTERS.map((c, ci) => ({
      name: `pads${ci}`, origin: [c[0], 0.02, c[2]], count: 200,
      home: (i, r) => {
        const a = r() * TAU, rr = Math.pow(r(), 0.6) * 2.6;
        const y = i % 11 === 0 ? 0.18 : 0.0;  // occasional raised blossom
        return [Math.cos(a) * rr, y, Math.sin(a) * rr];
      },
      color: (i, r) => {
        if (i % 11 === 0) return r() < 0.5 ? [0.98, 0.72, 0.82] : [0.98, 0.95, 0.85];
        return [0.18 + r() * 0.14, 0.46 + r() * 0.16, 0.26];
      },
      size: [0.5, 1.5],
      orbit: { radius: [0.03, 0.12], speed: [0.03, 0.1] },
      opacity: 0.7,
    })),

    // ---- willow branches hanging as reflections, reaching down ----
    ...[70, 190, 300].map((deg) => ({
      origin: [...az(deg, 13, 0)], count: 500,
      home: (i, r) => {
        const strand = Math.floor(r() * 8);
        const t = r();                          // down into the water
        return [(strand - 4) * 0.7 + Math.sin(t * 4) * 0.5, 0.2 - t * 5, (r() - 0.5) * 1.5];
      },
      color: (i, r) => [0.2 + r() * 0.15, 0.42 + r() * 0.18, 0.24],
      size: [0.35, 0.9],
      orbit: { radius: [0.05, 0.25], speed: [0.05, 0.16] },
      opacity: 0.4,
    })),
  ],

  glows: [
    { pos: [0, 3, 0], color: 0xf6d9c8, size: 16, opacity: 0.12 },  // borrowed dawn overhead
    { pos: az(150, 7, 0.4), color: 0xffc4da, size: 3, opacity: 0.2 },
    { pos: az(40, 6, 0.4), color: 0xfff0d0, size: 2.6, opacity: 0.2 },
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
