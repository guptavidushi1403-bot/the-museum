/**
 * Inside Under the Wave off Kanagawa — Hokusai's wave, towering.
 *
 * Built painting-first: you stand low on the sea and face the great wave,
 * a curling claw of Prussian blue and foam that rears on the left, arcs
 * overhead and hooks toward you; Mount Fuji sits small, snow-capped and
 * still in the hollow of the wave; three boats are dwarfed in the trough
 * before you. The camera never circles behind — it sways at the foot of
 * the wave, so the composition always reads as the print. Environmental
 * sense-lines only, from docs/research/great-wave.md.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;

// The crest line of the wave: rises on the left, peaks, then plunges into
// the hollow on the right — and hooks toward the viewer at the top.
function crest(u) {
  const x = -17 + u * 22;
  const rise = Math.sin(Math.min(u / 0.34, 1) * Math.PI / 2);      // up to the peak
  const fall = u > 0.34 ? Math.pow((u - 0.34) / 0.66, 1.3) : 0;    // plunge after
  const y = -1 + rise * 17 - fall * 13;
  const z = -12 + rise * 7 - (u > 0.34 ? (u - 0.34) * 4 : 0);      // curls toward you
  return [x, y, z];
}

export default {
  slug: 'great-wave',
  seed: 1831,
  background: 0x1b2f56,
  fog: [0x1b2f56, 26, 130],
  // Directional composition: face the wave, sway — never orbit behind it.
  camera: { radius: 12, height: 1.0, speed: 0.06, bob: 0.5, lookHeight: 6, faceAngle: Math.PI / 2, sway: 0.42 },

  strokes: [
    // ---- the deep sea, swelling in the foreground and trough ----
    {
      count: 5200,
      home: (i, r) => {
        // denser in front of the viewer (toward -z), spreading wide
        const x = (r() - 0.5) * 44;
        const z = -20 + r() * 34;
        const swell = Math.sin(x * 0.25) * 1.1 + Math.sin(z * 0.3) * 0.9;
        return [x, -2.4 + r() * 1.8 + swell, z];
      },
      color: (i, r) => {
        if (r() < 0.08) return [0.86, 0.93, 0.97];
        const v = 0.45 + r() * 0.5;
        return [0.06 * v, 0.19 * v, 0.5 * v];
      },
      size: [0.6, 1.7], aspect: [2.4, 3.8], angle: 'horizontal',
      orbit: { radius: [0.25, 0.9], speed: [0.1, 0.3] },
      opacity: 0.55,
    },

    // ---- the great wave: a towering curl of blue with a foam edge ----
    {
      name: 'wave', count: 7000,
      home: (i, r) => {
        const u = Math.pow(r(), 0.85);         // bias toward the tall left shoulder
        const d = r();                          // 0 at crest → 1 at the sea
        const [cx, cy, cz] = crest(u);
        const x = cx + (r() - 0.5) * 1.8;
        const y = cy - d * (cy + 1.8);
        const z = cz + d * 3.2 + (r() - 0.5) * 1.3;
        return [x, y, z];
      },
      color: (i, r) => {
        const d = r();
        if (d < 0.16) return [0.9, 0.95, 0.98];          // foam edge along the crest
        const v = 0.4 + r() * 0.55;
        return [0.05 * v, 0.18 * v, 0.5 * v];             // deep Prussian body
      },
      size: [0.7, 2.0], aspect: [2.6, 4.2],
      angle: (i, rnd, h) => Math.atan2(h[1] + 3, h[0] + 6) + (rnd() - 0.5) * 0.5,
      orbit: { radius: [0.2, 0.8], speed: [0.1, 0.28] },
      opacity: 0.66,
    },

    // ---- the claw: foam fingers curling off the peak toward the viewer ----
    {
      name: 'claw', count: 2400,
      home: (i, r) => {
        const f = Math.floor(r() * 9);
        const t = r();
        const [cx, cy, cz] = crest(0.14 + f * 0.05);      // along the crest near the peak
        return [cx + t * 3.2 + Math.sin(t * 6) * 0.7, cy - t * t * 7 + Math.sin(t * 11) * 0.3, cz + t * 4.5];
      },
      color: (i, r) => (r() < 0.75 ? [0.93, 0.96, 0.99] : [0.72, 0.85, 0.96]),
      size: [0.5, 1.5], aspect: [2.4, 3.8], angle: 'flow',
      orbit: { radius: [0.15, 0.7], speed: [0.2, 0.55] },
      opacity: 0.75,
    },

    // ---- spray flung from the crest ----
    {
      name: 'spray', count: 800,
      home: (i, r) => {
        const [cx, cy, cz] = crest(0.1 + r() * 0.4);
        return [cx + (r() - 0.5) * 6, cy + r() * 5, cz + r() * 4];
      },
      color: () => [0.94, 0.97, 0.99],
      size: [0.3, 0.7], aspect: [1.6, 2.4], angle: (i, rnd) => rnd() * TAU,
      orbit: { radius: [0.5, 1.8], speed: [0.3, 0.8] },
      opacity: 0.5,
    },

    // ---- Mount Fuji: small, snow-capped, still, in the hollow of the wave ----
    {
      name: 'fuji', origin: [4, -0.5, -18], count: 1500,
      home: (i, r) => {
        const h = Math.pow(r(), 0.65);          // dense at the base → a solid triangle
        const rr = (1 - h) * 6;
        const a = r() * TAU;
        return [Math.cos(a) * rr, h * 7.5, Math.sin(a) * rr * 0.22];
      },
      color: (i, r) => {
        const h = r();
        if (h > 0.66) return [0.97, 0.97, 0.96];          // snow cap
        return [0.3 + r() * 0.12, 0.38 + r() * 0.12, 0.56];
      },
      size: [0.9, 2.0], aspect: [1.6, 2.6], angle: 'flow',
      orbit: { radius: [0.003, 0.015], speed: [0.003, 0.015] },
      opacity: 0.95, blending: 'normal',
    },

    // ---- three boats, dwarfed in the trough before you (each bobbing) ----
    ...[[-5, -6], [1, -3.5], [6, -5]].map(([bx, bz], bi) => ({
      name: `boat${bi}`, origin: [bx, -1.2, bz], count: 130,
      home: (i, r) => {
        if (i < 92) return [(r() - 0.5) * 4.6, (r() - 0.5) * 0.28, (r() - 0.5) * 0.8];  // hull
        return [(r() - 0.5) * 3.6, 0.25 + r() * 0.3, (r() - 0.5) * 0.28];               // rowers
      },
      color: (i) => (i < 92 ? [0.62, 0.46, 0.22] : [0.13, 0.1, 0.08]),
      size: [0.35, 0.8], aspect: [1.6, 2.6], angle: 'horizontal',
      orbit: { radius: [0.04, 0.18], speed: [0.1, 0.3] },
      opacity: 0.92, blending: 'normal',
    })),

    // ---- ocean mist hanging low over the trough ----
    {
      name: 'mist', count: 600,
      home: (i, r) => [(r() - 0.5) * 40, -0.5 + r() * 3, -18 + r() * 26],
      color: () => [0.82, 0.88, 0.94],
      size: [5, 12], aspect: [1.6, 2.6], angle: 'horizontal',
      orbit: { radius: [0.6, 2.0], speed: [0.02, 0.06] },
      opacity: 0.05,
    },

    // ---- the pale cream sky behind and above (Hokusai's ground tone) ----
    {
      count: 1800,
      home: (i, r) => [(r() - 0.5) * 66, 2 + r() * 20, -23 - r() * 12],
      color: (i, r) => [0.9, 0.85 - r() * 0.08, 0.72],
      size: [1.0, 2.4], aspect: [1.8, 2.8], angle: 'horizontal',
      orbit: { radius: [0.1, 0.5], speed: [0.02, 0.08] },
      opacity: 0.34,
    },
  ],

  glows: [
    { pos: [4, 3, -18], color: 0xf6efe0, size: 8, opacity: 0.34 },    // light on Fuji
    { pos: [-8, 13, -6], color: 0xdfeefd, size: 11, opacity: 0.24 },  // the crest's breath
  ],

  nodes: [
    { id: 'fuji', pos: [4, 2, -18], color: 0xf4ede0, size: 2.4, reach: 20 },
    { id: 'claw', pos: [-8, 13, -6], color: 0xcfe6ff, size: 2.6, reach: 9 },
    { id: 'boats', pos: [1, -0.5, -3.5], color: 0xe8c07a, size: 1.6, reach: 6 },
    { id: 'print', pos: [12, 4, -10], color: 0xf0e2c0, size: 1.8, reach: 7 },
  ],

  onTick(clock, tempo, api) {
    // the whole wave heaves and leans toward you, breathing
    const wave = api.field('wave');
    const claw = api.field('claw');
    const spray = api.field('spray');
    const lean = Math.sin(clock * 0.26 * tempo);
    if (wave) { wave.rotation.z = lean * 0.04; wave.position.y = lean * 0.5; }
    if (claw) { claw.rotation.z = lean * 0.06; claw.position.y = 1 + lean * 0.7; }
    if (spray) spray.position.y = 1 + Math.abs(lean) * 1.5;
    // boats bob and pitch in the swell
    for (let i = 0; i < 3; i++) {
      const boat = api.field(`boat${i}`);
      if (boat) {
        boat.position.y = -1.2 + Math.sin(clock * 0.6 * tempo + i * 2) * 0.35;
        boat.rotation.z = Math.cos(clock * 0.6 * tempo + i * 2) * 0.12;
      }
    }
    const mist = api.field('mist');
    if (mist) mist.position.x = Math.sin(clock * 0.05 * tempo) * 3;
  },

  music: {
    root: 82.41, scale: [0, 2, 3, 7, 9], brightness: 0.5,
    padLevel: 0.055, pluckEvery: [8, 15], timbre: 'triangle',
  },
};
