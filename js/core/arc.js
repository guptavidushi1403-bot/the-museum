/**
 * The five-beat emotional arc — the one structure every painting shares:
 * Wonder → Curiosity → Connection → Reflection → Return.
 *
 * Connection is a threshold state: it arrives when enough has been noticed,
 * whatever the order or subset of fragments found. Scenes must never tie it
 * to a specific discovery or a fixed sequence. Beats only move forward, and
 * every experience ends in Return — the closing ritual — no matter how the
 * visit unfolded.
 *
 * Events:
 *   'beat'   { from, to }               — the arc moved to a new beat
 *   'notice' { id, weight, progress }   — a fragment was noticed
 */
import { createEmitter } from './emitter.js';

export const BEATS = Object.freeze(['wonder', 'curiosity', 'connection', 'reflection', 'return']);

export function createArc({ connectionThreshold = 3 } = {}) {
  const emitter = createEmitter();
  const noticed = new Map(); // id -> weight
  let index = 0;

  function advanceTo(beat) {
    const to = BEATS.indexOf(beat);
    if (to <= index) return false;
    const from = BEATS[index];
    index = to;
    emitter.emit('beat', { from, to: beat });
    return true;
  }

  function noticedWeight() {
    let total = 0;
    for (const weight of noticed.values()) total += weight;
    return total;
  }

  function progress() {
    return Math.min(1, noticedWeight() / connectionThreshold);
  }

  return {
    on: emitter.on,
    get beat() { return BEATS[index]; },
    get noticedIds() { return [...noticed.keys()]; },
    get progress() { return progress(); },

    /** The visitor has begun to explore: Wonder gives way to Curiosity. */
    stir() {
      return BEATS[index] === 'wonder' && advanceTo('curiosity');
    },

    /**
     * A fragment has been noticed. Idempotent per id, order-free. Notices
     * count only during Wonder/Curiosity — once Connection arrives, nothing
     * new is acquired (Reflection absorbs, it doesn't collect).
     */
    notice(id, weight = 1) {
      if (index > BEATS.indexOf('curiosity')) return false;
      if (noticed.has(id)) return false;
      noticed.set(id, weight);
      if (BEATS[index] === 'wonder') advanceTo('curiosity');
      emitter.emit('notice', { id, weight, progress: progress() });
      if (noticedWeight() >= connectionThreshold) advanceTo('connection');
      return true;
    },

    /** Connection has settled; the scene moves into Reflection. */
    settle() {
      return BEATS[index] === 'connection' && advanceTo('reflection');
    },

    /**
     * The visitor pulls back. Allowed from any beat, because every visit —
     * even one cut short — closes with the Return ritual.
     */
    withdraw() {
      return advanceTo('return');
    },
  };
}
