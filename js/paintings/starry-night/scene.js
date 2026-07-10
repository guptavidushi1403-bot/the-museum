/**
 * The Starry Night — inside the sky he needed.
 *
 * A wheat-country night: the sky rolls in two slow vortices overhead,
 * stars burn with breathing halos, the village sleeps below an invented
 * spire, the cypress stands close like a dark flame. Four discoveries,
 * any order, any subset. All words are from docs/research/starry-night.md
 * (letters 691, 783, 777; village line grounded in MoMA facts F4/F5).
 * The bars near Venus stay a felt shift at the edge of vision — never a
 * stated fact (research: "Not cleared" guidance).
 */
import { TAU, mulberry32, hsla, glow, dab } from '../helpers.js';

const rnd = mulberry32(1889);

/* ----- the sky ----- */
const VORTICES = [
  { x: 0.44, y: 0.28, r: 0.16, squash: 0.62, dir: 1 },
  { x: 0.63, y: 0.22, r: 0.10, squash: 0.7, dir: -1 },
];
const swirl = [];
for (const [vi, v] of VORTICES.entries()) {
  const count = vi === 0 ? 70 : 44;
  for (let i = 0; i < count; i++) {
    const t = Math.pow(rnd(), 0.55);
    swirl.push({
      v, orbit: 0.25 + t * 1.1,
      angle: rnd() * TAU,
      speed: (0.10 + (1 - t) * 0.22) * v.dir,
      size: 2.2 + rnd() * 4.4,
      pale: rnd() < 0.75,
      tw: rnd() * TAU,
    });
  }
}
const CURRENT = Array.from({ length: 34 }, (_, i) => ({
  u: i / 33, jitter: (rnd() - 0.5) * 0.05, size: 1.6 + rnd() * 2.6, ph: rnd() * TAU,
}));
const STARS = [
  [0.10, 0.16], [0.22, 0.10], [0.30, 0.30], [0.51, 0.12], [0.70, 0.34],
  [0.77, 0.12], [0.86, 0.28], [0.57, 0.40], [0.19, 0.42], [0.90, 0.45],
].map(([x, y]) => ({ x, y, halo: 15 + rnd() * 16, ph: rnd() * TAU }));
const MOON = { x: 0.905, y: 0.10 };
const VENUS = { x: 0.33, y: 0.47 };

/* ----- the land ----- */
const HOUSES = Array.from({ length: 11 }, (_, i) => ({
  x: 0.40 + i * 0.032 + (rnd() - 0.5) * 0.015,
  y: 0.80 + (rnd() - 0.5) * 0.02 + (i % 3) * 0.012,
  w: 8 + rnd() * 10,
  lit: rnd() < 0.7,
  ph: rnd() * TAU,
}));
const SPIRE = { x: 0.545, y: 0.72 };

/* ----- the cypress ----- */
const FLAMES = Array.from({ length: 30 }, (_, i) => {
  const t = i / 29; // 0 at base, 1 at tip
  return {
    t,
    dx: (rnd() - 0.5) * 0.35 * (1 - t * 0.5),
    w: (1 - t) * 0.36 + 0.05,
    dark: rnd() < 0.6,
    ph: rnd() * TAU,
  };
});

let venusNoticedAt = null;

export default {
  slug: 'starry-night',
  title: 'The Starry Night',
  artist: 'Vincent van Gogh',
  year: '1889',
  emotion: 'wonder',
  aspect: 1.26,
  connectionThreshold: 3,
  connectionTone: [261.63, 392.0, 523.25],

  ambient(sound) {
    const wind = sound.noise({ color: 'pink', level: 0.05, fadeIn: 5, filter: { frequency: 260 } });
    const shimmer = sound.drone({ frequencies: [1568, 2093], spread: 7 });
    shimmer.set(0.008, 6);
    return {
      stop(seconds = 4) { wind.stop(seconds); shimmer.stop(seconds); },
    };
  },

  nodes: [
    {
      id: 'sky', at: [0.62, 0.26], r: 0.18, layer: 0,
      reveal: {
        kind: 'quote',
        text: '…a tremendous need for, shall I say the word — for religion — so I go outside at night to paint the stars…',
        attribution: 'letter to Theo — September 1888',
      },
    },
    {
      id: 'cypress', at: [0.16, 0.5], r: 0.17, layer: 2,
      reveal: {
        kind: 'quote',
        text: 'The cypresses still preoccupy me, I’d like to do something with them like the canvases of the sunflowers because it astonishes me that no one has yet done them as I see them.',
        attribution: 'letter to Theo — June 1889',
      },
    },
    {
      id: 'village', at: [0.55, 0.78], r: 0.14, layer: 1,
      reveal: {
        kind: 'sense',
        text: 'No village like this stood outside the window — a memory, Dutch spire and all.',
      },
    },
    {
      id: 'venus', at: [0.33, 0.47], r: 0.11, layer: 0,
      reveal: {
        kind: 'quote',
        text: 'This morning I saw the countryside from my window a long time before sunrise, with nothing but the morning star, which looked very big.',
        attribution: 'letter to Theo — June 1889',
      },
    },
  ],

  layers: [
    { depth: 0.22, draw: drawSky },
    { depth: 0.5, draw: drawLand },
    { depth: 0.85, draw: drawCypress },
  ],

  drawWhole,
};

function drawSky(ctx, view, clock, dt, world) {
  const skyAtt = world.nodes.get('sky').attention;
  const venus = world.nodes.get('venus');
  const conn = world.connection;

  // Night air, deeper above.
  const grad = ctx.createLinearGradient(0, 0, 0, view.h);
  grad.addColorStop(0, 'hsl(228, 48%, 11%)');
  grad.addColorStop(0.66, 'hsl(224, 42%, 17%)');
  grad.addColorStop(1, 'hsl(220, 36%, 20%)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, view.w, view.h);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // The rolling current across the sky.
  for (const c of CURRENT) {
    const cx = (0.06 + c.u * 0.88) * view.w;
    const cy = (0.30 + c.jitter + Math.sin(c.u * TAU * 1.15 + clock * 0.22) * 0.055) * view.h;
    dab(ctx, cx, cy, c.size * 3.4, c.size * 1.1, Math.cos(c.u * TAU) * 0.5,
      [210, 45, 72], 0.16 + 0.16 * skyAtt + 0.07 * conn);
  }

  // Two vortices, turning like weather.
  for (const s of swirl) {
    s.angle += s.speed * dt * (1 + skyAtt * 0.5);
    const R = s.v.r * Math.min(view.w, view.h) * s.orbit;
    const px = s.v.x * view.w + Math.cos(s.angle) * R;
    const py = s.v.y * view.h + Math.sin(s.angle) * R * s.v.squash;
    const tw = 0.7 + 0.3 * Math.sin(clock * 1.5 + s.tw);
    dab(ctx, px, py, s.size, s.size * 0.55, s.angle + Math.PI / 2,
      s.pale ? [215, 50, 80] : [45, 80, 74], (0.2 + 0.32 * skyAtt + 0.1 * conn) * tw);
  }

  // Stars, moon, Venus — each with a breathing halo.
  for (const st of STARS) {
    const breathe = 0.65 + 0.35 * Math.sin(clock * 0.5 + st.ph);
    glow(ctx, st.x * view.w, st.y * view.h, st.halo * (1 + 0.5 * skyAtt + 0.4 * conn),
      [46, 85, 70], (0.16 + 0.24 * skyAtt + 0.12 * conn) * breathe);
    dab(ctx, st.x * view.w, st.y * view.h, 1.8, 1.8, 0, [50, 40, 96], 0.75);
  }

  const mx = MOON.x * view.w, my = MOON.y * view.h;
  glow(ctx, mx, my, 58, [44, 90, 66], 0.30 + 0.1 * conn);
  ctx.fillStyle = hsla([46, 90, 78], 0.9);
  ctx.beginPath();
  ctx.arc(mx, my, 15, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'hsl(228, 48%, 11%)';
  ctx.beginPath();
  ctx.arc(mx - 9, my - 4, 13, 0, TAU);
  ctx.fill();

  const vx = VENUS.x * view.w, vy = VENUS.y * view.h;
  const va = venus.attention;
  glow(ctx, vx, vy, 34 * (1 + va * 1.1), [200, 55, 82], 0.28 + 0.4 * va);
  dab(ctx, vx, vy, 2.6, 2.6, 0, [200, 30, 97], 0.9);

  ctx.restore();

  // A felt shift only: as the morning star is understood, the faintest
  // verticals rest at the edge of vision, then dissolve.
  if (venus.noticed && venusNoticedAt === null) venusNoticedAt = clock;
  if (venusNoticedAt !== null) {
    const age = clock - venusNoticedAt;
    const a = age < 3 ? (age / 3) * 0.05 : Math.max(0, 0.05 - (age - 3) * 0.012);
    if (a > 0.003) {
      ctx.fillStyle = `rgba(6, 7, 12, ${a})`;
      for (let i = 0; i < 4; i++) {
        const bx = view.w * (0.06 + i * 0.055);
        ctx.fillRect(bx, 0, 9, view.h);
      }
    }
  }
}

function drawLand(ctx, view, clock, dt, world) {
  const att = world.nodes.get('village').attention;
  const conn = world.connection;

  // Hills rolling under the sky.
  const hillY = (u) => 0.72 + Math.sin(u * TAU * 0.9 + 1.2) * 0.045 + Math.sin(u * TAU * 2.3) * 0.012;
  ctx.fillStyle = hsla([222, 30, 12], 0.95);
  ctx.beginPath();
  ctx.moveTo(0, view.h * 0.78);
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    ctx.lineTo(u * view.w, hillY(u) * view.h);
  }
  ctx.lineTo(view.w, view.h);
  ctx.lineTo(0, view.h);
  ctx.fill();

  // Pigment over the silhouette: the hills are brushed, not cut out.
  for (let i = 0; i < 70; i++) {
    const u = (i * 0.617) % 1;
    const row = (i * 0.383) % 1;
    const y = hillY(u) + 0.015 + row * 0.2;
    if (y > 1.02) continue;
    dab(ctx, u * view.w, y * view.h, 16 + (i % 5) * 7, 4.5,
      Math.cos(u * TAU * 0.9 + 1.2) * 0.25,
      (i % 3 === 0) ? [200, 30, 17] : [230, 28, 14], 0.35);
  }

  // The village: sleeping houses, warm windows waking to attention.
  for (const h of HOUSES) {
    const x = h.x * view.w, y = h.y * view.h;
    ctx.fillStyle = hsla([224, 25, 9], 1);
    ctx.fillRect(x - h.w / 2, y - h.w * 0.55, h.w, h.w * 0.55);
    if (h.lit) {
      const flick = 0.75 + 0.25 * Math.sin(clock * 1.8 + h.ph);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, x, y - h.w * 0.22, 11 + 10 * att, [38, 90, 62], (0.35 + 0.5 * att + 0.1 * conn) * flick);
      dab(ctx, x, y - h.w * 0.22, 2.2, 1.6, 0, [42, 80, 80], (0.5 + 0.4 * att) * flick);
      ctx.restore();
    }
  }

  // The spire — Dutch, remembered, needle over the roofs.
  const sx = SPIRE.x * view.w, sy = SPIRE.y * view.h;
  ctx.fillStyle = hsla([224, 28, 8], 1);
  ctx.beginPath();
  ctx.moveTo(sx, sy - view.h * 0.085);
  ctx.lineTo(sx + 7, sy);
  ctx.lineTo(sx - 7, sy);
  ctx.fill();
  ctx.fillRect(sx - 5, sy - 4, 10, view.h * 0.06);
  if (att > 0.1) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, sx, sy - view.h * 0.05, 26, [220, 40, 55], 0.16 * att);
    ctx.restore();
  }
}

function drawCypress(ctx, view, clock, dt, world) {
  const att = world.nodes.get('cypress').attention;
  const conn = world.connection;
  const baseX = 0.16 * view.w;
  const baseY = 0.92 * view.h;
  const height = 0.62 * view.h;
  const sway = Math.sin(clock * 0.55) * (0.012 + 0.02 * att) * view.w;

  for (const f of FLAMES) {
    const y = baseY - f.t * height;
    const x = baseX + f.dx * view.w * 0.05 + sway * f.t * f.t
      + Math.sin(clock * 0.8 + f.ph) * 3 * f.t * (0.5 + att);
    const w = f.w * view.w * 0.055;
    dab(ctx, x, y, w, w * 2.4, Math.sin(clock * 0.5 + f.ph) * 0.12 + sway * 0.0004,
      f.dark ? [150, 35, 9] : [140, 40, 15 + att * 12], 0.85);
  }
  // The living edge: green catches starlight under attention.
  if (att > 0.05 || conn > 0.3) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, baseX + sway, baseY - height * 0.7, view.w * 0.06,
      [130, 45, 30], 0.14 * att + 0.08 * conn);
    ctx.restore();
  }
}

/** The whole canvas, reassembled: sky, village, cypress — standing before it. */
function drawWhole(ctx, w, h, clock) {
  const view = { w, h };
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'hsl(228, 50%, 13%)');
  grad.addColorStop(0.7, 'hsl(223, 44%, 19%)');
  grad.addColorStop(1, 'hsl(220, 38%, 22%)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const world = {
    connection: 1,
    nodes: new Map([
      ['sky', { attention: 0.45 }],
      ['village', { attention: 0.3 }],
      ['cypress', { attention: 0.25 }],
      ['venus', { attention: 0.3, noticed: false }],
    ]),
  };
  drawSky(ctx, view, clock * 0.5, 0, world);
  drawLand(ctx, view, clock * 0.5, 0, world);
  drawCypress(ctx, view, clock * 0.5, 0, world);
}
