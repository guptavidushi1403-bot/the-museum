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

async function boot() {
  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
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
  };

  const ctx = { renderer, sound, memory, overlays };
  let mode = 'hall';
  let activeSlug = null;

  const hall = await createHall(ctx, async (slug) => {
    mode = 'world';
    activeSlug = slug;
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
