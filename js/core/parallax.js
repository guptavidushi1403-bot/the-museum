/**
 * Layered parallax — the museum's only notion of depth. Foreground,
 * midground and background planes shift relative to one another as the
 * visitor's attention moves. There is no camera, no 3D geometry, no free
 * navigation: motion is heavily smoothed so the world feels like it is
 * breathing around the visitor rather than being steered by them.
 *
 * Depth runs 0 (background, barely moves) to 1 (foreground, full shift).
 * Scenes can pull the view gently toward a focal point while attention
 * lingers there (drawToward/release), and slow the whole system for the
 * Reflection beat (calm) — slowed, never stopped.
 */
export function createParallax(container, {
  maxShift = 36, // px of travel at depth 1
  ease = 0.045,  // smoothing per frame at 60fps; smaller = dreamier
} = {}) {
  const layers = [];
  const view = { x: 0, y: 0 };
  const goal = { x: 0, y: 0 };
  const pull = { x: 0, y: 0, strength: 0 };
  let tempo = 1;
  let raf = null;
  let lastTime = 0;

  const reducedMotion = typeof matchMedia === 'function'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const amplitude = reducedMotion ? maxShift * 0.12 : maxShift;

  function onMove(event) {
    const rect = container.getBoundingClientRect();
    goal.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    goal.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
  }

  function onLeave() {
    goal.x = 0;
    goal.y = 0;
  }

  function frame(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    const targetX = goal.x * (1 - pull.strength) + pull.x * pull.strength;
    const targetY = goal.y * (1 - pull.strength) + pull.y * pull.strength;
    const k = 1 - Math.pow(1 - ease * tempo, dt * 60);
    view.x += (targetX - view.x) * k;
    view.y += (targetY - view.y) * k;

    for (const { el, depth } of layers) {
      const dx = -view.x * amplitude * depth;
      const dy = -view.y * amplitude * depth;
      el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
    }

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf !== null) return;
    lastTime = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
  }

  container.addEventListener('pointermove', onMove);
  container.addEventListener('pointerleave', onLeave);
  start();

  return {
    start,
    stop,

    /** Register a plane. Depth 0..1; returns the layer element. */
    layer(el, depth) {
      el.style.willChange = 'transform';
      layers.push({ el, depth });
      return el;
    },

    /** Drive the view directly (normalized -1..1), e.g. from a scene. */
    look(nx, ny) {
      goal.x = nx;
      goal.y = ny;
    },

    /**
     * Gently pull the view toward a focal point (normalized -1..1) while
     * attention lingers there — how an element "draws nearer".
     */
    drawToward(nx, ny, strength = 0.5) {
      pull.x = nx;
      pull.y = ny;
      pull.strength = Math.min(1, Math.max(0, strength));
    },

    release() {
      pull.strength = 0;
    },

    /** Slow the whole system (Reflection). 1 = normal, 0.15 = near-still. */
    calm(factor = 0.15) {
      tempo = Math.min(1, Math.max(0.02, factor));
    },

    dispose() {
      stop();
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerleave', onLeave);
      layers.length = 0;
    },
  };
}
