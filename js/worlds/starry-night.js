/**
 * Inside The Starry Night — the painting's own elements, in 3D.
 *
 * The two great swirls turn as real spirals you can fly into; the eleven
 * stars and the crescent moon hang where Van Gogh placed them, each a ring
 * of light; the cypress is a towering dark flame in the foreground; the
 * village sleeps below its Dutch spire; the hills roll behind. Every
 * element is built from brushstrokes and carries finer strokes within, so
 * coming closer keeps revealing paint. Words: letters 691, 783, 777 via
 * docs/research/starry-night.md.
 */
import { az } from './strokes.js';

const TAU = Math.PI * 2;

// A spiral of dabs in the XY plane (a swirl seen face-on in the sky).
function spiral(turns, spread, thickness) {
  return (i, r) => {
    const t = i / 1;
    const a = r() * TAU * turns;
    const rad = Math.pow(r(), 0.55) * spread;
    const wob = (r() - 0.5) * thickness;
    return [Math.cos(a) * rad, Math.sin(a) * rad, wob];
  };
}

export default {
  slug: 'starry-night',
  seed: 1889,
  background: 0x080c1c,
  fog: [0x080c1c, 20, 90],
  camera: { radius: 11, height: 2, speed: 0.025, bob: 0.4, lookHeight: 7 },

  strokes: [
    // ---- the rolling sky current, filling the upper world ----
    {
      name: 'current', count: 4200,
      home: (i, r) => {
        const x = (r() - 0.5) * 60;
        const y = 6 + r() * 16;
        const z = -10 + (r() - 0.5) * 40;
        return [x, y + Math.sin(x * 0.15) * 2, z];
      },
      color: (i, r) => {
        const v = 0.7 + r() * 0.3;
        return r() < 0.12 ? [0.95, 0.85, 0.45] : [0.35 * v, 0.5 * v, 0.92 * v];
      },
      size: [0.5, 1.7],
      orbit: { radius: [0.4, 1.4], speed: [0.05, 0.16] },
      opacity: 0.34,
    },

    // ---- the great swirl (turns via onTick) ----
    {
      name: 'swirlA', origin: [3, 12, -6], count: 2400,
      home: spiral(2.2, 7, 1.6),
      color: (i, r) => (r() < 0.7 ? [0.6, 0.72, 1.0] : [0.95, 0.85, 0.5]),
      size: [0.6, 2.0],
      orbit: { radius: [0.15, 0.6], speed: [0.1, 0.3] },
      opacity: 0.5,
    },
    // fine detail inside the great swirl — revealed as you fly in
    {
      name: 'swirlAfine', origin: [3, 12, -6], count: 1500,
      home: spiral(2.4, 6.4, 0.7),
      color: () => [0.85, 0.92, 1.0],
      size: [0.25, 0.7],
      orbit: { radius: [0.1, 0.4], speed: [0.15, 0.4] },
      opacity: 0.55,
    },

    // ---- the second swirl ----
    {
      name: 'swirlB', origin: [-5, 13.5, -4], count: 1500,
      home: spiral(1.9, 4.6, 1.3),
      color: (i, r) => (r() < 0.7 ? [0.55, 0.68, 0.98] : [0.9, 0.82, 0.5]),
      size: [0.6, 1.8],
      orbit: { radius: [0.12, 0.5], speed: [0.12, 0.34] },
      opacity: 0.48,
    },

    // ---- the wheat field below ----
    {
      count: 3600,
      home: (i, r) => {
        const a = r() * TAU, rr = 3 + Math.pow(r(), 0.7) * 20;
        return [Math.cos(a) * rr, -2.4 + r() * 1.6, Math.sin(a) * rr];
      },
      color: (i, r) => (r() < 0.6 ? [0.4 + r() * 0.3, 0.36, 0.12] : [0.12, 0.26, 0.13]),
      size: [0.3, 0.8],
      orbit: { radius: [0.05, 0.2], speed: [0.1, 0.4] },
      opacity: 0.3,
    },

    // ---- the cypress: a towering flame of dark green (occludes) ----
    {
      name: 'cypress', origin: [...az(206, 6.5, 0)], count: 2200,
      home: (i, r) => {
        const h = Math.pow(r(), 0.8);       // dense at base
        const taper = (1 - h) * 1.7 + 0.12;
        const a = r() * TAU;
        const rr = Math.pow(r(), 0.5) * taper;
        return [Math.cos(a) * rr, h * 11 - 2, Math.sin(a) * rr];
      },
      color: (i, r) => (r() < 0.55 ? [0.03, 0.09, 0.04] : [0.06, 0.17, 0.07]),
      size: [0.5, 1.3],
      orbit: { radius: [0.06, 0.28], speed: [0.15, 0.45] },
      opacity: 0.92,
      blending: 'normal',
    },
    // green fire licking the cypress edge (catches starlight)
    {
      origin: [...az(206, 6.5, 0)], count: 500,
      home: (i, r) => {
        const h = Math.pow(r(), 0.7);
        const a = r() * TAU;
        const rr = (1 - h) * 1.9 + 0.3;
        return [Math.cos(a) * rr, h * 11 - 2, Math.sin(a) * rr];
      },
      color: () => [0.2, 0.5, 0.24],
      size: [0.3, 0.9],
      orbit: { radius: [0.1, 0.4], speed: [0.2, 0.5] },
      opacity: 0.3,
    },

    // ---- the village: houses of warm dark pigment ----
    {
      origin: [...az(332, 11, 0)], count: 900,
      home: (i, r) => {
        // clustered blocks along the valley
        const bx = (Math.floor(r() * 9) - 4) * 1.5;
        return [bx + (r() - 0.5) * 1.0, -2.2 + r() * 1.4, (r() - 0.5) * 3];
      },
      color: (i, r) => (r() < 0.7 ? [0.1, 0.12, 0.18] : [0.16, 0.14, 0.2]),
      size: [0.4, 1.0],
      orbit: { radius: [0.02, 0.08], speed: [0.03, 0.1] },
      opacity: 0.8,
      blending: 'normal',
    },
    // warm lit windows
    {
      origin: [...az(332, 11, 0)], count: 120,
      home: (i, r) => [(Math.floor(r() * 9) - 4) * 1.5 + (r() - 0.5), -1.6 + r() * 0.9, (r() - 0.5) * 2.5],
      color: () => [1.0, 0.75, 0.35],
      size: [0.4, 0.9],
      orbit: { radius: [0.01, 0.05], speed: [0.05, 0.15] },
      opacity: 0.85,
    },
    // the spire: a needle rising over the roofs
    {
      origin: [...az(332, 11, 0)], count: 220,
      home: (i, r) => {
        const h = r();
        return [(r() - 0.5) * 0.4, -1 + h * 4.5, (r() - 0.5) * 0.4];
      },
      color: () => [0.14, 0.15, 0.22],
      size: [0.3, 0.7],
      orbit: { radius: [0.01, 0.05], speed: [0.05, 0.15] },
      opacity: 0.85,
      blending: 'normal',
    },

    // ---- the hills rolling behind ----
    {
      count: 1400,
      home: (i, r) => {
        const a = (0.55 + r() * 0.5) * Math.PI; // back arc
        const rr = 16 + r() * 8;
        return [Math.cos(a) * rr, -1 + Math.sin(r() * TAU) * 1.5, -Math.abs(Math.sin(a)) * rr - 4];
      },
      color: (i, r) => [0.16 + r() * 0.1, 0.2 + r() * 0.12, 0.34],
      size: [0.6, 1.6],
      orbit: { radius: [0.1, 0.4], speed: [0.05, 0.15] },
      opacity: 0.4,
    },
  ],

  // stars where Van Gogh placed them (azimuth around, height, depth), and the moon
  glows: [
    { pos: az(80, 20, 15), color: 0xffe08a, size: 7, opacity: 0.5 },   // crescent moon, upper right
    { pos: az(20, 15, 9), color: 0xbfe0ff, size: 4.2, opacity: 0.6 },  // Venus
    { pos: az(-8, 16, 11), color: 0xfff2c0, size: 2.6, opacity: 0.55 },
    { pos: az(-30, 17, 8), color: 0xfff2c0, size: 2.2, opacity: 0.5 },
    { pos: az(45, 18, 10), color: 0xffe8b0, size: 2.4, opacity: 0.5 },
    { pos: az(110, 17, 9), color: 0xfff2c0, size: 2.3, opacity: 0.5 },
    { pos: az(135, 16, 6), color: 0xffe8b0, size: 2.0, opacity: 0.5 },
    { pos: az(160, 18, 7), color: 0xfff2c0, size: 2.2, opacity: 0.5 },
    { pos: [3, 12, -6], color: 0x9fb8ff, size: 6, opacity: 0.25 },      // heart of swirl A
    { pos: [-5, 13.5, -4], color: 0x9fb8ff, size: 5, opacity: 0.22 },  // heart of swirl B
  ],

  nodes: [
    { id: 'sky', pos: [3, 12, -6], color: 0xffe6a0, size: 2.0, reach: 6 },
    { id: 'cypress', pos: az(206, 6.2, 4), color: 0x9fd8a8, size: 1.6, reach: 6 },
    { id: 'village', pos: az(332, 10, 0.5), color: 0xffd27a, size: 1.5, reach: 6 },
    { id: 'venus', pos: az(20, 15, 9), color: 0xcfe6ff, size: 1.3, reach: 6 },
  ],

  onTick(clock, tempo, api) {
    const a = api.field('swirlA');
    const af = api.field('swirlAfine');
    const b = api.field('swirlB');
    if (a) a.rotation.z = clock * 0.22 * tempo;
    if (af) af.rotation.z = clock * 0.30 * tempo;
    if (b) b.rotation.z = -clock * 0.26 * tempo;
  },

  music: {
    root: 146.83, scale: [0, 3, 5, 7, 10], brightness: 0.55,
    padLevel: 0.05, pluckEvery: [6, 14], timbre: 'triangle',
  },
};
