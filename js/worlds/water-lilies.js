/**
 * Inside Water Lilies — Monet's pond, alive.
 *
 * Soft impressionist dabs of light spread without a horizon; lily pads
 * float and bob, blossoms open and close, painted ripples widen and fade,
 * willow reflections hang into the blue, and warm sun filters through a
 * drifting mist. Words: Monet's documented intention via
 * docs/research/water-lilies.md.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;
const CLUSTERS = [
  az(40, 6, 0), az(150, 7, 0), az(255, 6, 0), az(320, 9, 0),
  az(90, 11, 0), az(200, 12, 0), az(0, 14, 0),
];
const RIPPLES = [az(60, 5, 0), az(170, 6, 0), az(280, 5.5, 0), az(120, 9, 0)];

// a flat ring of dabs, lying on the water
function ring() {
  return (i, r) => {
    const a = (i / 40) * TAU;
    const wob = 1 + (r() - 0.5) * 0.15;
    return [Math.cos(a) * wob, 0, Math.sin(a) * wob];
  };
}

export default {
  slug: 'water-lilies',
  seed: 1926,
  background: 0x3f7d84,
  fog: [0x3f7d84, 16, 80],
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
        if (p < 0.30) return [0.3, 0.6, 0.58];    // teal water
        if (p < 0.52) return [0.42, 0.62, 0.8];    // sky blue
        if (p < 0.70) return [0.64, 0.57, 0.8];    // lavender
        if (p < 0.85) return [0.95, 0.7, 0.74];    // rose
        return [0.98, 0.92, 0.62];                  // yellow fleck
      },
      size: [0.7, 1.7], aspect: [1.3, 2.0], angle: 'horizontal',
      orbit: { radius: [0.1, 0.45], speed: [0.04, 0.14] },
      opacity: 0.42,
    },

    // ---- bright sky reflected across the surface (painterly reflection) ----
    {
      count: 2400,
      home: (i, r) => {
        const a = r() * TAU, rr = 2 + Math.pow(r(), 0.5) * 22;
        return [Math.cos(a) * rr, 0.05, Math.sin(a) * rr];
      },
      color: (i, r) => (r() < 0.5 ? [0.7, 0.78, 0.9] : [0.85, 0.72, 0.72]),
      size: [0.7, 1.6], aspect: [1.4, 2.2], angle: 'horizontal',
      orbit: { radius: [0.2, 0.7], speed: [0.04, 0.14] },
      opacity: 0.12,
    },

    // ---- drifting mist over the water ----
    {
      name: 'mist', count: 900,
      home: (i, r) => {
        const a = r() * TAU, rr = 3 + Math.pow(r(), 0.5) * 20;
        return [Math.cos(a) * rr, 0.4 + r() * 2.2, Math.sin(a) * rr];
      },
      color: () => [0.95, 0.93, 0.86],
      size: [4, 10], aspect: [1.6, 2.6], angle: 'horizontal',
      orbit: { radius: [0.6, 2.0], speed: [0.02, 0.06] },
      opacity: 0.05,
    },

    // ---- lily pads: flat green discs that bob (each named) ----
    ...CLUSTERS.map((c, ci) => ({
      name: `pad${ci}`, origin: [c[0], 0.03, c[2]], count: 150,
      home: (i, r) => {
        const a = r() * TAU, rr = Math.pow(r(), 0.6) * 2.4;
        return [Math.cos(a) * rr, 0, Math.sin(a) * rr];
      },
      color: (i, r) => [0.14 + r() * 0.12, 0.42 + r() * 0.18, 0.24],
      size: [0.9, 2.2], aspect: [1.5, 2.4], angle: (i, rnd) => rnd() * TAU,
      orbit: { radius: [0.02, 0.08], speed: [0.02, 0.07] },
      opacity: 0.92, blending: 'normal',   // pads sit solid on the water
    })),

    // ---- blossoms among the pads: open and close (each named) ----
    ...CLUSTERS.map((c, ci) => ({
      name: `bloom${ci}`, origin: [c[0] + 0.4, 0.16, c[2] - 0.3], count: 46,
      home: (i, r) => {
        const a = r() * TAU, rr = Math.pow(r(), 0.5) * 0.6;
        return [Math.cos(a) * rr, Math.sin(i * 1.3) * 0.1, Math.sin(a) * rr];
      },
      color: (i, r) => (ci % 2 ? [1.0, 0.75, 0.85] : [1.0, 0.97, 0.9]),
      size: [0.7, 1.4], aspect: [1.6, 2.6], angle: 'flow',
      orbit: { radius: [0.02, 0.06], speed: [0.03, 0.08] },
      opacity: 0.85,
    })),

    // ---- painted ripples that widen and fade (each named) ----
    ...RIPPLES.map((c, ci) => ({
      name: `ripple${ci}`, origin: [c[0], 0.04, c[2]], count: 40,
      home: ring(),
      color: () => [0.85, 0.92, 0.96],
      size: [0.5, 0.9], aspect: [2.2, 3.2], angle: 'swirl',
      orbit: { radius: [0.01, 0.03], speed: [0.02, 0.06] },
      opacity: 0.5,
    })),

    // ---- willow reflections hanging into the blue ----
    ...[70, 190, 300].map((deg) => ({
      origin: [...az(deg, 13, 0)], count: 600,
      home: (i, r) => {
        const strand = Math.floor(r() * 8);
        const t = r();
        return [(strand - 4) * 0.7 + Math.sin(t * 4) * 0.5, 0.2 - t * 5, (r() - 0.5) * 1.5];
      },
      color: (i, r) => [0.24 + r() * 0.15, 0.52 + r() * 0.2, 0.3],
      size: [0.5, 1.1], aspect: [2.6, 3.8], angle: 'vertical',
      orbit: { radius: [0.05, 0.25], speed: [0.05, 0.16] },
      opacity: 0.4,
    })),
  ],

  glows: [
    { pos: [7, 7, -6], color: 0xfff2d0, size: 9, opacity: 0.16 },   // the warm sun
    { pos: az(150, 7, 0.4), color: 0xffc4da, size: 2.6, opacity: 0.18 },
    { pos: az(40, 6, 0.4), color: 0xfff0d0, size: 2.2, opacity: 0.18 },
  ],

  nodes: [
    { id: 'surface', pos: az(40, 6, 0.5), color: 0xbfe8e0, size: 1.6, reach: 5 },
    { id: 'blooms', pos: az(150, 7, 0.5), color: 0xffc4da, size: 1.6, reach: 5 },
    { id: 'refuge', pos: az(255, 6, 0.5), color: 0xd9c8ff, size: 1.6, reach: 5 },
  ],

  onTick(clock, tempo, api) {
    // pads bob gently on the water
    for (let i = 0; i < CLUSTERS.length; i++) {
      const pad = api.field(`pad${i}`);
      if (pad) pad.position.y = 0.03 + Math.sin(clock * 0.5 * tempo + i * 1.7) * 0.08;
      // blossoms open and close
      const bloom = api.field(`bloom${i}`);
      if (bloom) {
        const open = 0.75 + 0.45 * (0.5 + 0.5 * Math.sin(clock * 0.4 * tempo + i));
        bloom.scale.set(open, 1, open);
      }
    }
    // ripples widen and fade, then begin again
    for (let i = 0; i < RIPPLES.length; i++) {
      const rp = api.field(`ripple${i}`);
      if (!rp) continue;
      const period = 6;
      const k = ((clock * tempo + i * 1.7) % period) / period;   // 0..1
      const s = 0.3 + k * 3.2;
      rp.scale.set(s, 1, s);
      if (rp.material?.uniforms) rp.material.uniforms.uOpacity.value = (1 - k) * 0.5;
    }
    // mist drifts
    const mist = api.field('mist');
    if (mist) mist.rotation.y = clock * 0.02 * tempo;
  },

  music: {
    root: 196, scale: [0, 2, 4, 7, 9], brightness: 0.7,
    padLevel: 0.045, pluckEvery: [5, 11], timbre: 'sine',
  },
};
