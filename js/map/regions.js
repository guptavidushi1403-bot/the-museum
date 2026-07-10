/**
 * The five regions of the emotion map — each a weather of paint, not a
 * button. A region is recognized by its motion signature and light alone:
 * Wonder turns, Serenity ripples, Longing reaches, Intimacy burns low,
 * Awe rises and dissolves. Names surface only while a region beckons.
 *
 * Renderers are procedural and painterly — dabs, glows, threads of pigment
 * on canvas — never geometry, never photographic.
 *
 * Each region: { id, name, x, y, r, hue, tone, air(sound), draw(...) }
 * with live fields the map drives every frame:
 *   intensity  eased attention, 0.2ish at rest, >1 while being entered
 *   alpha      state fade (other regions dim during an entry)
 *   trace      0..1, how warmly this room remembers past visits
 */

const TAU = Math.PI * 2;

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hsla([h, s, l], a) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

function glow(ctx, x, y, r, color, alpha) {
  if (alpha <= 0.004 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hsla(color, alpha));
  g.addColorStop(1, hsla(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function dab(ctx, x, y, rx, ry, rot, color, alpha) {
  if (alpha <= 0.004) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = hsla(color, alpha);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Wonder — a slow turning of stars. Night blues, sparks of gold.      */
/* ------------------------------------------------------------------ */
function makeWonder() {
  const rnd = mulberry32(11);
  const stars = [];
  for (let i = 0; i < 120; i++) {
    const t = Math.pow(rnd(), 0.62); // denser toward the heart
    stars.push({
      orbit: 0.16 + t,
      angle: rnd() * TAU,
      speed: (0.035 + (1 - t) * 0.055) * (0.7 + rnd() * 0.6),
      size: 0.7 + rnd() * 2.2,
      warm: rnd() < 0.13,
      tw: rnd() * TAU,
    });
  }
  const bright = Array.from({ length: 5 }, () => ({
    orbit: 0.25 + rnd() * 0.75,
    angle: rnd() * TAU,
    speed: 0.02 + rnd() * 0.025,
    halo: 16 + rnd() * 14,
    tw: rnd() * TAU,
    warm: rnd() < 0.4,
  }));

  return {
    id: 'wonder',
    name: 'wonder',
    x: 0.30, y: 0.32, r: 0.16,
    hue: [222, 60, 62],
    tone: [261.63, 392.0],
    air: (sound) => {
      const d = sound.drone({ frequencies: [1046.5, 1318.5], spread: 6 });
      return {
        set: (level, clock) => d.set(level * 0.028 * (0.7 + 0.3 * Math.sin(clock * 0.8)), 0.35),
        stop: d.stop,
      };
    },
    draw(ctx, view, clock, dt) {
      const R = this.r * Math.min(view.w, view.h);
      const cx = this.x * view.w + Math.sin(clock * 0.05) * 6;
      const cy = this.y * view.h + Math.cos(clock * 0.043) * 5;
      const I = this.intensity;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.globalCompositeOperation = 'lighter';

      glow(ctx, cx, cy, R * 1.5, [228, 48, 40], 0.10 + 0.16 * I);

      for (const s of stars) {
        s.angle += s.speed * dt * (0.8 + 0.5 * I);
        const o = s.orbit * R;
        const px = cx + Math.cos(s.angle) * o;
        const py = cy + Math.sin(s.angle) * o * 0.74;
        const twinkle = 0.7 + 0.3 * Math.sin(clock * 1.7 + s.tw);
        const a = (0.14 + 0.5 * I) * twinkle;
        dab(ctx, px, py, s.size, s.size * 0.62, s.angle + Math.PI / 2,
          s.warm ? [46, 85, 72] : [222, 55, 78], a);
      }

      for (const b of bright) {
        b.angle += b.speed * dt;
        const px = cx + Math.cos(b.angle) * b.orbit * R;
        const py = cy + Math.sin(b.angle) * b.orbit * R * 0.74;
        const breathe = 0.65 + 0.35 * Math.sin(clock * 0.5 + b.tw);
        glow(ctx, px, py, b.halo * (1 + I * 0.8),
          b.warm ? [46, 90, 70] : [220, 70, 80], (0.10 + 0.30 * I) * breathe);
        dab(ctx, px, py, 1.6, 1.6, 0, [50, 30, 96], 0.4 + 0.5 * I);
      }

      if (this.trace > 0) glow(ctx, cx, cy, 15, [40, 90, 65], 0.20 * this.trace);
      ctx.restore();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Serenity — still water. Ripples that open and forgive themselves.   */
/* ------------------------------------------------------------------ */
function makeSerenity() {
  const rnd = mulberry32(22);
  const bands = [[175, 32, 56], [200, 35, 62], [265, 25, 68], [340, 40, 76], [150, 25, 54]];
  // The water is strokes, not a surface: wide soft dabs that thin toward
  // the edges, so the pond has no outline — it fades into the dark.
  const strokes = Array.from({ length: 54 }, () => {
    const u = rnd() * 2 - 1;
    const v = (rnd() * 2 - 1) * Math.sqrt(1 - u * u * 0.7);
    return {
      u, v,
      len: 0.10 + rnd() * 0.16,
      ry: 1.2 + rnd() * 2.2,
      hue: bands[Math.floor(rnd() * bands.length)],
      ph: rnd() * TAU,
      sp: 0.5 + rnd(),
    };
  });
  const pads = Array.from({ length: 15 }, () => ({
    u: rnd() * 2 - 1,
    v: rnd() * 2 - 1,
    drift: 0.4 + rnd() * 1.1,
    size: 3 + rnd() * 6,
    hue: [[150, 30, 55], [340, 45, 80], [40, 35, 88]][Math.floor(rnd() * 3)],
    ph: rnd() * TAU,
  }));
  const ripples = [];
  let nextRipple = 0;

  return {
    id: 'serenity',
    name: 'serenity',
    x: 0.56, y: 0.72, r: 0.15,
    hue: [175, 45, 55],
    tone: [220.0, 329.63],
    air: (sound) => {
      let bed = null;
      return {
        set: (level, clock) => {
          if (!bed && level > 0.001) {
            bed = sound.noise({ color: 'pink', level: 0, fadeIn: 0.1, filter: { frequency: 420 } });
          }
          if (bed) bed.set(level * 0.07 * (0.85 + 0.15 * Math.sin(clock * 0.5)), 0.35);
        },
        stop: (s) => bed && bed.stop(s),
      };
    },
    draw(ctx, view, clock, dt) {
      const R = this.r * Math.min(view.w, view.h);
      const cx = this.x * view.w + Math.sin(clock * 0.037) * 5;
      const cy = this.y * view.h + Math.cos(clock * 0.031) * 3;
      const I = this.intensity;
      const W = R * 2.6, H = R * 1.0;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.globalCompositeOperation = 'lighter';

      glow(ctx, cx, cy, R * 1.35, [170, 30, 45], 0.06 + 0.13 * I);

      // The water sheet: drifting horizontal strokes, dimmer at the edge.
      for (const s of strokes) {
        const px = cx + s.u * W * 0.46 + Math.sin(clock * 0.06 * s.sp + s.ph) * 6;
        const py = cy + s.v * H * 0.42 + Math.sin(clock * 0.09 * s.sp + s.ph * 1.3) * 2.5;
        const edge = Math.max(0, 1 - (s.u * s.u + s.v * s.v));
        dab(ctx, px, py, s.len * W * 0.5, s.ry, 0.02 * Math.sin(s.ph),
          s.hue, (0.05 + 0.17 * I) * edge);
      }

      // Ripples: rings that open slowly and fade without a mark.
      if (clock > nextRipple) {
        nextRipple = clock + 2.8 + rnd() * 2.6;
        ripples.push({ x: cx + (rnd() * 1.3 - 0.65) * W * 0.5, y: cy + (rnd() - 0.5) * H * 0.7, born: clock });
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        const age = clock - rp.born;
        if (age > 6.5) { ripples.splice(i, 1); continue; }
        const k = age / 6.5;
        ctx.strokeStyle = hsla([190, 40, 80], (1 - k) * (0.08 + 0.22 * I));
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, k * W * 0.3, k * W * 0.11, 0, 0, TAU);
        ctx.stroke();
      }

      // Lily hints adrift.
      for (const p of pads) {
        const px = cx + p.u * W * 0.42 + Math.sin(clock * 0.05 * p.drift + p.ph) * 9;
        const py = cy + p.v * H * 0.38 + Math.cos(clock * 0.04 * p.drift + p.ph) * 4;
        dab(ctx, px, py, p.size, p.size * 0.42, 0.15, p.hue, 0.10 + 0.22 * I);
      }

      if (this.trace > 0) glow(ctx, cx, cy - H * 0.1, 13, [40, 80, 70], 0.18 * this.trace);
      ctx.restore();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Longing — two lights that reach and never touch, joined by a vein.  */
/* ------------------------------------------------------------------ */
function makeLonging() {
  return {
    id: 'longing',
    name: 'longing',
    x: 0.20, y: 0.66, r: 0.13,
    hue: [353, 55, 48],
    tone: [196.0, 293.66],
    air: (sound) => {
      const d = sound.drone({ frequencies: [196, 197.4], spread: 0 });
      return {
        set: (level) => d.set(level * 0.04, 0.4),
        stop: d.stop,
      };
    },
    draw(ctx, view, clock) {
      const R = this.r * Math.min(view.w, view.h);
      const cx = this.x * view.w + Math.sin(clock * 0.045) * 5;
      const cy = this.y * view.h + Math.cos(clock * 0.052) * 5;
      const I = this.intensity;

      // The two drift together and apart; the gap never fully closes.
      const dmin = 0.72 * R, dmax = 1.24 * R;
      const d = dmin + (dmax - dmin) * (0.5 + 0.5 * Math.sin(clock * 0.09));
      const phi = Math.sin(clock * 0.03) * 0.35;
      const ax = cx - Math.cos(phi) * d / 2, ay = cy - Math.sin(phi) * d / 2;
      const bx = cx + Math.cos(phi) * d / 2, by = cy + Math.sin(phi) * d / 2;
      const closeness = 1 - (d - dmin) / (dmax - dmin);

      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.globalCompositeOperation = 'lighter';

      // Two hearts, beating slightly out of time.
      const beatA = Math.pow(Math.max(0, Math.sin(clock * 1.45)), 3) * 0.14;
      const beatB = Math.pow(Math.max(0, Math.sin(clock * 1.45 + 1.1)), 3) * 0.14;
      glow(ctx, ax, ay, R * 0.42, [38, 30, 85], 0.10 + 0.26 * I + beatA);
      glow(ctx, ax, ay, R * 0.16, [42, 35, 92], 0.16 + 0.30 * I + beatA);
      glow(ctx, bx, by, R * 0.42, [353, 62, 45], 0.10 + 0.26 * I + beatB);
      glow(ctx, bx, by, R * 0.16, [353, 70, 55], 0.16 + 0.30 * I + beatB);

      // The vein between them — brightest when they are nearly touching.
      const veinAlpha = 0.05 + closeness * 0.25 + I * 0.22;
      const mx = (ax + bx) / 2, my = (ay + by) / 2 + d * 0.22;
      ctx.strokeStyle = hsla([358, 60, 58], veinAlpha);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(mx, my, bx, by);
      ctx.stroke();
      glow(ctx, ax, ay, 5, [358, 60, 60], veinAlpha * 0.8);
      glow(ctx, bx, by, 5, [358, 60, 60], veinAlpha * 0.8);

      if (this.trace > 0) glow(ctx, cx, cy - R * 0.5, 13, [40, 85, 66], 0.18 * this.trace);
      ctx.restore();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Intimacy — a candle in a dark room. The smallest region; it only    */
/* speaks to those who come close.                                     */
/* ------------------------------------------------------------------ */
function makeIntimacy() {
  return {
    id: 'intimacy',
    name: 'intimacy',
    x: 0.83, y: 0.60, r: 0.085,
    hue: [38, 70, 60],
    tone: [329.63],
    air: (sound) => {
      const d = sound.drone({ frequencies: [392], spread: 2 });
      return {
        set: (level) => d.set(level * 0.018, 0.5),
        stop: d.stop,
      };
    },
    draw(ctx, view, clock) {
      const R = this.r * Math.min(view.w, view.h);
      const cx = this.x * view.w + Math.sin(clock * 0.03) * 3;
      const cy = this.y * view.h + Math.cos(clock * 0.026) * 3;
      const I = this.intensity;
      ctx.save();
      ctx.globalAlpha = this.alpha;

      // A hush of shadow — this corner of the field is darker than the rest.
      const shade = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.8);
      shade.addColorStop(0, 'rgba(2, 2, 5, 0.5)');
      shade.addColorStop(1, 'rgba(2, 2, 5, 0)');
      ctx.fillStyle = shade;
      ctx.fillRect(cx - R * 1.8, cy - R * 1.8, R * 3.6, R * 3.6);

      ctx.globalCompositeOperation = 'lighter';

      // The candle-point, flickering almost imperceptibly.
      const flicker = 0.85 + 0.15 * Math.sin(clock * 9.3) * Math.sin(clock * 3.7);
      glow(ctx, cx, cy, R * 0.9, [30, 55, 45], 0.20 * I);
      glow(ctx, cx, cy, 24 + 12 * I, [40, 85, 68], (0.30 + 0.42 * I) * flicker);
      dab(ctx, cx, cy, 1.6, 1.6, 0, [45, 60, 97], 0.85);

      // Close attention finds a second, cooler glint — the pearl.
      if (I > 0.45) {
        const pa = (I - 0.45) * 1.1 * (0.6 + 0.4 * Math.sin(clock * 0.9));
        const px = cx + R * 0.30, py = cy + R * 0.20;
        glow(ctx, px, py, 7, [210, 40, 85], pa * 0.5);
        dab(ctx, px, py, 1.2, 1.2, 0, [210, 30, 94], pa);
      }

      if (this.trace > 0) glow(ctx, cx - R * 0.4, cy + R * 0.3, 9, [40, 80, 62], 0.20 * this.trace);
      ctx.restore();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Awe / Impermanence — a wave that gathers, breaks into spray, and    */
/* is always beginning again.                                          */
/* ------------------------------------------------------------------ */
function makeAwe() {
  const rnd = mulberry32(55);
  const spray = [];
  const PERIOD = 16;
  let lastPhase = 0;
  // The wave is a mass of pigment, not an outline: jittered columns of
  // dabs stacked from trough to crest, and a dimmer swell behind.
  const columns = Array.from({ length: 40 }, (_, i) => ({
    u: Math.min(0.98, Math.max(0.02, (i + (rnd() - 0.5) * 0.7) / 39)),
    sway: rnd() * TAU,
    // Stratified but irregular depths, so no two columns band together.
    ks: [rnd() * 0.22, 0.2 + rnd() * 0.3, 0.45 + rnd() * 0.3, 0.72 + rnd() * 0.28],
    sizes: [0.8 + rnd() * 0.6, 0.8 + rnd() * 0.6, 0.8 + rnd() * 0.6, 0.8 + rnd() * 0.6],
  }));
  const backSwell = Array.from({ length: 26 }, (_, i) => ({
    u: (i + rnd() * 0.8) / 25,
    size: 2.5 + rnd() * 3,
  }));

  return {
    id: 'awe',
    name: 'awe',
    x: 0.74, y: 0.28, r: 0.17,
    hue: [214, 60, 45],
    tone: [110.0, 220.0],
    air: (sound) => {
      let bed = null;
      return {
        set: (level, clock) => {
          if (!bed && level > 0.001) {
            bed = sound.noise({ color: 'brown', level: 0, fadeIn: 0.1, filter: { frequency: 220 } });
          }
          if (bed) bed.set(level * 0.10 * (0.55 + 0.45 * Math.sin(clock * 0.34)), 0.4);
        },
        stop: (s) => bed && bed.stop(s),
      };
    },
    draw(ctx, view, clock, dt) {
      const R = this.r * Math.min(view.w, view.h);
      const cx = this.x * view.w + Math.sin(clock * 0.04) * 5;
      const cy = this.y * view.h + Math.cos(clock * 0.048) * 4;
      const I = this.intensity;
      const phase = (clock % PERIOD) / PERIOD;
      const baseY = cy + R * 0.42;

      // The swell: rises for most of the cycle, falls after the break.
      const BREAK = 0.62;
      let h;
      if (phase < BREAK) {
        const g = phase / BREAK;
        h = 0.30 + 0.95 * g * g * (3 - 2 * g);
      } else {
        h = 0.30 + 0.95 * (1 - (phase - BREAK) / (1 - BREAK));
      }

      // The break: the crest dissolves into spray, once per cycle.
      if (lastPhase < BREAK && phase >= BREAK) {
        for (let i = 0; i < 70; i++) {
          const u = 0.3 + rnd() * 0.45;
          spray.push({
            x: cx + (u - 0.5) * 2.3 * R,
            y: baseY - h * R * Math.pow(Math.sin(u * Math.PI), 1.4),
            vx: -(20 + rnd() * 70),
            vy: -(15 + rnd() * 55),
            life: 2.6 + rnd() * 1.2,
            age: 0,
            size: 0.8 + rnd() * 1.7,
          });
        }
      }
      lastPhase = phase;

      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.globalCompositeOperation = 'lighter';

      glow(ctx, cx, baseY - R * 0.15, R * 1.4, [218, 55, 30], 0.10 + 0.18 * I);

      // A dimmer swell behind the wave, so the sea has a horizon.
      for (const b of backSwell) {
        const profile = Math.pow(Math.sin(b.u * Math.PI), 1.2);
        const wx = cx + (b.u - 0.5) * 2.7 * R;
        const wy = baseY + R * 0.12 - h * 0.5 * R * profile;
        dab(ctx, wx, wy, b.size * 2.2, b.size * 0.9, (b.u - 0.5) * 0.5,
          [220, 50, 22], (0.06 + 0.16 * I) * (0.4 + 0.6 * profile));
      }

      // The wave body: stacked pigment from trough to crest, foam at the
      // lip when the swell is tall.
      for (const col of columns) {
        const u = col.u;
        const profile = Math.pow(Math.sin(u * Math.PI), 1.4) * (1 - 0.30 * (u - 0.5));
        const wx = cx + (u - 0.5) * 2.3 * R + Math.sin(clock * 0.6 + col.sway) * 1.5;
        const crestY = baseY - h * R * profile;
        for (let r = 0; r < col.ks.length; r++) {
          const k = col.ks[r]; // 0 at crest, 1 near base
          const wy = crestY + (baseY - crestY) * k * 0.92;
          const depth = profile * h * (1 - k * 0.75);
          const size = (2.0 + depth * 3.4) * col.sizes[r];
          const foam = r === 0 && profile > 0.7 && h > 0.85;
          const color = foam ? [202, 16, 90] : [215, 60, 22 + depth * 30];
          const a = (0.08 + 0.30 * I) * (0.35 + 0.65 * depth);
          dab(ctx, wx, wy, size * 1.5, size * 0.6, (u - 0.5) * 1.0, color, a);
          if (foam) {
            dab(ctx, wx + Math.sin(clock * 2 + col.sway) * 2.5, crestY - size,
              size * 0.7, size * 0.35, 0, [200, 12, 95], a * 1.1);
          }
        }
      }

      // Spray: what the wave becomes, briefly.
      for (let i = spray.length - 1; i >= 0; i--) {
        const s = spray[i];
        s.age += dt;
        if (s.age > s.life) { spray.splice(i, 1); continue; }
        s.vy += 26 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const k = 1 - s.age / s.life;
        dab(ctx, s.x, s.y, s.size, s.size, 0, [202, 18, 92], k * (0.22 + 0.30 * I));
      }

      if (this.trace > 0) glow(ctx, cx, baseY + 12, 13, [40, 85, 66], 0.18 * this.trace);
      ctx.restore();
    },
  };
}

export function createRegions() {
  const regions = [makeWonder(), makeSerenity(), makeLonging(), makeIntimacy(), makeAwe()];
  for (const region of regions) {
    region.intensity = 0.22;
    region.alpha = 1;
    region.trace = 0;
  }
  return regions;
}
