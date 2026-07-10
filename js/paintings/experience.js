/**
 * The painting experience runner — one engine, five worlds.
 *
 * Carries every painting through the five-beat arc:
 *   Wonder      pure arrival: the world fades in, wordless.
 *   Curiosity   discovery nodes respond to attention; each attained node
 *               is noticed by the arc and may surface a reveal (a quoted
 *               remembered echo, or a small environmental sense-line).
 *   Connection  order-free threshold; a single held tone swells; nothing new.
 *   Reflection  motion slows, sound thins toward near-silence.
 *   Return      the closing ritual: the immersive world recedes into the
 *               whole composition inside a reforming frame — the visitor
 *               stands before the painting, no longer inside it. If the
 *               real public-domain image exists at
 *               assets/art/<slug>/painting.jpg it is shown exactly;
 *               otherwise the scene's own whole-composition rendering is.
 *
 * Pulling back to the bottom edge of the screen at any time withdraws —
 * every visit, even one cut short, closes with the Return ritual.
 *
 * Scene contract: { slug, title, artist, year, aspect, connectionTone,
 *   connectionThreshold?, ambient(sound) -> { stop(seconds) },
 *   nodes: [{ id, at:[fx,fy], r?, layer?, reveal:{kind,text,attribution?} }],
 *   layers: [{ depth, draw(ctx, view, clock, dt, world) }],
 *   drawWhole(ctx, w, h, clock) }
 */
import { createArc } from '../core/arc.js';
import { createAttention } from '../core/attention.js';
import { createParallax } from '../core/parallax.js';

const BLEED = 50;

// Test/dev hook: window.__museumTempo > 1 compresses every dwell and
// transition (used by the browser test suite); visitors run at 1.
const T = (ms) => ms / (window.__museumTempo || 1);

function el(tag, className, parent) {
  const node = document.createElement(tag);
  node.className = className;
  if (parent) parent.appendChild(node);
  return node;
}

export function runExperience(scene, { sound, memory, host, onClose }) {
  const root = el('div', 'experience', host);
  const worldEl = el('div', 'exp-world', root);
  const canvasEls = scene.layers.map(() => {
    const canvas = el('canvas', 'exp-layer', worldEl);
    return canvas;
  });
  const ctxs = canvasEls.map((c) => c.getContext('2d'));

  const revealEl = el('div', 'reveal', root);
  const revealText = el('div', 'reveal-text', revealEl);
  const revealAttr = el('div', 'reveal-attr', revealEl);

  const wholeEl = el('canvas', 'whole', root);
  const frameEl = el('div', 'frame', root);
  const labelEl = el('div', 'exp-label', root);
  const veil = el('div', 'exp-veil', root);

  // The real painting, if the repo carries it (see module doc).
  let paintingImg = null;
  fetch(`assets/art/${scene.slug}/painting.jpg`, { method: 'HEAD' })
    .then((r) => {
      if (!r.ok) return;
      const img = new Image();
      img.onload = () => { paintingImg = img; };
      img.src = `assets/art/${scene.slug}/painting.jpg`;
    })
    .catch(() => {});

  const view = { w: 0, h: 0 };
  function resize() {
    view.w = innerWidth + BLEED * 2;
    view.h = innerHeight + BLEED * 2;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    for (let i = 0; i < canvasEls.length; i++) {
      canvasEls[i].width = view.w * dpr;
      canvasEls[i].height = view.h * dpr;
      canvasEls[i].style.width = `${view.w}px`;
      canvasEls[i].style.height = `${view.h}px`;
      ctxs[i].setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  resize();
  addEventListener('resize', resize);

  const arc = createArc({ connectionThreshold: scene.connectionThreshold ?? 3 });
  const attention = createAttention({ grow: 0.6, decay: 0.3, stillAfter: 0.9 });
  const parallax = createParallax(root, { maxShift: 30, ease: 0.04 });
  scene.layers.forEach((layer, i) => parallax.layer(canvasEls[i], layer.depth));

  const world = {
    beat: 'wonder',
    connection: 0,
    tempo: 1,
    nodes: new Map(scene.nodes.map((n) => [n.id, { ...n, attention: 0, noticed: false }])),
  };

  function nodePoint(n) {
    const ref = canvasEls[Math.min(n.layer ?? 1, canvasEls.length - 1)];
    const rect = ref.getBoundingClientRect();
    return {
      x: rect.left + n.at[0] * rect.width,
      y: rect.top + n.at[1] * rect.height,
      r: (n.r ?? 0.15) * Math.min(rect.width, rect.height) + 60,
    };
  }

  function edgeRegion() {
    return { x: innerWidth / 2, y: innerHeight + 130, r: 320 };
  }

  /* ----- sound: the world's own air, silence-first ----- */
  let airs = null;
  const airTimer = setTimeout(() => { airs = scene.ambient?.(sound) ?? null; }, T(1500));

  /* ----- reveals: one at a time, surfacing like memory ----- */
  const revealQueue = [];
  let revealBusy = false;
  function showReveal(reveal) {
    if (!reveal) return;
    revealQueue.push(reveal);
    pumpReveals();
  }
  function pumpReveals() {
    if (revealBusy || revealQueue.length === 0 || returning) return;
    revealBusy = true;
    const r = revealQueue.shift();
    revealText.textContent = r.text;
    revealText.classList.toggle('sense', r.kind === 'sense');
    revealAttr.textContent = r.attribution ?? '';
    revealEl.classList.add('on');
    setTimeout(() => {
      revealEl.classList.remove('on');
      setTimeout(() => { revealBusy = false; pumpReveals(); }, T(2200));
    }, T(r.kind === 'quote' ? 9000 : 7000));
  }

  /* ----- discovery wiring ----- */
  const armTimer = setTimeout(() => {
    for (const n of scene.nodes) {
      attention.watch({ id: n.id, region: () => nodePoint(n), threshold: 0.8 });
    }
    attention.watch({ id: '__edge', region: edgeRegion, threshold: 0.9 });
  }, T(4500));

  attention.on('change', ({ id, attention: a }) => {
    const n = world.nodes.get(id);
    if (n) n.attention = a;
  });

  attention.on('attained', ({ id }) => {
    if (id === '__edge') { arc.withdraw(); return; }
    const n = world.nodes.get(id);
    if (!n || n.noticed) return;
    if (arc.notice(id)) {
      n.noticed = true;
      showReveal(n.reveal);
    }
  });

  const beatTimers = [];
  arc.on('beat', ({ to }) => {
    world.beat = to;
    if (to === 'connection') {
      sound.holdTone({
        frequencies: scene.connectionTone,
        peak: 0.05, attack: T(3200) / 1000, hold: T(1000) / 1000, release: T(6000) / 1000,
      });
      beatTimers.push(setTimeout(() => arc.settle(), T(9500)));
    }
    if (to === 'reflection') {
      parallax.calm(0.12);
      sound.thin(0.05, T(6500) / 1000);
      beatTimers.push(setTimeout(() => arc.withdraw(), T(12000)));
    }
    if (to === 'return') beginReturn();
  });

  /* ----- the living world ----- */
  let raf = null;
  let last = performance.now();
  let worldClock = 0;
  let returning = false;
  let wholeRaf = null;

  function frame(now) {
    // Clamp below at 0: the first rAF timestamp can precede the
    // performance.now() captured at setup.
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
    last = now;

    const tempoTarget = world.beat === 'reflection' ? 0.3 : world.beat === 'return' ? 0.15 : 1;
    world.tempo += (tempoTarget - world.tempo) * (1 - Math.exp(-dt * 1.4));
    const connTarget = (world.beat === 'connection' || world.beat === 'reflection'
      || world.beat === 'return') ? 1 : 0;
    world.connection += (connTarget - world.connection) * (1 - Math.exp(-dt * 1.1));

    worldClock += dt * world.tempo;
    for (let i = 0; i < scene.layers.length; i++) {
      ctxs[i].clearRect(0, 0, view.w, view.h);
      scene.layers[i].draw(ctxs[i], view, worldClock, dt * world.tempo, world);
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  // Arrival: out of black, wordless.
  requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('lifted')));

  /* ----- the Return ritual ----- */
  function beginReturn() {
    if (returning) return;
    returning = true;
    attention.stop();
    airs?.stop?.(T(6000) / 1000);
    revealEl.classList.remove('on');
    revealQueue.length = 0;

    // The frame reforms at the painting's true proportions.
    const maxW = innerWidth * 0.62, maxH = innerHeight * 0.64;
    let fw = maxW, fh = fw / scene.aspect;
    if (fh > maxH) { fh = maxH; fw = fh * scene.aspect; }
    const fx = (innerWidth - fw) / 2;
    const fy = (innerHeight - fh) / 2 - innerHeight * 0.03;

    const dpr = Math.min(devicePixelRatio || 1, 2);
    wholeEl.width = fw * dpr;
    wholeEl.height = fh * dpr;
    Object.assign(wholeEl.style, { left: `${fx}px`, top: `${fy}px`, width: `${fw}px`, height: `${fh}px` });
    Object.assign(frameEl.style, { left: `${fx - 14}px`, top: `${fy - 14}px`, width: `${fw + 28}px`, height: `${fh + 28}px` });
    Object.assign(labelEl.style, { left: `${fx}px`, top: `${fy + fh + 30}px`, width: `${fw}px` });
    labelEl.innerHTML = '';
    el('div', 'exp-label-title', labelEl).textContent = scene.title;
    el('div', 'exp-label-artist', labelEl).textContent = `${scene.artist}, ${scene.year}`;

    const wctx = wholeEl.getContext('2d');
    wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    function drawWholeFrame(now) {
      if (paintingImg) {
        // The original, exactly as the artist made it.
        const s = Math.max(fw / paintingImg.width, fh / paintingImg.height);
        const iw = paintingImg.width * s, ih = paintingImg.height * s;
        wctx.drawImage(paintingImg, (fw - iw) / 2, (fh - ih) / 2, iw, ih);
      } else {
        scene.drawWhole(wctx, fw, fh, now / 1000);
      }
      wholeRaf = requestAnimationFrame(drawWholeFrame);
    }
    wholeRaf = requestAnimationFrame(drawWholeFrame);

    root.classList.add('returning');
    beatTimers.push(setTimeout(() => {
      frameEl.classList.add('on');
      wholeEl.classList.add('on');
    }, T(1400)));
    beatTimers.push(setTimeout(() => labelEl.classList.add('on'), T(3600)));

    sound.hush(T(6000) / 1000);
    memory.rememberReturn(scene.slug);

    beatTimers.push(setTimeout(() => {
      veil.classList.remove('lifted'); // back into the dark, changed
      beatTimers.push(setTimeout(teardown, T(2800)));
    }, T(11500)));
  }

  function teardown() {
    cancelAnimationFrame(raf);
    if (wholeRaf) cancelAnimationFrame(wholeRaf);
    clearTimeout(airTimer);
    clearTimeout(armTimer);
    for (const t of beatTimers) clearTimeout(t);
    airs?.stop?.(0.5);
    attention.dispose();
    parallax.dispose();
    removeEventListener('resize', resize);
    root.remove();
    sound.restore(2);
    window.__exp = null;
    onClose();
  }

  // Quiet debug/testing surface; renders nothing.
  window.__exp = { arc, world, scene, nodePoint: (id) => nodePoint(world.nodes.get(id)) };
  return { arc };
}
