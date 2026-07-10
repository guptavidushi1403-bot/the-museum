/**
 * Under the Wave off Kanagawa — inside the second before it falls.
 *
 * The sea gathers into the great claw again and again — a cycle, not a
 * catastrophe. Three boats ride the swells; Fuji sits small and utterly
 * still at the center of everything moving. Four discoveries, all
 * environmental (no words of Hokusai are used, per the founding brief);
 * sense-lines are cleared in docs/research/great-wave.md (F2–F5).
 * Ceiling: the wave never falls; Fuji outlasts it; close on stillness.
 */
import { TAU, mulberry32, hsla, glow, dab } from '../helpers.js';

const rnd = mulberry32(1831);
const PERIOD = 26;

const COLUMNS = Array.from({ length: 60 }, (_, i) => ({
  u: Math.min(0.99, Math.max(0.01, (i + (rnd() - 0.5) * 0.7) / 59)),
  sway: rnd() * TAU,
  ks: [rnd() * 0.2, 0.18 + rnd() * 0.3, 0.44 + rnd() * 0.3, 0.7 + rnd() * 0.3],
  sizes: [0.8 + rnd() * 0.6, 0.8 + rnd() * 0.6, 0.8 + rnd() * 0.6, 0.8 + rnd() * 0.6],
}));
const SWELLS = Array.from({ length: 40 }, (_, i) => ({
  u: (i + rnd()) / 40, size: 3 + rnd() * 4, ph: rnd() * TAU,
}));
const CLAWS = Array.from({ length: 14 }, (_, i) => ({
  t: i / 13, ph: rnd() * TAU, len: 0.5 + rnd() * 0.5,
}));
const BOATS = [
  { u: 0.30, ph: 0 },
  { u: 0.52, ph: 2.1 },
  { u: 0.72, ph: 4.2 },
];
const FUJI = { x: 0.56, y: 0.565 };
const spray = [];
let lastPhase = 0;

function waveState(clock) {
  // Arrival lands mid-swell: the wave is already gathering.
  const phase = ((clock + PERIOD * 0.42) % PERIOD) / PERIOD;
  const BREAK = 0.6;
  let h;
  if (phase < BREAK) {
    const g = phase / BREAK;
    h = 0.25 + 0.95 * g * g * (3 - 2 * g);
  } else {
    h = 0.25 + 0.95 * (1 - (phase - BREAK) / (1 - BREAK));
  }
  return { phase, h, BREAK };
}

export default {
  slug: 'great-wave',
  title: 'Under the Wave off Kanagawa',
  artist: 'Katsushika Hokusai',
  year: 'c. 1830–32',
  emotion: 'awe',
  aspect: 1.475,
  connectionThreshold: 3,
  connectionTone: [110.0, 164.81, 220.0],

  ambient(sound) {
    const sea = sound.noise({ color: 'brown', level: 0.08, fadeIn: 5, filter: { frequency: 240 } });
    const wind = sound.noise({ color: 'pink', level: 0.025, fadeIn: 7, filter: { frequency: 900, type: 'bandpass', Q: 0.7 } });
    let swellTimer = setInterval(() => {
      sea.set(0.05 + Math.random() * 0.06, 3.5);
    }, 7000);
    return {
      stop(seconds = 4) {
        clearInterval(swellTimer);
        sea.stop(seconds);
        wind.stop(seconds);
      },
    };
  },

  nodes: [
    {
      id: 'fuji', at: [0.56, 0.55], r: 0.1, layer: 0,
      reveal: {
        kind: 'sense',
        text: 'The mountain does not move. Everything else is one breath from change.',
      },
    },
    {
      id: 'boats', at: [0.52, 0.68], r: 0.13, layer: 1,
      reveal: {
        kind: 'sense',
        text: 'Fast boats ferrying the morning’s catch, rowers bent to the sea.',
      },
    },
    {
      id: 'claw', at: [0.22, 0.3], r: 0.16, layer: 1,
      reveal: {
        kind: 'sense',
        text: 'Blue from Prussia, new to Japan that decade.',
      },
    },
    {
      id: 'print', at: [0.85, 0.82], r: 0.12, layer: 1,
      reveal: {
        kind: 'sense',
        text: 'Not one painting: thousands of impressions, made to be owned by anyone.',
      },
    },
  ],

  layers: [
    { depth: 0.2, draw: drawSkyFuji },
    { depth: 0.55, draw: drawSea },
  ],

  drawWhole,
};

function drawSkyFuji(ctx, view, clock, dt, world) {
  const fujiAtt = world.nodes.get('fuji').attention;
  const conn = world.connection;

  // A cream dawn sky, papery — the print's own air.
  const grad = ctx.createLinearGradient(0, 0, 0, view.h);
  grad.addColorStop(0, hsla([42, 22, 82], 1));
  grad.addColorStop(0.45, hsla([38, 25, 74], 1));
  grad.addColorStop(0.62, hsla([215, 25, 52], 1));
  grad.addColorStop(1, hsla([216, 40, 34], 1));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, view.w, view.h);

  // Fuji: small, snow-capped, the still point of the world.
  const fx = FUJI.x * view.w, fy = FUJI.y * view.h;
  const fw = view.w * 0.085, fh = view.h * 0.075;
  ctx.fillStyle = hsla([218, 35, 30], 1);
  ctx.beginPath();
  ctx.moveTo(fx, fy - fh);
  ctx.lineTo(fx + fw, fy);
  ctx.lineTo(fx - fw, fy);
  ctx.fill();
  ctx.fillStyle = hsla([40, 20, 88], 0.95);
  ctx.beginPath();
  ctx.moveTo(fx, fy - fh);
  ctx.lineTo(fx + fw * 0.34, fy - fh * 0.55);
  ctx.lineTo(fx + fw * 0.18, fy - fh * 0.42);
  ctx.lineTo(fx, fy - fh * 0.52);
  ctx.lineTo(fx - fw * 0.15, fy - fh * 0.38);
  ctx.lineTo(fx - fw * 0.34, fy - fh * 0.55);
  ctx.fill();

  // Brushed, not cut out: dabs soften the mountain's edges.
  for (let i = 0; i < 16; i++) {
    const u = i / 15;
    const ex = fx - fw + u * fw * 2;
    const ey = fy - fh * (1 - Math.abs(u * 2 - 1)) * 0.96;
    dab(ctx, ex, ey + 3, 9 + (i % 3) * 4, 3.5, (u - 0.5) * 0.9,
      [218, 32, 34], 0.5);
  }

  if (fujiAtt > 0.03 || conn > 0.1) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, fx, fy - fh * 0.4, fw * (1.3 + fujiAtt), [42, 60, 70],
      0.10 * fujiAtt + 0.10 * conn);
    ctx.restore();
  }
}

function drawSea(ctx, view, clock, dt, world) {
  const { phase, h, BREAK } = waveState(clock);
  const clawAtt = world.nodes.get('claw').attention;
  const boatAtt = world.nodes.get('boats').attention;
  const printAtt = world.nodes.get('print').attention;
  const conn = world.connection;
  const baseY = view.h * 0.68;
  const R = Math.min(view.w, view.h) * 0.52;

  // The break: once each cycle, the crest becomes spray. Skipped in
  // still renders (the whole-composition view runs on a different clock).
  if (!world.still && lastPhase < BREAK && phase >= BREAK) {
    for (let i = 0; i < 90; i++) {
      const u = 0.05 + rnd() * 0.4;
      const profile = Math.pow(Math.sin(Math.min(u / 0.55, 1) * Math.PI * 0.5), 1.3);
      spray.push({
        x: u * view.w * 0.6,
        y: baseY - h * R * profile,
        vx: 30 + rnd() * 90,
        vy: -(20 + rnd() * 70),
        life: 2.8 + rnd() * 1.4,
        age: 0,
        size: 0.8 + rnd() * 2,
      });
    }
  }
  if (!world.still) lastPhase = phase;

  // Far swells.
  for (const s of SWELLS) {
    const sy = baseY - view.h * 0.055 + Math.sin(s.u * TAU * 1.4 + clock * 0.35 + s.ph) * view.h * 0.016;
    dab(ctx, s.u * view.w, sy, s.size * 2.4, s.size * 0.8, Math.sin(s.ph) * 0.3,
      [217, 45, 30], 0.5);
  }

  // The great wave: a mass of Prussian blue rising on the left,
  // reaching over the sea with foam claws.
  const crestX = view.w * (0.16 + 0.10 * h);
  for (const col of COLUMNS) {
    const u = col.u;
    const lean = Math.pow(1 - u, 1.6);
    const profile = Math.pow(Math.sin(Math.min(u / 0.58, 1) * Math.PI * 0.52), 1.25) * (u < 0.58 ? 1 : Math.max(0, 1 - (u - 0.58) * 2.6));
    const wx = u * view.w + Math.sin(clock * 0.5 + col.sway) * 2;
    const crestY = baseY - h * R * profile * (1 + lean * 0.25);
    for (let r = 0; r < col.ks.length; r++) {
      const k = col.ks[r];
      const wy = crestY + (baseY + view.h * 0.14 - crestY) * k;
      const depth = profile * h * (1 - k * 0.7);
      const size = (3.4 + depth * 7) * col.sizes[r];
      const foam = r === 0 && profile > 0.6 && h > 0.75;
      const color = foam ? [204, 14, 90] : [216, 62, 18 + depth * 26 + clawAtt * 8];
      dab(ctx, wx, wy, size * 1.9, size * 0.75, (u - 0.4) * 0.8,
        color, (0.6 + 0.3 * depth) * (0.8 + 0.2 * conn));
    }
  }

  // The claws of foam, curling from the crest when the wave is tall.
  if (h > 0.7) {
    const reach = (h - 0.7) / 0.55;
    for (const c of CLAWS) {
      const a = -0.25 + c.t * 1.15;
      const cr = R * 0.36 * c.len * reach;
      const px = crestX + view.w * 0.09 + Math.cos(a) * cr * 1.4;
      const py = baseY - h * R * 1.02 + Math.sin(a) * cr * 0.9;
      dab(ctx, px, py, 3.2 + c.t * 2, 1.6, a + 0.7, [204, 12, 92],
        (0.45 + 0.25 * clawAtt) * reach * (0.7 + 0.3 * Math.sin(clock * 2 + c.ph)));
    }
  }

  // Spray — what the wave becomes, briefly.
  for (let i = world.still ? -1 : spray.length - 1; i >= 0; i--) {
    const s = spray[i];
    s.age += dt;
    if (s.age > s.life) { spray.splice(i, 1); continue; }
    s.vy += 30 * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    const k = 1 - s.age / s.life;
    dab(ctx, s.x, s.y, s.size, s.size, 0, [206, 15, 93], k * 0.5);
  }

  // Three boats riding the swells, rowers as beads of dark pigment.
  for (const b of BOATS) {
    const bob = Math.sin(clock * 0.5 + b.ph) * view.h * 0.012;
    const tilt = Math.cos(clock * 0.5 + b.ph) * 0.12;
    const bx = b.u * view.w;
    const by = baseY + view.h * 0.045 + bob;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(tilt);
    dab(ctx, 0, 0, view.w * 0.052, view.h * 0.008, 0.05, [38, 38, 42 + boatAtt * 14], 0.9);
    for (let i = 0; i < 8; i++) {
      dab(ctx, -view.w * 0.036 + i * view.w * 0.0095, -view.h * 0.008,
        2, 2.8, 0.1, [30, 30, 20], 0.8);
    }
    ctx.restore();
    if (boatAtt > 0.1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, bx, by, view.w * 0.045, [40, 50, 55], 0.12 * boatAtt);
      ctx.restore();
    }
  }

  // The print's edge: under attention, the sea confides that it is paper —
  // a woodgrain breath and the cartouche's ghost.
  if (printAtt > 0.05) {
    ctx.save();
    ctx.globalAlpha = printAtt * 0.5;
    ctx.strokeStyle = hsla([40, 25, 70], 0.5);
    ctx.lineWidth = 1;
    ctx.strokeRect(view.w * 0.795, view.h * 0.755, view.w * 0.11, view.h * 0.13);
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(view.w * 0.81, view.h * (0.775 + i * 0.022));
      ctx.lineTo(view.w * 0.895, view.h * (0.775 + i * 0.022));
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** The whole print: claw left, boats low, Fuji small and still. */
function drawWhole(ctx, w, h, clock) {
  const view = { w, h };
  const world = {
    connection: 0.7,
    still: true,
    nodes: new Map([
      ['fuji', { attention: 0.4 }],
      ['boats', { attention: 0.3 }],
      ['claw', { attention: 0.3 }],
      ['print', { attention: 0 }],
    ]),
  };
  drawSkyFuji(ctx, view, clock * 0.3, 0, world);
  drawSea(ctx, view, clock * 0.3, 0, world);
}
