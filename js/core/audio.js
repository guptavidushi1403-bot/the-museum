/**
 * Web Audio helpers — silence-first.
 *
 * Nothing plays until a scene asks. There is no background score anywhere:
 * scenes build ambient soundscapes (the literal sound of their world) from
 * loaded samples or generated noise beds, and music exists only as holdTone —
 * a single swell that rises and recedes under a real emotional beat, never
 * a theme, never looped. thin()/restore() carry the Reflection beat, where
 * sound falls toward near-silence; hush() fades everything out entirely.
 *
 * The AudioContext is created lazily and browsers keep it suspended until a
 * user gesture — call unlock() once when a scene boots.
 */
export function createSound() {
  let ctx = null;
  let master = null;
  const bufferCache = new Map();

  function context() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
    }
    return ctx;
  }

  function ramp(param, value, seconds) {
    const now = context().currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(value, now + Math.max(seconds, 0.01));
  }

  /** Resume the context on the first user gesture. Safe to call early. */
  function unlock(surface = window) {
    const resume = () => {
      context().resume();
      for (const type of gestures) surface.removeEventListener(type, resume);
    };
    const gestures = ['pointerdown', 'keydown', 'touchend'];
    for (const type of gestures) surface.addEventListener(type, resume, { once: true });
  }

  /** Fetch and decode a sample, cached by URL. */
  async function load(url) {
    if (bufferCache.has(url)) return bufferCache.get(url);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`audio: could not load ${url} (${response.status})`);
    const buffer = await context().decodeAudioData(await response.arrayBuffer());
    bufferCache.set(url, buffer);
    return buffer;
  }

  /** A looping seconds-long noise buffer: 'white', 'pink' or 'brown'. */
  function noiseBuffer(color = 'pink', seconds = 4) {
    const c = context();
    const length = Math.floor(c.sampleRate * seconds);
    const buffer = c.createBuffer(1, length, c.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      if (color === 'white') {
        data[i] = white;
      } else if (color === 'brown') {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else {
        // Pink (Paul Kellet's economy filter) — closest to wind, water, air.
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.11;
      }
    }
    return buffer;
  }

  /**
   * Start a looping ambient layer that fades in from silence. Returns a
   * handle to reshape or end it. Optional filter: { type, frequency, Q }.
   */
  function ambient(buffer, { level = 0.5, fadeIn = 4, loop = true, filter = null } = {}) {
    const c = context();
    const gain = c.createGain();
    gain.gain.value = 0;
    gain.connect(master);

    let tail = gain;
    if (filter) {
      const node = c.createBiquadFilter();
      node.type = filter.type ?? 'lowpass';
      if (filter.frequency !== undefined) node.frequency.value = filter.frequency;
      if (filter.Q !== undefined) node.Q.value = filter.Q;
      node.connect(gain);
      tail = node;
    }

    const source = c.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(tail);
    source.start();
    ramp(gain.gain, level, fadeIn);

    return {
      set(value, seconds = 2) { ramp(gain.gain, value, seconds); },
      stop(seconds = 3) {
        ramp(gain.gain, 0, seconds);
        source.stop(c.currentTime + seconds + 0.1);
      },
    };
  }

  /** Ambient noise bed in one call — wind, water, air. */
  function noise({ color = 'pink', seconds = 4, ...options } = {}) {
    return ambient(noiseBuffer(color, seconds), options);
  }

  /**
   * A sustained tonal bed for attention-responsive ambience — world sound,
   * not music: held partials only, never a phrase or theme. Starts silent;
   * the scene drives its level (usually from attention) and must let it
   * fall back to silence when attention leaves. Never leave one audible
   * unattended — that would be a background score.
   */
  function drone({ frequencies = [220], type = 'sine', spread = 3 } = {}) {
    const c = context();
    const gain = c.createGain();
    gain.gain.value = 0;
    gain.connect(master);
    const oscillators = frequencies.map((frequency) => {
      const osc = c.createOscillator();
      osc.type = type;
      osc.frequency.value = frequency;
      osc.detune.value = Math.random() * spread * 2 - spread;
      osc.connect(gain);
      osc.start();
      return osc;
    });
    return {
      set(level, seconds = 0.5) { ramp(gain.gain, level, seconds); },
      stop(seconds = 2) {
        ramp(gain.gain, 0, seconds);
        const at = c.currentTime + seconds + 0.1;
        for (const osc of oscillators) osc.stop(at);
      },
    };
  }

  /**
   * A single held tone or chord that swells and recedes — the only musical
   * gesture in the museum. Cleans itself up; cannot loop.
   */
  function holdTone({
    frequencies = [110, 165],
    peak = 0.06,
    attack = 5,
    hold = 2,
    release = 7,
    type = 'sine',
  } = {}) {
    const c = context();
    const now = c.currentTime;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + attack);
    gain.gain.setValueAtTime(peak, now + attack + hold);
    gain.gain.linearRampToValueAtTime(0, now + attack + hold + release);
    gain.connect(master);

    const stopAt = now + attack + hold + release + 0.1;
    for (const frequency of frequencies) {
      const osc = c.createOscillator();
      osc.type = type;
      osc.frequency.value = frequency;
      osc.detune.value = Math.random() * 6 - 3; // a breath of imperfection
      osc.connect(gain);
      osc.start(now);
      osc.stop(stopAt);
    }
    setTimeout(() => gain.disconnect(), (stopAt - now) * 1000 + 100);
  }

  /** Reflection: everything falls toward near-silence. */
  function thin(level = 0.05, seconds = 6) {
    context();
    ramp(master.gain, level, seconds);
  }

  /** Bring the world's sound back after thinning. */
  function restore(seconds = 3) {
    context();
    ramp(master.gain, 1, seconds);
  }

  /** Fade everything out entirely. */
  function hush(seconds = 4) {
    context();
    ramp(master.gain, 0, seconds);
  }

  return {
    get state() { return ctx ? ctx.state : 'silent'; },
    /** The master bus — so companion engines (the score) ride thin/hush. */
    get output() { context(); return master; },
    context,
    unlock,
    load,
    ambient,
    noise,
    noiseBuffer,
    drone,
    holdTone,
    thin,
    restore,
    hush,
  };
}
