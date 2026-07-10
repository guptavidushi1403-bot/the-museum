/**
 * The generative score — continuous, evolving, never looping.
 *
 * v2 amendment: each world carries its own living music. Not a recorded
 * theme: a slow random walk through one scale — a sub tone breathing at
 * the root, a pad of three voices gliding between chord tones every dozen
 * seconds, a shimmer high above, and rare soft plucks. It never repeats
 * and never resolves; it thins toward near-silence in Reflection and
 * swells once under Connection. Routed through the sound engine's master
 * bus so thin()/hush() carry it too.
 *
 * spec: { root, scale (semitones), brightness 0..1, padLevel, pluckEvery
 *         [min,max] seconds, timbre 'sine'|'triangle' }
 */
export function createScore(sound, spec) {
  const c = sound.context();
  const out = c.createGain();
  out.gain.value = 0;
  out.connect(sound.output);

  const timers = [];
  const voices = [];
  const level = spec.padLevel ?? 0.05;

  function note(semitone, octave = 0) {
    return spec.root * Math.pow(2, (semitone + octave * 12) / 12);
  }
  function ramp(param, value, seconds) {
    const now = c.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(value, now + Math.max(seconds, 0.01));
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* Sub: the root, half-speed, always underneath. */
  const sub = c.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = spec.root / 2;
  const subGain = c.createGain();
  subGain.gain.value = 0.6;
  sub.connect(subGain).connect(out);
  sub.start();
  voices.push(sub);

  /* Pad: three voices wandering the scale. */
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400 + (spec.brightness ?? 0.5) * 1400;
  filter.connect(out);
  const padOscs = [0, 1, 2].map((i) => {
    const osc = c.createOscillator();
    osc.type = spec.timbre ?? 'triangle';
    osc.frequency.value = note(spec.scale[i % spec.scale.length], i === 2 ? 1 : 0);
    osc.detune.value = Math.random() * 7 - 3.5;
    const g = c.createGain();
    g.gain.value = 0.32;
    osc.connect(g).connect(filter);
    osc.start();
    voices.push(osc);
    return osc;
  });

  function wander() {
    // One pad voice at a time drifts to a new chord tone — the walk.
    const osc = pick(padOscs);
    const octave = Math.random() < 0.25 ? 1 : 0;
    const target = note(pick(spec.scale), octave);
    const now = c.currentTime;
    osc.frequency.cancelScheduledValues(now);
    osc.frequency.setValueAtTime(osc.frequency.value, now);
    osc.frequency.linearRampToValueAtTime(target, now + 5 + Math.random() * 5);
    timers.push(setTimeout(wander, 8000 + Math.random() * 9000));
  }

  /* Shimmer: one high whisper, tremolo by slow re-ramping. */
  const shimmer = c.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.value = note(pick(spec.scale), 3);
  const shimmerGain = c.createGain();
  shimmerGain.gain.value = 0.05;
  shimmer.connect(shimmerGain).connect(out);
  shimmer.start();
  voices.push(shimmer);
  function breatheShimmer() {
    ramp(shimmerGain.gain, 0.02 + Math.random() * 0.07, 4 + Math.random() * 4);
    timers.push(setTimeout(breatheShimmer, 9000 + Math.random() * 7000));
  }

  /* Plucks: rare, soft, alone. */
  function pluck() {
    const [lo, hi] = spec.pluckEvery ?? [5, 14];
    const osc = c.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = note(pick(spec.scale), Math.random() < 0.6 ? 1 : 2);
    const g = c.createGain();
    const now = c.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.5, now + 0.35);
    g.gain.linearRampToValueAtTime(0, now + 3.2);
    osc.connect(g).connect(out);
    osc.start(now);
    osc.stop(now + 3.4);
    timers.push(setTimeout(pluck, (lo + Math.random() * (hi - lo)) * 1000));
  }

  let running = false;
  return {
    start(fadeIn = 8) {
      if (running) return;
      running = true;
      ramp(out.gain, level, fadeIn);
      wander();
      breatheShimmer();
      timers.push(setTimeout(pluck, 4000 + Math.random() * 4000));
    },
    /** Connection: the music leans in once, then returns to itself. */
    swell(seconds = 8) {
      ramp(out.gain, level * 1.7, seconds * 0.4);
      timers.push(setTimeout(() => ramp(out.gain, level, seconds * 0.6), seconds * 400));
    },
    /** Reflection: thin toward almost-nothing without stopping. */
    thin(seconds = 6) {
      ramp(out.gain, level * 0.18, seconds);
    },
    restore(seconds = 4) {
      ramp(out.gain, level, seconds);
    },
    stop(seconds = 3) {
      running = false;
      ramp(out.gain, 0, seconds);
      for (const t of timers) clearTimeout(t);
      timers.length = 0;
      setTimeout(() => {
        for (const v of voices) { try { v.stop(); } catch { /* stopped */ } }
        out.disconnect();
      }, seconds * 1000 + 200);
    },
  };
}
