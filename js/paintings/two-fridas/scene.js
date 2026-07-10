/**
 * The Two Fridas — inside the weather between two selves.
 *
 * A stormy sky fills the world. Below it, two presences of light sit side
 * by side — one white as lace, one warm as Tehuana earth — two hearts
 * beating slightly out of time, joined by a single vein. The vein passes
 * a small locket-glow on one side and a cold clamp-glint on the other.
 * Their hands meet at a point of shared warmth that never dims. Four
 * discoveries, any order. Diary passages and fact-lines are cleared in
 * docs/research/two-fridas.md (K1, K2, interpretive lines; ceiling:
 * close on the held hands, never the wound).
 */
import { TAU, mulberry32, hsla, glow, dab } from '../helpers.js';

const rnd = mulberry32(1939);

const CLOUDS = Array.from({ length: 60 }, () => ({
  x: rnd(), y: rnd() * 0.62,
  size: 14 + rnd() * 46,
  sp: 0.3 + rnd() * 0.8,
  ph: rnd() * TAU,
  dark: rnd() < 0.5,
}));

const LEFT = { x: 0.36, y: 0.6 };   // white, torn
const RIGHT = { x: 0.64, y: 0.6 };  // Tehuana, whole
const HANDS = { x: 0.5, y: 0.68 };
const LOCKET = { x: 0.70, y: 0.66 };
const PINCERS = { x: 0.315, y: 0.72 };

const LACE = Array.from({ length: 34 }, () => ({
  a: rnd() * TAU, r: 0.05 + rnd() * 0.085, size: 2 + rnd() * 5, ph: rnd() * TAU,
}));
const TEHUANA = Array.from({ length: 34 }, () => ({
  a: rnd() * TAU, r: 0.05 + rnd() * 0.085, size: 2 + rnd() * 5, ph: rnd() * TAU,
  hue: [[168, 45, 30], [30, 55, 40], [353, 50, 38]][Math.floor(rnd() * 3)],
}));
const DRIPS = Array.from({ length: 7 }, (_, i) => ({
  ph: (i / 7) * TAU, sp: 0.5 + rnd() * 0.5,
}));

export default {
  slug: 'two-fridas',
  title: 'The Two Fridas',
  artist: 'Frida Kahlo',
  year: '1939',
  emotion: 'longing',
  aspect: 1.0,
  connectionThreshold: 3,
  connectionTone: [174.61, 261.63],

  ambient(sound) {
    const wind = sound.noise({ color: 'pink', level: 0.04, fadeIn: 6, filter: { frequency: 200 } });
    const hearts = sound.drone({ frequencies: [98, 98.7], spread: 0 });
    hearts.set(0.02, 6);
    return { stop(seconds = 4) { wind.stop(seconds); hearts.stop(seconds); } };
  },

  nodes: [
    {
      id: 'vein', at: [0.5, 0.52], r: 0.13, layer: 1,
      reveal: {
        kind: 'quote',
        text: 'I must have been 6 years old when I experienced intensely an imaginary friendship with a little girl more or less the same age as me.',
        attribution: 'her diary — “origin of The Two Fridas”',
      },
    },
    {
      id: 'hands', at: [0.5, 0.7], r: 0.11, layer: 1,
      reveal: {
        kind: 'quote',
        text: 'I do not remember her image or her color. But I do know that she laughed a lot without sounds. She was agile and she danced as if she weighed nothing at all.',
        attribution: 'her diary — the friend',
      },
    },
    {
      id: 'torn', at: [0.33, 0.5], r: 0.12, layer: 1,
      reveal: {
        kind: 'sense',
        text: 'Painted in the year of their divorce; one heart open to the storm.',
      },
    },
    {
      id: 'locket', at: [0.7, 0.66], r: 0.1, layer: 1,
      reveal: {
        kind: 'sense',
        text: 'In her hand, a tiny portrait: Diego, as a child.',
      },
    },
  ],

  layers: [
    { depth: 0.25, draw: drawStorm },
    { depth: 0.6, draw: drawFridas },
  ],

  drawWhole,
};

function drawStorm(ctx, view, clock, dt, world) {
  const conn = world.connection;

  // A churned sky — teal-gray, never resting, calming under Connection.
  const grad = ctx.createLinearGradient(0, 0, 0, view.h);
  grad.addColorStop(0, hsla([200, 22, 14], 1));
  grad.addColorStop(0.6, hsla([196, 20, 19], 1));
  grad.addColorStop(1, hsla([210, 18, 12], 1));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, view.w, view.h);

  const churn = 1 - conn * 0.6;
  for (const c of CLOUDS) {
    const px = (c.x + Math.sin(clock * 0.04 * c.sp + c.ph) * 0.05 * churn) * view.w;
    const py = (c.y + Math.cos(clock * 0.03 * c.sp + c.ph) * 0.03 * churn) * view.h;
    dab(ctx, px, py, c.size * 1.7, c.size * 0.6, Math.sin(c.ph + clock * 0.05) * 0.3,
      c.dark ? [205, 18, 24] : [190, 15, 42], 0.10 + 0.05 * Math.sin(clock * 0.2 + c.ph));
  }
}

function drawFridas(ctx, view, clock, dt, world) {
  const m = Math.min(view.w, view.h);
  const conn = world.connection;
  const veinAtt = world.nodes.get('vein').attention;
  const handsAtt = world.nodes.get('hands').attention;
  const tornAtt = world.nodes.get('torn').attention;
  const lockAtt = world.nodes.get('locket').attention;

  const lx = LEFT.x * view.w, ly = LEFT.y * view.h;
  const rx = RIGHT.x * view.w, ry = RIGHT.y * view.h;
  const hx = HANDS.x * view.w, hy = HANDS.y * view.h;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // The white presence — lace weather, cool bone light.
  glow(ctx, lx, ly, m * 0.24, [40, 18, 82], 0.22 + 0.12 * tornAtt + 0.07 * conn);
  for (const p of LACE) {
    const px = lx + Math.cos(p.a + clock * 0.06) * p.r * m;
    const py = ly + Math.sin(p.a + clock * 0.06) * p.r * m * 0.8;
    dab(ctx, px, py, p.size * 1.6, p.size * 0.7, p.a, [45, 22, 90],
      (0.2 + 0.2 * tornAtt) * (0.6 + 0.4 * Math.sin(clock * 0.7 + p.ph)));
  }

  // The Tehuana presence — earth, teal, carmine.
  glow(ctx, rx, ry, m * 0.24, [28, 45, 45], 0.22 + 0.12 * lockAtt + 0.07 * conn);
  for (const p of TEHUANA) {
    const px = rx + Math.cos(p.a - clock * 0.05) * p.r * m;
    const py = ry + Math.sin(p.a - clock * 0.05) * p.r * m * 0.8;
    dab(ctx, px, py, p.size * 1.6, p.size * 0.7, p.a, p.hue,
      (0.24 + 0.2 * lockAtt) * (0.6 + 0.4 * Math.sin(clock * 0.6 + p.ph)));
  }

  // Two hearts, out of time. The left one torn — it flickers, and grieves
  // in slow drips that dissolve before they land.
  const beatL = Math.pow(Math.max(0, Math.sin(clock * 1.35)), 3);
  const beatR = Math.pow(Math.max(0, Math.sin(clock * 1.35 + 0.9)), 3);
  const tear = 0.75 + 0.25 * Math.sin(clock * 7.1) * Math.sin(clock * 2.3);
  glow(ctx, lx, ly - m * 0.05, m * 0.06 + beatL * 12, [355, 60, 60],
    (0.5 + 0.3 * tornAtt) * tear);
  dab(ctx, lx, ly - m * 0.05, m * 0.012, m * 0.014, 0.2, [355, 65, 55], 0.75 * tear);
  glow(ctx, rx, ry - m * 0.05, m * 0.06 + beatR * 12, [355, 70, 52], 0.55 + 0.3 * lockAtt);
  dab(ctx, rx, ry - m * 0.05, m * 0.012, m * 0.014, -0.2, [355, 72, 50], 0.85);

  for (const d of DRIPS) {
    const fall = ((clock * 0.04 * d.sp + d.ph / TAU) % 1);
    dab(ctx, lx + Math.sin(d.ph) * 8, ly - m * 0.05 + fall * m * 0.16,
      1.6, 3, 0, [355, 65, 48], (1 - fall) * (0.25 + 0.2 * tornAtt) * tear);
  }

  // The vein: one line of life between them, over the joined hands.
  const veinAlpha = 0.3 + 0.3 * veinAtt + 0.25 * conn;
  ctx.strokeStyle = hsla([357, 60, 55], veinAlpha);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(lx, ly - m * 0.05);
  ctx.bezierCurveTo(lx + m * 0.06, ly - m * 0.13, rx - m * 0.06, ry - m * 0.13, rx, ry - m * 0.05);
  ctx.stroke();
  ctx.strokeStyle = hsla([357, 55, 50], veinAlpha * 0.8);
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(rx, ry - m * 0.05);
  ctx.quadraticCurveTo((rx + LOCKET.x * view.w) / 2, ry + m * 0.02,
    LOCKET.x * view.w, LOCKET.y * view.h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(lx, ly - m * 0.05);
  ctx.quadraticCurveTo((lx + PINCERS.x * view.w) / 2, ly + m * 0.03,
    PINCERS.x * view.w, PINCERS.y * view.h);
  ctx.stroke();

  // The locket: a warm miniature. The pincers: one cold glint, no more.
  glow(ctx, LOCKET.x * view.w, LOCKET.y * view.h, 10 + 14 * lockAtt, [40, 70, 60],
    0.3 + 0.4 * lockAtt);
  dab(ctx, PINCERS.x * view.w, PINCERS.y * view.h, 4, 1.4, 0.6, [210, 15, 75],
    0.22 + 0.2 * tornAtt);

  // Where the hands meet: the one warmth that never dims, and under
  // Connection, the answer.
  glow(ctx, hx, hy, m * (0.035 + 0.05 * handsAtt + 0.05 * conn), [35, 75, 62],
    0.4 + 0.3 * handsAtt + 0.25 * conn);
  dab(ctx, hx, hy, 2.4, 2.4, 0, [40, 60, 92], 0.7 + 0.3 * conn);

  ctx.restore();
}

/** The whole canvas: two figures of light, hands joined, storm behind. */
function drawWhole(ctx, w, h, clock) {
  const view = { w, h };
  const world = {
    connection: 0.8,
    nodes: new Map([
      ['vein', { attention: 0.3 }],
      ['hands', { attention: 0.45 }],
      ['torn', { attention: 0.25 }],
      ['locket', { attention: 0.3 }],
    ]),
  };
  drawStorm(ctx, view, clock * 0.4, 0, world);

  // Seated silhouettes beneath the lights — the bench of the double
  // portrait, abstracted to two dresses of weather.
  const m = Math.min(w, h);
  ctx.fillStyle = hsla([210, 15, 16], 0.9);
  ctx.fillRect(w * 0.18, h * 0.76, w * 0.64, 3);
  for (const [cx, hue, sat, li] of [[0.36, 45, 15, 78], [0.64, 28, 45, 42]]) {
    ctx.fillStyle = hsla([hue, sat, li], 0.16);
    ctx.beginPath();
    ctx.moveTo(w * cx, h * 0.42);
    ctx.quadraticCurveTo(w * (cx - 0.13), h * 0.62, w * (cx - 0.11), h * 0.78);
    ctx.lineTo(w * (cx + 0.11), h * 0.78);
    ctx.quadraticCurveTo(w * (cx + 0.13), h * 0.62, w * cx, h * 0.42);
    ctx.fill();
  }
  drawFridas(ctx, view, clock * 0.4, 0, world);
}
