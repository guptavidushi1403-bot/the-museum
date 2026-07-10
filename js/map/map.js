/**
 * The emotion map — the museum's first world.
 *
 * There is nothing to click. Regions notice being noticed: attention makes
 * them brighten and lean nearer; sustained attention makes one beckon (its
 * air becomes audible, its name surfaces like a remembered word); and if
 * the visitor stays with it, the field itself commits — the world falls
 * gently into that emotion. Looking away at any point before the fall
 * releases the spell. Entering is something you do by dwelling.
 *
 * Entry ritual: idle → beckoning → entering → vestibule → exhale → idle.
 * The vestibule stands in for the room until each room is built — the
 * map records the visit, holds the visitor inside the emotion's
 * atmosphere, then breathes them back out into the field, which now
 * quietly remembers them.
 */
import { createAttention } from '../core/attention.js';
import { createParallax } from '../core/parallax.js';
import { createSound } from '../core/audio.js';
import { createMemory } from '../core/memory.js';
import { createRegions } from './regions.js';
import { createAtmosphere } from './atmosphere.js';

const BLEED = 80;

export function bootMap() {
  const museum = document.getElementById('museum');
  const stage = document.getElementById('stage');
  const whispersRoot = document.getElementById('whispers');
  const glowEl = document.getElementById('glow');
  const veil = document.getElementById('veil');

  const canvases = {
    haze: document.getElementById('haze'),
    field: document.getElementById('field'),
    motes: document.getElementById('motes'),
  };
  const ctxs = {
    haze: canvases.haze.getContext('2d'),
    field: canvases.field.getContext('2d'),
    motes: canvases.motes.getContext('2d'),
  };

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sound = createSound();
  sound.unlock();
  const memory = createMemory();
  const parallax = createParallax(museum, { maxShift: 46, ease: 0.032 });
  const attention = createAttention({ grow: 0.55, decay: 0.3, stillAfter: 0.9 });
  const regions = createRegions();
  const atmosphere = createAtmosphere();

  for (const region of regions) {
    region.trace = Math.min(memory.roomVisits(region.id), 3) / 3;
  }

  parallax.layer(canvases.haze, 0.10);
  parallax.layer(canvases.field, 0.34);
  parallax.layer(whispersRoot, 0.34);
  parallax.layer(canvases.motes, 0.85);
  for (const el of Object.values(canvases)) el.classList.add('layer');

  const view = { w: 0, h: 0 };
  const whispers = new Map();
  for (const region of regions) {
    const el = document.createElement('div');
    el.className = 'whisper';
    el.textContent = region.name;
    whispersRoot.appendChild(el);
    whispers.set(region.id, el);
  }

  function resize() {
    view.w = innerWidth + BLEED * 2;
    view.h = innerHeight + BLEED * 2;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    for (const canvas of Object.values(canvases)) {
      canvas.width = view.w * dpr;
      canvas.height = view.h * dpr;
      canvas.style.width = `${view.w}px`;
      canvas.style.height = `${view.h}px`;
    }
    for (const ctx of Object.values(ctxs)) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const region of regions) {
      const el = whispers.get(region.id);
      const R = region.r * Math.min(view.w, view.h);
      el.style.left = `${-BLEED + region.x * view.w}px`;
      el.style.top = `${-BLEED + region.y * view.h + R * 0.85 + 26}px`;
    }
    atmosphere.resize(view);
  }
  resize();
  addEventListener('resize', resize);

  // Where a region lives on screen right now (parallax included).
  function regionPoint(region) {
    const rect = canvases.field.getBoundingClientRect();
    const R = region.r * Math.min(rect.width, rect.height);
    return {
      x: rect.left + region.x * rect.width,
      y: rect.top + region.y * rect.height,
      r: R + 90,
    };
  }

  const handles = new Map();
  for (const region of regions) {
    handles.set(region.id, attention.watch({
      id: region.id,
      region: () => regionPoint(region),
      threshold: 0.85,
    }));
  }

  const airs = new Map();
  function airOf(region) {
    if (!airs.has(region.id)) airs.set(region.id, region.air(sound));
    return airs.get(region.id);
  }

  /* ----- the entry ritual state machine ----- */
  const state = { mode: 'idle', focus: null, beckonAt: 0, lowSince: null, restId: null, restUntil: 0 };
  const byId = new Map(regions.map((r) => [r.id, r]));

  attention.on('attained', ({ id }) => {
    if (state.mode !== 'idle') {
      if (id !== state.focus) handles.get(id).reset();
      return;
    }
    // A room just exited rests a moment: standing before it again must
    // not immediately pull the visitor back in.
    if (id === state.restId && clock < state.restUntil) {
      handles.get(id).reset();
      return;
    }
    beginBeckon(id);
  });

  function beginBeckon(id) {
    const region = byId.get(id);
    state.mode = 'beckoning';
    state.focus = id;
    state.beckonAt = clock;
    state.lowSince = null;
    whispers.get(id).classList.add('awake');
    parallax.drawToward(region.x * 2 - 1, region.y * 2 - 1, 0.45);
  }

  function abortBeckon() {
    whispers.get(state.focus).classList.remove('awake');
    handles.get(state.focus).reset();
    parallax.release();
    state.mode = 'idle';
    state.focus = null;
  }

  function enter(id) {
    const region = byId.get(id);
    state.mode = 'entering';
    whispers.get(id).classList.remove('awake');
    whispersRoot.style.opacity = '0';

    const pt = regionPoint(region);
    const gx = (pt.x / innerWidth) * 100;
    const gy = (pt.y / innerHeight) * 100;
    const [h, s, l] = region.hue;
    glowEl.style.background =
      `radial-gradient(circle at ${gx}% ${gy}%,
        hsla(${h}, ${s}%, ${l}%, 0) 6%,
        hsla(${h}, ${Math.round(s * 0.6)}%, ${Math.round(l * 0.4)}%, 0.35) 34%,
        rgba(4, 5, 9, 0.94) 78%)`;
    glowEl.classList.add('on');

    stage.style.transformOrigin = `${pt.x}px ${pt.y}px`;
    stage.style.transform = `scale(${reduced ? 1.45 : 2.25})`;

    parallax.calm(0.05);
    parallax.drawToward(region.x * 2 - 1, region.y * 2 - 1, 0.85);
    sound.holdTone({ frequencies: region.tone, peak: 0.05, attack: 2.4, hold: 0.8, release: 5.5 });

    setTimeout(() => vestibule(id), 3400);
  }

  function vestibule(id) {
    state.mode = 'vestibule';
    memory.rememberRoom(id);
    const region = byId.get(id);
    region.trace = Math.min(memory.roomVisits(id), 3) / 3;
    sound.thin(0.06, 4);
    setTimeout(async () => {
      const entered = await tryRoom(id);
      if (!entered) exhale();
    }, 4600);
  }

  // Rooms arrive in a later stage; when js/rooms/<id>.js exists, the map
  // hands the visitor over instead of breathing them back out.
  async function tryRoom(id) {
    try {
      const head = await fetch(`js/rooms/${id}.js`, { method: 'HEAD' });
      if (!head.ok) return false;
      const room = await import(`../rooms/${id}.js`);
      if (typeof room.enter !== 'function') return false;
      room.enter({ sound, memory, attention, parallax, stage });
      return true;
    } catch {
      return false;
    }
  }

  function exhale() {
    const visited = state.focus;
    state.mode = 'exhale';
    stage.style.transform = '';
    glowEl.classList.remove('on');
    whispersRoot.style.opacity = '1';
    parallax.calm(1);
    parallax.release();
    sound.restore(3);
    setTimeout(() => {
      state.mode = 'idle';
      state.focus = null;
      state.restId = visited;
      state.restUntil = clock + 6;
      for (const handle of handles.values()) handle.reset();
    }, 2900);
  }

  /* ----- the living field ----- */
  let clock = performance.now() / 1000;
  let lastAir = 0;

  function frame(now) {
    const t = now / 1000;
    const dt = Math.min(t - clock, 0.1);
    clock = t;

    for (const region of regions) {
      const att = handles.get(region.id).attention;
      let target = 0.22 + region.trace * 0.12 + att * 0.75;
      let alphaTarget = 1;
      if (state.mode === 'beckoning' && state.focus === region.id) {
        target = Math.max(target, 0.95);
      }
      if (state.mode === 'entering' || state.mode === 'vestibule') {
        if (state.focus === region.id) target = 1.15;
        else alphaTarget = 0;
      }
      const k = 1 - Math.exp(-dt * 2.2);
      region.intensity += (target - region.intensity) * k;
      region.alpha += (alphaTarget - region.alpha) * k;
    }

    if (state.mode === 'beckoning') {
      const level = handles.get(state.focus).attention;
      if (level < 0.62) {
        state.lowSince ??= clock;
        if (clock - state.lowSince > 0.65) abortBeckon();
      } else {
        state.lowSince = null;
      }
      if (state.mode === 'beckoning' && clock - state.beckonAt > 2.3) enter(state.focus);
    }

    atmosphere.drawHaze(ctxs.haze, view, clock);
    ctxs.field.clearRect(0, 0, view.w, view.h);
    const speed = reduced ? 0.4 : 1;
    for (const region of regions) region.draw(ctxs.field, view, clock * speed, dt * speed);
    atmosphere.drawMotes(ctxs.motes, view, clock * speed, dt * speed);

    // Each region's air follows its intensity — audible only under
    // attention, silent at rest. Throttled; ramps smooth the steps.
    if (clock - lastAir > 0.12) {
      lastAir = clock;
      for (const region of regions) {
        const base = 0.22 + region.trace * 0.12;
        const focused = state.focus === region.id && state.mode !== 'exhale';
        const level = Math.max(0, Math.min(1, (region.intensity - base - 0.06) * 1.6))
          * region.alpha * (state.mode === 'idle' || focused ? 1 : 0.4);
        if (level > 0.002 || airs.has(region.id)) airOf(region).set(level, clock);
      }
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Arrival: the field exhales out of black. No text, no instructions.
  requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('lifted')));

  // A quiet debug/testing surface; renders nothing.
  window.__museum = {
    get mode() { return state.mode; },
    get focus() { return state.focus; },
    regions, memory, sound, attention, parallax,
  };
}
