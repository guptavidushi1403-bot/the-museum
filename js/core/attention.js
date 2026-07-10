/**
 * Attention & proximity tracking — the museum's only discovery mechanism.
 *
 * Scenes register watch targets; as the visitor's pointer rests near one,
 * its attention level rises smoothly toward 1 and decays gently when
 * attention moves elsewhere. A still pointer (lingering) strengthens
 * attention — noticing rewards patience, never clicking. There are no
 * hotspots and no markers: targets use their attention level to sharpen,
 * glow, or draw nearer, and treat 'attained' as the moment of discovery.
 *
 * Events:
 *   'stir'                              — first pointer movement (Wonder → Curiosity hook)
 *   'change'   { id, attention, proximity }
 *   'attained' { id }                   — target first reached its threshold
 */
import { createEmitter } from './emitter.js';

export function createAttention({
  surface = window,
  grow = 0.9,       // attention gained per second when the pointer is centred
  decay = 0.35,     // attention lost per second once the pointer moves away
  stillAfter = 1.0, // seconds without meaningful movement = lingering
  lingerBoost = 1.5,
} = {}) {
  const emitter = createEmitter();
  const targets = new Map();
  const pointer = { x: 0, y: 0, present: false, lastMove: 0 };
  let stirred = false;
  let raf = null;
  let lastTime = 0;

  function onMove(event) {
    const moved = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y);
    if (!pointer.present || moved > 3) pointer.lastMove = performance.now();
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.present = true;
    if (!stirred) {
      stirred = true;
      emitter.emit('stir');
    }
  }

  function onLeave() {
    pointer.present = false;
  }

  function reachOf(target) {
    if (target.region) {
      const region = typeof target.region === 'function' ? target.region() : target.region;
      return { x: region.x, y: region.y, r: region.r ?? target.radius };
    }
    const rect = target.element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      r: target.radius + Math.max(rect.width, rect.height) / 2,
    };
  }

  function frame(now) {
    const dt = Math.min(Math.max((now - lastTime) / 1000, 0), 0.1);
    lastTime = now;
    const lingering = pointer.present && (now - pointer.lastMove) / 1000 >= stillAfter;

    for (const target of targets.values()) {
      let proximity = 0;
      if (pointer.present) {
        const reach = reachOf(target);
        const distance = Math.hypot(pointer.x - reach.x, pointer.y - reach.y);
        proximity = Math.max(0, 1 - distance / reach.r);
      }

      let attention = target.attention;
      if (proximity > 0) {
        // Closer attention grows faster; lingering rewards patience.
        attention += dt * grow * proximity * proximity * (lingering ? lingerBoost : 1);
      } else {
        attention -= dt * decay;
      }
      attention = Math.min(1, Math.max(0, attention));

      const changed = Math.abs(attention - target.attention) > 0.0005
        || Math.abs(proximity - target.proximity) > 0.0005;
      target.attention = attention;
      target.proximity = proximity;
      if (changed) emitter.emit('change', { id: target.id, attention, proximity });

      if (!target.attained && attention >= target.threshold) {
        target.attained = true;
        emitter.emit('attained', { id: target.id });
      }
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

  surface.addEventListener('pointermove', onMove);
  surface.addEventListener('pointerleave', onLeave);
  start();

  return {
    on: emitter.on,
    pointer,
    start,
    stop,

    /**
     * Watch a target. Give it either an `element` or a `region`
     * ({x, y, r} in viewport coordinates, or a function returning one).
     * `radius` widens the reach around an element; `threshold` is the
     * attention level (0..1) at which 'attained' fires.
     */
    watch({ id, element = null, region = null, radius = 120, threshold = 0.85 }) {
      const target = {
        id, element, region, radius, threshold,
        attention: 0, proximity: 0, attained: false,
      };
      targets.set(id, target);
      return {
        id,
        get attention() { return target.attention; },
        get proximity() { return target.proximity; },
        reset() { target.attained = false; target.attention = 0; },
      };
    },

    unwatch(id) {
      targets.delete(id);
    },

    dispose() {
      stop();
      surface.removeEventListener('pointermove', onMove);
      surface.removeEventListener('pointerleave', onLeave);
      targets.clear();
    },
  };
}
