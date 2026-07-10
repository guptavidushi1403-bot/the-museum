/**
 * Girl with a Pearl Earring — inside the dark that holds one glance.
 *
 * The quietest world in the museum. Near-blackness that was once green;
 * a turning of light where a face would be — warmth, ultramarine, lemon,
 * never features; and below, the pearl: two strokes of white. Nothing
 * here speaks in words that were never written: all four reveals are
 * environmental sense-lines cleared in docs/research/pearl-earring.md
 * (F1–F5). The absence of any voice IS this room's story.
 */
import { TAU, mulberry32, hsla, glow, dab } from '../helpers.js';

const rnd = mulberry32(1665);

const TURBAN_BLUE = Array.from({ length: 20 }, (_, i) => ({
  t: i / 19, ph: rnd() * TAU, w: 0.5 + rnd() * 0.6,
}));
const TURBAN_LEMON = Array.from({ length: 12 }, (_, i) => ({
  t: i / 11, ph: rnd() * TAU, w: 0.5 + rnd() * 0.5,
}));
const MOTES = Array.from({ length: 26 }, () => ({
  x: rnd(), y: rnd(), sp: 0.2 + rnd() * 0.6, ph: rnd() * TAU, size: 0.5 + rnd(),
}));

const FACE = { x: 0.5, y: 0.42 };
const PEARL = { x: 0.545, y: 0.585 };

export default {
  slug: 'pearl-earring',
  title: 'Girl with a Pearl Earring',
  artist: 'Johannes Vermeer',
  year: 'c. 1665',
  emotion: 'intimacy',
  aspect: 0.843,
  connectionThreshold: 3,
  connectionTone: [261.63, 329.63],

  ambient(sound) {
    // Almost nothing: a room's held breath.
    const roomTone = sound.noise({ color: 'brown', level: 0.018, fadeIn: 8, filter: { frequency: 110 } });
    return { stop(seconds = 4) { roomTone.stop(seconds); } };
  },

  nodes: [
    {
      id: 'pearl', at: [0.545, 0.585], r: 0.1, layer: 1,
      reveal: {
        kind: 'sense',
        text: 'Perhaps not a pearl at all — glass, varnished to shine.',
      },
    },
    {
      id: 'gaze', at: [0.5, 0.4], r: 0.13, layer: 1,
      reveal: {
        kind: 'sense',
        text: 'No one knows who she was. This was never anyone’s portrait.',
      },
    },
    {
      id: 'darkness', at: [0.24, 0.24], r: 0.17, layer: 0,
      reveal: {
        kind: 'sense',
        text: 'The black was once deep green — a glaze that faded as the centuries passed.',
      },
    },
    {
      id: 'blue', at: [0.42, 0.28], r: 0.11, layer: 1,
      reveal: {
        kind: 'sense',
        text: 'Ultramarine: lapis lazuli ground to powder, dearer than gold.',
      },
    },
  ],

  layers: [
    { depth: 0.2, draw: drawDark },
    { depth: 0.55, draw: drawHer },
  ],

  drawWhole,
};

function drawDark(ctx, view, clock, dt, world) {
  const darkAtt = world.nodes.get('darkness').attention;
  const conn = world.connection;

  // The ground: black that remembers being green.
  const g = ctx.createRadialGradient(
    view.w * 0.5, view.h * 0.45, 0,
    view.w * 0.5, view.h * 0.45, Math.max(view.w, view.h) * 0.75);
  const greenMemory = 0.06 + darkAtt * 0.10 + conn * 0.04;
  g.addColorStop(0, `hsl(160, ${Math.round(22 * greenMemory * 8)}%, ${5 + greenMemory * 14}%)`);
  g.addColorStop(1, 'hsl(210, 20%, 2%)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, view.w, view.h);

  // Dust in candlelight — the room's only weather.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const m of MOTES) {
    const px = (m.x + Math.sin(clock * 0.05 * m.sp + m.ph) * 0.02) * view.w;
    const py = (m.y + Math.cos(clock * 0.04 * m.sp + m.ph) * 0.02) * view.h;
    dab(ctx, px, py, m.size, m.size, 0, [42, 30, 80],
      0.05 + 0.05 * Math.sin(clock * 0.6 + m.ph));
  }
  ctx.restore();
}

function drawHer(ctx, view, clock, dt, world) {
  const m = Math.min(view.w, view.h);
  const conn = world.connection;
  const gazeAtt = world.nodes.get('gaze').attention;
  const blueAtt = world.nodes.get('blue').attention;
  const pearlAtt = world.nodes.get('pearl').attention;

  const fx = FACE.x * view.w, fy = FACE.y * view.h;
  const flicker = 0.88 + 0.12 * Math.sin(clock * 8.7) * Math.sin(clock * 3.1);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // The light where she turns — warmth without features, growing
  // toward whoever looks longer.
  glow(ctx, fx, fy, m * (0.13 + 0.05 * gazeAtt + 0.03 * conn), [36, 45, 55],
    (0.18 + 0.22 * gazeAtt + 0.08 * conn) * flicker);
  glow(ctx, fx - m * 0.02, fy + m * 0.015, m * 0.06, [30, 50, 65],
    (0.12 + 0.18 * gazeAtt) * flicker);

  // The turban: ultramarine wound above, lemon falling behind.
  for (const t of TURBAN_BLUE) {
    const a = Math.PI * (1.15 + t.t * 0.75);
    const r = m * (0.085 + 0.012 * Math.sin(clock * 0.3 + t.ph));
    const px = fx + Math.cos(a) * r;
    const py = fy - m * 0.075 + Math.sin(a) * r * 0.7;
    dab(ctx, px, py, m * 0.016 * t.w, m * 0.007, a + Math.PI / 2,
      [215, 55, 38 + blueAtt * 16], 0.30 + 0.32 * blueAtt + 0.06 * conn);
  }
  for (const t of TURBAN_LEMON) {
    const px = fx + m * (0.055 + t.t * 0.025) + Math.sin(clock * 0.4 + t.ph) * 2;
    const py = fy - m * 0.02 + t.t * m * 0.14;
    dab(ctx, px, py, m * 0.012 * t.w, m * 0.02, 0.25,
      [48, 55, 55 + blueAtt * 10], 0.24 + 0.22 * blueAtt);
  }

  // The collar: one soft fall of white.
  dab(ctx, fx - m * 0.01, fy + m * 0.115, m * 0.05, m * 0.022, -0.2,
    [45, 20, 88], 0.16 + 0.1 * gazeAtt);

  // The pearl. Two strokes of white — that is all it ever was.
  const px = PEARL.x * view.w, py = PEARL.y * view.h;
  glow(ctx, px, py, m * (0.02 + 0.035 * pearlAtt), [210, 30, 80],
    0.25 + 0.5 * pearlAtt);
  dab(ctx, px, py + 1, m * 0.006, m * 0.008, 0.1, [210, 15, 55], 0.5 + 0.3 * pearlAtt);
  dab(ctx, px - 1, py - 2, m * 0.0035, m * 0.002, -0.4, [45, 25, 97], 0.8);
  dab(ctx, px + 1, py + 3, m * 0.004, m * 0.0015, 0.2, [210, 20, 88], 0.5 + 0.3 * pearlAtt);

  ctx.restore();
}

/** The whole: the dark, the turned light, the pearl — as one. */
function drawWhole(ctx, w, h, clock) {
  const view = { w, h };
  const world = {
    connection: 0.7,
    nodes: new Map([
      ['pearl', { attention: 0.5 }],
      ['gaze', { attention: 0.4 }],
      ['darkness', { attention: 0.25 }],
      ['blue', { attention: 0.35 }],
    ]),
  };
  drawDark(ctx, view, clock * 0.4, 0, world);
  drawHer(ctx, view, clock * 0.4, 0, world);
}
