/**
 * The air between the emotions: deep drifting haze behind the regions,
 * near motes and a breath of grain in front. The field should feel like
 * one continuous painting the regions live inside, not five sprites on
 * a backdrop.
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

export function createAtmosphere() {
  const rnd = mulberry32(7);

  const blobs = Array.from({ length: 8 }, () => ({
    x: rnd(), y: rnd(),
    r: 0.22 + rnd() * 0.3,
    hue: [222, 250, 210, 200][Math.floor(rnd() * 4)],
    ph: rnd() * TAU,
    drift: 0.5 + rnd(),
  }));

  let motes = [];

  // A small tile of noise, repeated with a wandering offset: film grain,
  // regenerated never — only re-placed.
  const grainTile = document.createElement('canvas');
  grainTile.width = grainTile.height = 128;
  {
    const g = grainTile.getContext('2d');
    const img = g.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 200 + Math.floor(rnd() * 55);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = Math.floor(rnd() * 26);
    }
    g.putImageData(img, 0, 0);
  }
  let grainPattern = null;
  let grainShift = { x: 0, y: 0, at: 0 };

  return {
    resize(view) {
      const count = Math.max(36, Math.min(90, Math.floor((view.w * view.h) / 24000)));
      motes = Array.from({ length: count }, () => ({
        x: rnd() * view.w,
        y: rnd() * view.h,
        vx: (rnd() - 0.5) * 4,
        vy: (rnd() - 0.5) * 3,
        size: 0.6 + rnd() * 1.4,
        tw: rnd() * TAU,
      }));
    },

    drawHaze(ctx, view, clock) {
      ctx.clearRect(0, 0, view.w, view.h);
      for (const b of blobs) {
        const bx = (b.x + Math.sin(clock * 0.011 * b.drift + b.ph) * 0.04) * view.w;
        const by = (b.y + Math.cos(clock * 0.009 * b.drift + b.ph) * 0.04) * view.h;
        const r = b.r * Math.min(view.w, view.h);
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0, `hsla(${b.hue}, 38%, 26%, 0.07)`);
        g.addColorStop(1, `hsla(${b.hue}, 38%, 26%, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(bx - r, by - r, r * 2, r * 2);
      }
    },

    drawMotes(ctx, view, clock, dt) {
      ctx.clearRect(0, 0, view.w, view.h);
      for (const m of motes) {
        m.x += (m.vx + Math.sin(clock * 0.3 + m.tw) * 2) * dt;
        m.y += (m.vy + Math.cos(clock * 0.26 + m.tw) * 1.5) * dt;
        if (m.x < -4) m.x = view.w + 4;
        if (m.x > view.w + 4) m.x = -4;
        if (m.y < -4) m.y = view.h + 4;
        if (m.y > view.h + 4) m.y = -4;
        const a = (0.10 + 0.14 * Math.abs(Math.sin(clock * 0.7 + m.tw)));
        ctx.fillStyle = `hsla(48, 25%, 88%, ${a})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, TAU);
        ctx.fill();
      }

      if (!grainPattern) grainPattern = ctx.createPattern(grainTile, 'repeat');
      if (clock - grainShift.at > 0.16) {
        grainShift = { x: Math.floor(rnd() * 128), y: Math.floor(rnd() * 128), at: clock };
      }
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.translate(-grainShift.x, -grainShift.y);
      ctx.fillStyle = grainPattern;
      ctx.fillRect(0, 0, view.w + 128, view.h + 128);
      ctx.restore();
    },
  };
}
