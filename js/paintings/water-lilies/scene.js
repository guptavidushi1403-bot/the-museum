/**
 * Water Lilies — inside the pond at Giverny.
 *
 * There is no horizon anywhere in this world: only water, holding the
 * sky upside down. The light drifts slowly through the hours — dawn rose,
 * noon green, evening violet — never twice the same. Willows lean in from
 * above like memory. Three discoveries. Words are Monet's documented
 * intention as reported by Roger Marx (1909); see
 * docs/research/water-lilies.md (M1, M2, cleared interpretive line).
 */
import { TAU, mulberry32, hsla, glow, dab } from '../helpers.js';

const rnd = mulberry32(1926);

// The hours of the pond: hue-fields the water drifts through.
const HOURS = [
  { sky: [205, 40, 60], water: [170, 30, 34], bloom: [340, 55, 78] }, // dawn
  { sky: [150, 25, 52], water: [160, 35, 30], bloom: [50, 60, 85] },  // noon
  { sky: [265, 30, 55], water: [230, 30, 32], bloom: [320, 45, 80] }, // evening
];

const REFLECT = Array.from({ length: 46 }, () => ({
  u: rnd(), v: rnd(),
  len: 0.05 + rnd() * 0.16, // vertical streaks: the sky upside down
  ph: rnd() * TAU,
  sp: 0.4 + rnd() * 0.9,
}));

const PADS = [];
const CLUSTERS = [[0.26, 0.66], [0.62, 0.42], [0.8, 0.72], [0.42, 0.82], [0.14, 0.36]];
for (const [cx, cy] of CLUSTERS) {
  const n = 5 + Math.floor(rnd() * 5);
  for (let i = 0; i < n; i++) {
    PADS.push({
      x: cx + (rnd() - 0.5) * 0.13,
      y: cy + (rnd() - 0.5) * 0.07,
      size: 9 + rnd() * 17,
      bloom: rnd() < 0.3,
      ph: rnd() * TAU,
    });
  }
}

const FRONDS = Array.from({ length: 26 }, (_, i) => ({
  x: (i < 13 ? 0.02 + rnd() * 0.16 : 0.82 + rnd() * 0.16),
  len: 0.14 + rnd() * 0.2,
  ph: rnd() * TAU,
  w: 1.4 + rnd() * 1.6,
}));

const ripples = [];
let nextRipple = 0;

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// The slow drift of light through the pond's hours (~90s per hour).
function hourColors(clock) {
  const t = (clock / 90) % HOURS.length;
  const i = Math.floor(t), f = t - i;
  const a = HOURS[i], b = HOURS[(i + 1) % HOURS.length];
  const s = f * f * (3 - 2 * f);
  return { sky: mix(a.sky, b.sky, s), water: mix(a.water, b.water, s), bloom: mix(a.bloom, b.bloom, s) };
}

export default {
  slug: 'water-lilies',
  title: 'Water Lilies',
  artist: 'Claude Monet',
  year: 'c. 1915–26',
  emotion: 'serenity',
  aspect: 3.0,
  connectionThreshold: 2,
  connectionTone: [196.0, 293.66],

  ambient(sound) {
    const water = sound.noise({ color: 'pink', level: 0.055, fadeIn: 6, filter: { frequency: 420 } });
    const under = sound.drone({ frequencies: [98], spread: 2 });
    under.set(0.012, 8);
    return { stop(seconds = 4) { water.stop(seconds); under.stop(seconds); } };
  },

  nodes: [
    {
      id: 'surface', at: [0.55, 0.35], r: 0.2, layer: 0,
      reveal: {
        kind: 'quote',
        text: '…the illusion of an endless whole, of water without horizon or shore; nerves taut from overwork could have relaxed there…',
        attribution: 'Monet, as reported by Roger Marx — 1909',
      },
    },
    {
      id: 'blooms', at: [0.26, 0.66], r: 0.15, layer: 0,
      reveal: {
        kind: 'sense',
        text: 'The same pond, for the last thirty years of his life — never twice the same light.',
      },
    },
    {
      id: 'refuge', at: [0.8, 0.72], r: 0.15, layer: 0,
      reveal: {
        kind: 'quote',
        text: '…a refuge of peaceful meditation in the center of a flowering aquarium.',
        attribution: 'Monet, as reported by Roger Marx — 1909',
      },
    },
  ],

  layers: [
    { depth: 0.3, draw: drawWater },
    { depth: 0.8, draw: drawFronds },
  ],

  drawWhole,
};

function drawWater(ctx, view, clock, dt, world) {
  const c = hourColors(clock);
  const surfAtt = world.nodes.get('surface').attention;
  const bloomAtt = world.nodes.get('blooms').attention;
  const refugeAtt = world.nodes.get('refuge').attention;
  const conn = world.connection;

  // Water, edge to edge. No horizon — the world's one certainty.
  const grad = ctx.createLinearGradient(0, 0, 0, view.h);
  grad.addColorStop(0, hsla(c.water, 1));
  grad.addColorStop(0.5, hsla(mix(c.water, c.sky, 0.35), 1));
  grad.addColorStop(1, hsla(mix(c.water, [220, 30, 22], 0.5), 1));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, view.w, view.h);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // A drift of borrowed sky lying across the upper water.
  for (let i = 0; i < 8; i++) {
    const u = i / 7;
    dab(ctx, u * view.w, view.h * (0.16 + Math.sin(u * TAU + clock * 0.1) * 0.03),
      view.w * 0.11, view.h * 0.03, 0.03, mix(c.sky, c.bloom, 0.35),
      0.10 + 0.08 * surfAtt);
  }

  // The sky, upside down: vertical streaks trembling on the surface.
  for (const s of REFLECT) {
    const px = s.u * view.w + Math.sin(clock * 0.07 * s.sp + s.ph) * 10;
    const py = s.v * view.h + Math.cos(clock * 0.05 * s.sp + s.ph) * 5;
    dab(ctx, px, py, 4, s.len * view.h * 0.5, 0.02 * Math.sin(s.ph),
      c.sky, 0.12 + 0.14 * surfAtt + 0.06 * conn);
  }

  // Ripples that open and forgive themselves. Skipped in still renders
  // (the whole-composition view runs on a different clock).
  if (!world.still) {
    if (clock > nextRipple) {
      nextRipple = clock + 3 + rnd() * 3;
      ripples.push({ x: rnd() * view.w, y: rnd() * view.h, born: clock });
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      const age = clock - rp.born;
      if (age > 7 || age < 0) { ripples.splice(i, 1); continue; }
      const k = age / 7;
      ctx.strokeStyle = hsla(mix(c.sky, [0, 0, 90], 0.4), (1 - k) * (0.08 + 0.16 * surfAtt));
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(rp.x, rp.y, k * view.w * 0.09, k * view.w * 0.033, 0, 0, TAU);
      ctx.stroke();
    }
  }

  // The lilies: pads adrift, blossoms opening to attention.
  for (const p of PADS) {
    const px = p.x * view.w + Math.sin(clock * 0.06 + p.ph) * 8;
    const py = p.y * view.h + Math.cos(clock * 0.045 + p.ph) * 4;
    const near = Math.hypot(p.x - 0.26, p.y - 0.66) < 0.18 ? bloomAtt
      : Math.hypot(p.x - 0.8, p.y - 0.72) < 0.18 ? refugeAtt : 0;
    dab(ctx, px, py, p.size, p.size * 0.4, 0.15 + Math.sin(p.ph) * 0.1,
      mix([150, 35, 42], c.water, 0.25), 0.65 + 0.2 * near);
    dab(ctx, px - p.size * 0.2, py - 1.5, p.size * 0.55, p.size * 0.2, 0.2,
      mix([150, 40, 55], c.sky, 0.3), 0.4 + 0.2 * near);
    if (p.bloom) {
      const open = 0.6 + 0.4 * Math.sin(clock * 0.1 + p.ph);
      glow(ctx, px, py - 2, p.size * (1.1 + near), c.bloom, (0.3 + 0.35 * near + 0.1 * conn) * open);
      dab(ctx, px, py - 2, p.size * 0.4, p.size * 0.3, 0, mix(c.bloom, [0, 0, 98], 0.45),
        0.7 + 0.3 * near);
      dab(ctx, px, py - 3, p.size * 0.16, p.size * 0.13, 0, [48, 70, 88], 0.6 * open);
    }
  }

  // Under Connection the whole pond breathes as one.
  if (conn > 0.02) {
    glow(ctx, view.w * 0.5, view.h * 0.5, Math.max(view.w, view.h) * 0.5,
      c.sky, 0.05 * conn);
  }
  ctx.restore();
}

function drawFronds(ctx, view, clock, dt, world) {
  const conn = world.connection;
  // Willow fronds leaning in from above — the only "land," and it hangs.
  for (const f of FRONDS) {
    const sway = Math.sin(clock * 0.3 + f.ph) * 8;
    const x = f.x * view.w;
    const segments = 7;
    for (let i = 0; i < segments; i++) {
      const t = i / (segments - 1);
      const px = x + sway * t * t + Math.sin(f.ph) * 4 * t;
      const py = t * f.len * view.h;
      dab(ctx, px, py, f.w, f.w * 3.2, 0.12 * Math.sin(clock * 0.24 + f.ph),
        [130, 30, 22 + 8 * (1 - t)], 0.5 - 0.2 * t + 0.06 * conn);
    }
  }
}

/** The whole panorama, reassembled. */
function drawWhole(ctx, w, h, clock) {
  const view = { w, h };
  const world = {
    connection: 0.6,
    still: true,
    nodes: new Map([
      ['surface', { attention: 0.35 }],
      ['blooms', { attention: 0.3 }],
      ['refuge', { attention: 0.3 }],
    ]),
  };
  drawWater(ctx, view, clock * 0.4, 0, world);
  drawFronds(ctx, view, clock * 0.4, 0, world);
}
