/**
 * The emotion room — home base between the map and a painting.
 *
 * The room is the inside of the weather the visitor chose: its phenomenon
 * fills the world, larger and closer than on the map. The painting waits
 * lower in the room as a presence — a canvas-shaped shimmer of its own
 * palette, unlabeled until it beckons. Dwelling on it opens the painting
 * experience; drifting to the bottom of the room and lingering breathes
 * the visitor back out to the map. After a painting's Return, the visitor
 * lands here again (rule 3: the room is home base), and the presence
 * carries a quiet warm ember.
 *
 * config: { id, phenomenon: factory, air(sound) -> {stop}, painting:
 *   { slug, title, artist, year, aspect, palette: [hue, hue, ...] } }
 */
import { createAttention } from '../core/attention.js';
import { createParallax } from '../core/parallax.js';
import { runExperience } from '../paintings/experience.js';
import { mulberry32, hsla, glow, dab } from '../paintings/helpers.js';

const BLEED = 50;
const T = (ms) => ms / (window.__museumTempo || 1);

export function createRoom(config) {
  return { enter };

  function enter({ sound, memory, host, onLeave }) {
    const root = document.createElement('div');
    root.className = 'room';
    host.appendChild(root);

    const canvas = document.createElement('canvas');
    canvas.className = 'room-layer';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const whisper = document.createElement('div');
    whisper.className = 'room-whisper';
    whisper.textContent = config.painting.title.toLowerCase();
    root.appendChild(whisper);

    const veil = document.createElement('div');
    veil.className = 'room-veil';
    root.appendChild(veil);

    const parallax = createParallax(root, { maxShift: 24, ease: 0.035 });
    parallax.layer(canvas, 0.4);

    const attention = createAttention({ grow: 0.6, decay: 0.3, stillAfter: 0.9 });

    // The emotion's phenomenon, recentered and enlarged.
    const phenomenon = config.phenomenon();
    phenomenon.x = 0.5;
    phenomenon.y = 0.34;
    phenomenon.r = Math.min(phenomenon.r * 2.1, 0.30);
    phenomenon.intensity = 0.8;
    phenomenon.alpha = 1;
    phenomenon.trace = 0;

    // The painting presence.
    const presence = {
      at: [0.5, 0.72],
      h: 0.24, // of min dimension
      attention: 0,
      ember: memory.hasReturned(config.painting.slug),
    };
    const rnd = mulberry32(99);
    const weave = Array.from({ length: 26 }, () => ({
      u: rnd(), v: rnd(),
      hue: config.painting.palette[Math.floor(rnd() * config.painting.palette.length)],
      ph: rnd() * Math.PI * 2,
      len: 0.2 + rnd() * 0.5,
    }));

    const view = { w: 0, h: 0 };
    function resize() {
      view.w = innerWidth + BLEED * 2;
      view.h = innerHeight + BLEED * 2;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = view.w * dpr;
      canvas.height = view.h * dpr;
      canvas.style.width = `${view.w}px`;
      canvas.style.height = `${view.h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const px = -BLEED + presence.at[0] * view.w;
      const py = -BLEED + presence.at[1] * view.h;
      const ph = presence.h * Math.min(view.w, view.h);
      whisper.style.left = `${px}px`;
      whisper.style.top = `${py + ph / 2 + 34}px`;
    }
    resize();
    addEventListener('resize', resize);

    function presenceRect() {
      const rect = canvas.getBoundingClientRect();
      const m = Math.min(rect.width, rect.height);
      const h = presence.h * m;
      const w = h * config.painting.aspect;
      return {
        cx: rect.left + presence.at[0] * rect.width,
        cy: rect.top + presence.at[1] * rect.height,
        w, h,
      };
    }

    const watches = [
      attention.watch({
        id: 'presence',
        region: () => {
          const r = presenceRect();
          return { x: r.cx, y: r.cy, r: Math.max(r.w, r.h) * 0.75 + 70 };
        },
        threshold: 0.85,
      }),
      attention.watch({
        id: 'threshold',
        region: () => ({ x: innerWidth / 2, y: innerHeight + 140, r: 320 }),
        threshold: 0.9,
      }),
    ];
    attention.on('change', ({ id, attention: a }) => {
      if (id === 'presence') presence.attention = a;
    });

    let air = null;
    const airTimer = setTimeout(() => { air = config.air?.(sound) ?? null; }, T(1200));

    const state = { mode: 'idle', beckonAt: 0 };
    let clock = 0;
    let last = performance.now();
    let raf = null;

    attention.on('attained', ({ id }) => {
      if (state.mode !== 'idle') return;
      if (id === 'presence') {
        state.mode = 'beckoning';
        state.beckonAt = clock;
        whisper.classList.add('awake');
        parallax.drawToward(presence.at[0] * 2 - 1, presence.at[1] * 2 - 1, 0.5);
      }
      if (id === 'threshold') leave();
    });

    function frame(now) {
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
      last = now;
      clock += dt;

      ctx.clearRect(0, 0, view.w, view.h);
      phenomenon.intensity += ((state.mode === 'idle' ? 0.8 : 0.55) - phenomenon.intensity) * dt;
      phenomenon.draw(ctx, view, clock, dt);
      drawPresence();

      if (state.mode === 'beckoning') {
        const a = presence.attention;
        if (a < 0.55) abortBeckon();
        else if (clock - state.beckonAt > T(2200) / 1000) launch();
      }
      raf = requestAnimationFrame(frame);
    }

    function drawPresence() {
      const m = Math.min(view.w, view.h);
      const h = presence.h * m;
      const w = h * config.painting.aspect;
      const cx = presence.at[0] * view.w;
      const cy = presence.at[1] * view.h;
      const a = presence.attention;
      const breathe = 0.85 + 0.15 * Math.sin(clock * 0.6);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, cx, cy, Math.max(w, h) * (0.9 + 0.35 * a),
        config.painting.palette[0], (0.05 + 0.16 * a) * breathe);

      // The canvas-in-waiting: woven strokes of the painting's palette.
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - w / 2, cy - h / 2, w, h);
      ctx.clip();
      for (const s of weave) {
        const sx = cx - w / 2 + s.u * w + Math.sin(clock * 0.12 + s.ph) * 7;
        const sy = cy - h / 2 + s.v * h + Math.cos(clock * 0.1 + s.ph) * 4;
        dab(ctx, sx, sy, s.len * w * 0.25, 2.2, 0.05 * Math.sin(s.ph),
          s.hue, 0.10 + 0.30 * a);
      }
      ctx.restore();

      // A breath of frame, firming as attention rests.
      ctx.strokeStyle = hsla([46, 40, 78], 0.10 + 0.42 * a);
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);

      if (presence.ember) {
        glow(ctx, cx + w / 2 - 10, cy + h / 2 - 10, 9, [40, 90, 65], 0.5);
      }
      ctx.restore();
    }

    function abortBeckon() {
      state.mode = 'idle';
      whisper.classList.remove('awake');
      parallax.release();
    }

    async function launch() {
      state.mode = 'launching';
      whisper.classList.remove('awake');
      air?.stop?.(2);
      air = null;
      attention.stop();
      const scene = (await import(`../paintings/${config.painting.slug}/scene.js`)).default;
      runExperience(scene, {
        sound, memory, host,
        onClose: () => {
          // Home base: the visitor lands back in this room, remembered.
          presence.ember = memory.hasReturned(config.painting.slug);
          presence.attention = 0;
          state.mode = 'idle';
          for (const w of watches) w.reset();
          attention.start();
          air = config.air?.(sound) ?? null;
        },
      });
    }

    function leave() {
      state.mode = 'leaving';
      attention.stop();
      air?.stop?.(2.5);
      veil.classList.remove('lifted');
      setTimeout(() => {
        cancelAnimationFrame(raf);
        clearTimeout(airTimer);
        attention.dispose();
        parallax.dispose();
        removeEventListener('resize', resize);
        root.remove();
        window.__room = null;
        onLeave();
      }, T(2600));
    }

    raf = requestAnimationFrame(frame);
    requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('lifted')));

    // Quiet debug/testing surface.
    window.__room = { id: config.id, get mode() { return state.mode; }, presenceRect };
  }
}
