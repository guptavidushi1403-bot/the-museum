/**
 * The hall — a moving gallery in the dark.
 *
 * The museum opens on the five real paintings, framed and floating in a
 * deep space of drifting dust, warm lamplight, and fog. The camera never
 * rests: it wanders the hall slowly, leaning toward wherever the visitor
 * looks. A painting under attention warms and its title surfaces; a click
 * carries the camera through the frame into its world. Returning visitors
 * find a small ember on the frames of worlds they've been inside.
 *
 * Frame textures are the paintings themselves: the real image if
 * assets/art/<slug>/painting.jpg exists, otherwise the scene's own
 * whole-composition rendering.
 */
import * as THREE from '../../vendor/three.module.min.js';
import { createStrokeField, createGlow } from '../worlds/strokes.js';
import { mulberry32 } from '../paintings/helpers.js';

const SLUGS = ['starry-night', 'water-lilies', 'two-fridas', 'pearl-earring', 'great-wave'];

export async function createHall(ctx, onSelect) {
  const { renderer, sound, memory, overlays } = ctx;
  const { whisper, veil } = overlays;
  const rnd = mulberry32(5);

  const scenes2d = {};
  for (const slug of SLUGS) {
    scenes2d[slug] = (await import(`../paintings/${slug}/scene.js`)).default;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02030a);
  // Fog only touches the near dust and frames; the cosmos lives beyond it.
  scene.fog = new THREE.Fog(0x02030a, 18, 60);

  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 900);

  // ---- the universe the museum floats in ----
  const cosmos = [];

  // Deep starfield on a far shell, barely turning.
  cosmos.push(createStrokeField({
    count: 2600,
    home: (i, r) => {
      const a = r() * Math.PI * 2, el = Math.acos(r() * 2 - 1), R = 180 + r() * 260;
      return [Math.sin(el) * Math.cos(a) * R, Math.cos(el) * R, Math.sin(el) * Math.sin(a) * R];
    },
    color: (i, r) => {
      const p = r();
      if (p < 0.15) return [0.7, 0.8, 1.0];   // blue-white giants
      if (p < 0.28) return [1.0, 0.85, 0.6];  // warm stars
      const v = 0.7 + r() * 0.3;
      return [v, v, v];
    },
    size: [0.6, 2.6],
    orbit: { radius: [0.02, 0.1], speed: [0.005, 0.02] },
    opacity: 0.9,
  }, rnd));

  // A handful of distant nebulae — soft clouds of colored light, built
  // entirely from (unfogged) strokes: a wide veil plus a bright core.
  const NEBULAE = [
    { pos: [-150, 55, -200], color: [0.55, 0.32, 0.8], size: 120 },
    { pos: [190, -30, -230], color: [0.25, 0.55, 0.75], size: 150 },
    { pos: [50, 110, -250], color: [0.85, 0.4, 0.45], size: 130 },
    { pos: [-210, -70, -120], color: [0.35, 0.5, 0.85], size: 110 },
  ];
  for (const n of NEBULAE) {
    // the veil
    cosmos.push(createStrokeField({
      count: 1100, origin: n.pos,
      home: (i, r) => {
        const a = r() * Math.PI * 2, rr = Math.pow(r(), 0.5) * n.size;
        return [Math.cos(a) * rr, (r() - 0.5) * n.size * 0.5, Math.sin(a) * rr * 0.7];
      },
      color: (i, r) => n.color.map((c) => Math.min(1, c * (0.6 + r() * 0.8))),
      size: [10, 30],
      orbit: { radius: [1, 5], speed: [0.01, 0.04] },
      opacity: 0.14,
    }, rnd));
    // the glowing core
    cosmos.push(createStrokeField({
      count: 500, origin: n.pos,
      home: (i, r) => {
        const a = r() * Math.PI * 2, rr = Math.pow(r(), 0.8) * n.size * 0.35;
        return [Math.cos(a) * rr, (r() - 0.5) * n.size * 0.2, Math.sin(a) * rr];
      },
      color: (i, r) => n.color.map((c) => Math.min(1, c * 1.5 * (0.7 + r() * 0.6))),
      size: [14, 40],
      orbit: { radius: [0.5, 2], speed: [0.02, 0.06] },
      opacity: 0.16,
    }, rnd));
  }

  // Two spiral galaxies, slowly turning, seen at an angle — bright cores.
  for (const g of [
    { pos: [-90, 85, -170], tilt: 0.5, spin: 0.03, hue: [0.7, 0.78, 1.0] },
    { pos: [175, -60, -150], tilt: -0.8, spin: -0.025, hue: [1.0, 0.88, 0.7] },
  ]) {
    const arms = createStrokeField({
      count: 1400,
      home: (i, r) => {
        const t = Math.pow(r(), 0.5);
        const arm = (i % 2) * Math.PI;
        const a = arm + t * 5.5 + (r() - 0.5) * 0.5;
        const rr = t * 55 + 4;
        return [Math.cos(a) * rr, (r() - 0.5) * 3 * (1 - t), Math.sin(a) * rr];
      },
      color: (i, r) => g.hue.map((c) => Math.min(1, c * (0.5 + r() * 0.8))),
      size: [1.6, 5],
      orbit: { radius: [0.1, 0.6], speed: [0.02, 0.06] },
      opacity: 0.5,
    }, rnd);
    arms.points.position.set(...g.pos);
    arms.points.rotation.x = g.tilt;
    arms.galaxySpin = g.spin;
    cosmos.push(arms);
    // bright galactic core, from strokes (unfogged)
    const coreField = createStrokeField({
      count: 300, origin: g.pos,
      home: (i, r) => {
        const a = r() * Math.PI * 2, rr = Math.pow(r(), 1.2) * 10;
        return [Math.cos(a) * rr, (r() - 0.5) * 2, Math.sin(a) * rr];
      },
      color: () => [1.0, 0.95, 0.8],
      size: [6, 18],
      orbit: { radius: [0.2, 1], speed: [0.03, 0.08] },
      opacity: 0.3,
    }, rnd);
    cosmos.push(coreField);
  }

  for (const c of cosmos) scene.add(c.points);

  // Near dust, close to the frames, catching their light.
  const dust = createStrokeField({
    count: 900,
    home: (i, r) => [(r() - 0.5) * 30, r() * 9 - 1, (r() - 0.5) * 30],
    color: (i, r) => (r() < 0.8 ? [0.55, 0.55, 0.6] : [0.8, 0.7, 0.45]),
    size: [0.15, 0.5],
    orbit: { radius: [0.2, 0.9], speed: [0.03, 0.12] },
    opacity: 0.35,
  }, rnd);
  scene.add(dust.points);

  /* ----- the five windows ----- */
  const frames = [];
  const loader = new THREE.TextureLoader();

  async function paintingTexture(slug) {
    const s2d = scenes2d[slug];
    const real = await fetch(`assets/art/${slug}/painting.jpg`, { method: 'HEAD' })
      .then((r) => r.ok).catch(() => false);
    if (real) {
      return new Promise((resolve) => {
        loader.load(`assets/art/${slug}/painting.jpg`, (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          resolve(t);
        }, undefined, () => resolve(null));
      });
    }
    const canvas = document.createElement('canvas');
    const w = 768;
    canvas.width = w;
    canvas.height = Math.round(w / s2d.aspect);
    s2d.drawWhole(canvas.getContext('2d'), canvas.width, canvas.height, 0.7);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const arcSpread = 116; // degrees of hall the paintings occupy
  for (let i = 0; i < SLUGS.length; i++) {
    const slug = SLUGS[i];
    const s2d = scenes2d[slug];
    const angle = ((-arcSpread / 2 + (i * arcSpread) / (SLUGS.length - 1)) * Math.PI) / 180;
    const radius = 10.5;
    const pos = new THREE.Vector3(Math.sin(angle) * radius, 1.7, -Math.cos(angle) * radius);

    const h = Math.min(3.0, 5.6 / s2d.aspect);
    const w = h * s2d.aspect;

    const group = new THREE.Group();
    group.position.copy(pos);
    group.lookAt(0, 1.7, 0);

    const texture = await paintingTexture(slug);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
    );
    plane.userData.slug = slug;
    group.add(plane);

    // The frame: four bars of dim gold.
    const bar = new THREE.MeshBasicMaterial({ color: 0x8a713d });
    const t = 0.09, d = 0.06;
    for (const [bw, bh, bx, by] of [
      [w + t * 2, t, 0, h / 2 + t / 2],
      [w + t * 2, t, 0, -h / 2 - t / 2],
      [t, h, -w / 2 - t / 2, 0],
      [t, h, w / 2 + t / 2, 0],
    ]) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, d), bar);
      mesh.position.set(bx, by, -0.01);
      group.add(mesh);
    }

    const halo = createGlow(0xf4dfae, Math.max(w, h) * 2.1, 0.1);
    halo.position.set(0, 0, -0.4);
    group.add(halo);

    const ember = createGlow(0xffb45e, 0.5, 0);
    ember.position.set(w / 2 - 0.12, -h / 2 + 0.12, 0.06);
    group.add(ember);

    scene.add(group);
    frames.push({ slug, s2d, group, plane, halo, ember, pos, w, h, warmth: 0 });
  }

  function refreshEmbers() {
    for (const f of frames) {
      f.ember.material.opacity = memory.hasReturned(f.slug) ? 0.65 : 0;
    }
  }
  refreshEmbers();

  /* ----- wandering camera, hover, click ----- */
  const pointer = { x: 0, y: 0 };
  const raycaster = new THREE.Raycaster();
  let hovered = null;
  let mode = 'wander'; // wander | flying
  let flyTarget = null;
  let flySlug = null;
  let clock = 0;
  let last = performance.now();
  let running = false;

  function onMove(e) {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
  }

  function onClick() {
    if (mode !== 'wander' || !hovered) return;
    mode = 'flying';
    flySlug = hovered.slug;
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(hovered.group.quaternion);
    flyTarget = hovered.pos.clone().add(fwd.multiplyScalar(1.15));
    whisper.classList.remove('awake');
    setTimeout(() => {
      veil.classList.add('dark');
      setTimeout(() => {
        stop();
        onSelect(flySlug);
      }, 1300);
    }, 1500);
  }

  addEventListener('pointermove', onMove);
  addEventListener('click', onClick);

  function animate(now) {
    if (!running) return;
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
    last = now;
    clock += dt;

    if (mode === 'wander') {
      // The hall drifts: a slow figure through the room, never still.
      camera.position.x += (Math.sin(clock * 0.05) * 2.6 - camera.position.x) * dt * 0.5;
      camera.position.y += (1.7 + Math.sin(clock * 0.083) * 0.35 - camera.position.y) * dt * 0.5;
      camera.position.z += (2.6 + Math.cos(clock * 0.041) * 1.8 - camera.position.z) * dt * 0.5;
      camera.lookAt(pointer.x * 5.5, 1.7 - pointer.y * 2.4, -9);
    } else if (flyTarget) {
      camera.position.lerp(flyTarget, 1 - Math.exp(-dt * 1.7));
      const f = frames.find((x) => x.slug === flySlug);
      camera.lookAt(f.pos);
    }

    // Hover: the painting that holds the gaze warms and names itself.
    if (mode === 'wander') {
      raycaster.setFromCamera(new THREE.Vector2(pointer.x, -pointer.y), camera);
      const hits = raycaster.intersectObjects(frames.map((f) => f.plane));
      const hit = hits.length ? frames.find((f) => f.plane === hits[0].object) : null;
      if (hit !== hovered) {
        hovered = hit;
        renderer.domElement.style.cursor = hovered ? 'pointer' : 'default';
        if (hovered) {
          whisper.textContent = hovered.s2d.title.toLowerCase();
          whisper.classList.add('awake');
        } else {
          whisper.classList.remove('awake');
        }
      }
    }
    for (const f of frames) {
      const target = f === hovered ? 1 : 0;
      f.warmth += (target - f.warmth) * dt * 3;
      f.halo.material.opacity = 0.10 + f.warmth * 0.3;
      const s = 1 + f.warmth * 0.025;
      f.group.scale.set(s, s, s);
    }

    dust.update(clock, 1);
    for (const c of cosmos) {
      c.update(clock, 1);
      if (c.galaxySpin) c.points.rotation.z = clock * c.galaxySpin;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(animate);
    requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.remove('dark')));
  }

  function stop() {
    running = false;
  }

  function resume(slug) {
    // Home base: the visitor lands back before the painting they entered.
    refreshEmbers();
    mode = 'wander';
    hovered = null;
    const f = frames.find((x) => x.slug === slug);
    if (f) {
      const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(f.group.quaternion);
      camera.position.copy(f.pos.clone().add(fwd.multiplyScalar(4.2)));
      camera.lookAt(f.pos);
    }
    start();
  }

  return {
    start,
    stop,
    resume,
    onResize() { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); },
    // Quiet debug/testing surface.
    debug: {
      frames: () => frames.map((f) => ({ slug: f.slug })),
      get mode() { return mode; },
      select(slug) { hovered = frames.find((f) => f.slug === slug); onClick(); },
    },
  };
}
