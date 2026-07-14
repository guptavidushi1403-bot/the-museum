/**
 * The museum opens directly into the moving gallery — five real paintings
 * in a drifting hall; each one a window into its world.
 */
import * as THREE from '../vendor/three.module.min.js';
import { createSound } from './core/audio.js';
import { createMemory } from './core/memory.js';
import { createHall } from './gallery/hall.js';
import { runWorld } from './worlds/engine.js';

const WORLDS = {
  'starry-night': () => import('./worlds/starry-night.js'),
  'water-lilies': () => import('./worlds/water-lilies.js'),
  'two-fridas': () => import('./worlds/two-fridas.js'),
  'pearl-earring': () => import('./worlds/pearl-earring.js'),
  'great-wave': () => import('./worlds/great-wave.js'),
};

// A remembered echo of the artist, shown while the world materializes —
// so the passage feels intentional, never a blank load. All verified in
// docs/research/; environmental sense-lines for artists who left no words.
const PASSAGE = {
  'starry-night': '“I go outside at night to paint the stars.” — Vincent van Gogh',
  'water-lilies': '“A refuge of peaceful meditation.” — Claude Monet',
  'two-fridas': '“…an imaginary friendship with a little girl…” — Frida Kahlo, her diary',
  'pearl-earring': 'Johannes Vermeer — a room made entirely of light',
  'great-wave': 'Katsushika Hokusai — under the wave off Kanagawa',
};

async function boot() {
  // Phones get thinner paint and a lower pixel ratio: same museum,
  // smooth on touch devices.
  const mobile = Math.min(innerWidth, innerHeight) < 700 || navigator.maxTouchPoints > 1;
  window.__paintDensity = mobile ? 0.55 : 1;

  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight);

  const sound = createSound();
  sound.unlock();
  const memory = createMemory();

  const overlays = {
    reveal: document.getElementById('reveal'),
    revealText: document.getElementById('reveal-text'),
    revealAttr: document.getElementById('reveal-attr'),
    whole: document.getElementById('whole'),
    frame: document.getElementById('frame'),
    label: document.getElementById('label'),
    whisper: document.getElementById('whisper'),
    veil: document.getElementById('veil'),
    plaque: document.getElementById('plaque'),
    passage: document.getElementById('passage'),
  };

  const ctx = { renderer, sound, memory, overlays };
  let mode = 'hall';
  let activeSlug = null;

  const hall = await createHall(ctx, async (slug) => {
    mode = 'world';
    activeSlug = slug;
    overlays.passage.textContent = PASSAGE[slug] || 'entering the painting…';
    overlays.passage.classList.add('on');   // a cinematic, intentional passage
    const config = (await WORLDS[slug]()).default;
    await runWorld(config, ctx, () => {
      mode = 'hall';
      activeSlug = null;
      hall.resume(slug);
    });
  });

  addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    hall.onResize();
  });

  hall.start();

  // Dev/test shortcut: ?enter=<slug> walks straight through that frame.
  const direct = new URLSearchParams(location.search).get('enter');
  if (direct && WORLDS[direct]) {
    setTimeout(() => hall.debug.select(direct), 1200);
  }

  // Quiet debug/testing surface.
  window.__museum = {
    get mode() { return mode; },
    get slug() { return activeSlug; },
    hall: hall.debug,
    memory,
    sound,
  };
}

boot();
