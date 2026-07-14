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
  // A grand, calm exhibition hall: warm charcoal depths, not outer space.
  scene.background = new THREE.Color(0x0b0b0f);
  scene.fog = new THREE.Fog(0x0b0b0f, 16, 52);

  const portrait = innerWidth < innerHeight;
  const camera = new THREE.PerspectiveCamera(portrait ? 66 : 55, innerWidth / innerHeight, 0.1, 200);

  // Palette per painting — the light each frame casts, and the brushstrokes
  // that escape it. Authentic to each artwork, never generic.
  const PALETTE = {
    'starry-night': { glow: 0x3b5bd0, strokes: [[0.96, 0.82, 0.4], [0.32, 0.45, 0.9], [0.85, 0.9, 1.0]] },
    'water-lilies': { glow: 0x49a08e, strokes: [[0.35, 0.68, 0.6], [0.98, 0.72, 0.8], [0.98, 0.93, 0.6]] },
    'two-fridas': { glow: 0xc23048, strokes: [[0.82, 0.16, 0.24], [0.16, 0.5, 0.44], [0.9, 0.86, 0.78]] },
    'pearl-earring': { glow: 0xcaa15e, strokes: [[0.86, 0.66, 0.34], [0.2, 0.34, 0.72], [0.92, 0.9, 0.84]] },
    'great-wave': { glow: 0x2f5aa0, strokes: [[0.1, 0.26, 0.55], [0.86, 0.93, 0.98], [0.82, 0.78, 0.64]] },
  };

  // ---- the exhibition hall the paintings hang in ----
  const ambient = [];   // updatable fields
  const beams = [];      // per-frame volumetric spotlights

  // A soft vertical light beam (volumetric spotlight) as a sprite texture.
  function beamTexture() {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, 'rgba(255,255,255,0.55)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    for (let x = 0; x < 64; x++) {
      const edge = 1 - Math.abs(x - 32) / 32;
      g.globalAlpha = Math.pow(edge, 1.4);
      g.fillStyle = grad;
      g.fillRect(x, 0, 1, 256);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  const BEAM_TEX = beamTexture();

  // Reflective black floor: a broad dark plane with a soft central sheen.
  {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const g = c.getContext('2d');
    g.fillStyle = '#070708';
    g.fillRect(0, 0, 512, 512);
    const grad = g.createRadialGradient(256, 180, 20, 256, 256, 300);
    grad.addColorStop(0, 'rgba(60,62,74,0.5)');
    grad.addColorStop(1, 'rgba(7,7,8,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    const floorTex = new THREE.CanvasTexture(c);
    floorTex.colorSpace = THREE.SRGBColorSpace;
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshBasicMaterial({ map: floorTex, transparent: true, opacity: 0.9 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.4;
    scene.add(floor);
  }

  // A high, soft volumetric wash of light — the museum's calm ceiling glow.
  const ceiling = createGlow(0xdfe4f0, 46, 0.06);
  ceiling.position.set(0, 15, -8);
  scene.add(ceiling);
  // A distant back wall, giving the room architectural depth.
  {
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 44),
      new THREE.MeshBasicMaterial({ color: 0x111117, transparent: true, opacity: 0.85 }),
    );
    wall.position.set(0, 6, -26);
    scene.add(wall);
  }

  // Gentle museum air: soft motes drifting in the light.
  const dust = createStrokeField({
    count: 520,
    home: (i, r) => [(r() - 0.5) * 34, r() * 12 - 1.5, (r() - 0.5) * 24 - 4],
    color: (i, r) => (r() < 0.8 ? [0.6, 0.6, 0.66] : [0.85, 0.75, 0.5]),
    size: [0.12, 0.4], aspect: [1, 1.6],
    orbit: { radius: [0.15, 0.7], speed: [0.02, 0.08] },
    opacity: 0.3,
  }, rnd);
  ambient.push(dust);
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

    const pal = PALETTE[slug] || { glow: 0xf4dfae, strokes: [[0.9, 0.8, 0.5]] };

    // The frame's own light, in the painting's colour.
    const halo = createGlow(pal.glow, Math.max(w, h) * 2.0, 0.08);
    halo.position.set(0, 0, -0.4);
    group.add(halo);

    // A soft spotlight beam falling on the canvas from above.
    const beam = new THREE.Sprite(new THREE.SpriteMaterial({
      map: BEAM_TEX, color: 0xf3ecdd, transparent: true, opacity: 0.14,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    beam.scale.set(w * 1.5, h * 2.6, 1);
    beam.position.set(pos.x, pos.y + h * 1.4, pos.z);
    scene.add(beam);
    beams.push({ beam, base: 0.14 });

    // A faint reflection of the canvas on the glossy floor.
    const refl = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.1, depthWrite: false, toneMapped: false }),
    );
    refl.position.set(pos.x, -1.4 - (pos.y + 1.4), pos.z);
    refl.quaternion.copy(group.quaternion);
    refl.scale.y = -1;
    scene.add(refl);

    // Brushstrokes that escape the frame — the painting is already alive.
    const escape = createStrokeField({
      count: 90,
      home: (i, r) => [(r() - 0.5) * w * 1.15, (r() - 0.5) * h * 1.15, 0.1 + r() * 0.5],
      color: (i, r) => pal.strokes[Math.floor(r() * pal.strokes.length)],
      size: [0.5, 1.3], aspect: [2.4, 3.8], angle: (i, rnd) => rnd() * Math.PI * 2,
      orbit: { radius: [0.15, 0.5], speed: [0.08, 0.22] },
      opacity: 0,
    }, rnd);
    group.add(escape.points);

    const ember = createGlow(0xffb45e, 0.5, 0);
    ember.position.set(w / 2 - 0.12, -h / 2 + 0.12, 0.06);
    group.add(ember);

    scene.add(group);
    frames.push({ slug, s2d, group, plane, halo, beam, escape, ember, pos, w, h, warmth: 0, pal });
  }

  function refreshEmbers() {
    for (const f of frames) {
      f.visited = memory.hasReturned(f.slug);
      f.ember.material.opacity = f.visited ? 0.65 : 0;
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
  let flyGroup = null;
  let burst = null;       // swirling paint you are pulled through
  let burstStart = 0;

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
  let clock = 0;
  let last = performance.now();
  let running = false;

  function onMove(e) {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
  }

  // The luminous tone of each painting's paint — what you dissolve through
  // when the frame becomes the world. No hard black cut.
  const ENTRY_TINT = {
    'starry-night': '#26397f',
    'water-lilies': '#3f8f83',
    'two-fridas': '#33474a',
    'pearl-earring': '#4a3620',
    'great-wave': '#284a86',
  };

  function onClick() {
    if (mode !== 'wander' || !hovered) return;
    mode = 'flying';
    flySlug = hovered.slug;
    flyGroup = hovered.group;
    // fly right up to the surface of the canvas
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(hovered.group.quaternion);
    flyTarget = hovered.pos.clone().add(fwd.multiplyScalar(0.3));
    whisper.classList.remove('awake');

    // the canvas comes alive: a swirl of its own paint streams toward you,
    // so you feel pulled through the surface rather than cut to a new scene
    const tint = ENTRY_TINT[flySlug] || '#3a4a7a';
    const [br, bg, bb] = hexToRgb(tint);
    burst = createStrokeField({
      count: 520,
      home: (i, r) => {
        const a = r() * Math.PI * 2, rr = Math.pow(r(), 0.6) * 3.2;
        return [Math.cos(a) * rr, Math.sin(a) * rr, r() * 7];  // a cone toward the viewer
      },
      color: (i, r) => (r() < 0.28
        ? [1.0, 0.92, 0.6]
        : [Math.min(1, br * 1.8 + 0.1), Math.min(1, bg * 1.8 + 0.1), Math.min(1, bb * 1.8 + 0.2)]),
      size: [1.0, 2.6], aspect: [2.6, 4.4], angle: 'swirl',
      orbit: { radius: [0.3, 1.2], speed: [0.4, 1.0] },
      opacity: 0.0,
    }, rnd);
    burst.points.position.copy(hovered.pos);
    burst.points.quaternion.copy(hovered.group.quaternion);
    scene.add(burst.points);
    burstStart = clock;

    // dissolve through the paint: fade the screen to the painting's own tone
    veil.style.background = tint;
    setTimeout(() => {
      veil.classList.add('dark');
      setTimeout(() => {
        clearBurst();
        stop();
        onSelect(flySlug);
      }, 1100);
    }, 1500);
  }

  function clearBurst() {
    if (burst) { scene.remove(burst.points); burst.dispose(); burst = null; }
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
      camera.position.lerp(flyTarget, 1 - Math.exp(-dt * 2.0));
      const f = frames.find((x) => x.slug === flySlug);
      camera.lookAt(f.pos);
      // the canvas grows to fill the view — you're passing into it
      if (flyGroup) {
        const s = flyGroup.scale.x + (3.4 - flyGroup.scale.x) * (1 - Math.exp(-dt * 1.7));
        flyGroup.scale.setScalar(s);
      }
      // the paint swirls up and streams toward you
      if (burst) {
        const age = clock - burstStart;
        burst.update(clock, 3);
        burst.setOpacity(Math.min(0.7, age * 1.2) * Math.max(0, 1 - age * 0.45));
        burst.points.scale.setScalar(1 + age * 2.8);
        burst.points.rotation.z = age * 2.2;
      }
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
      // a visited painting keeps a soft living aura — it remembers the visitor
      const visitAura = f.visited ? 0.12 : 0;
      f.halo.material.opacity = 0.08 + f.warmth * 0.34 + visitAura;
      f.beam.material.opacity = 0.14 + f.warmth * 0.22;
      // brushstrokes always drift faintly; more escape when the gaze rests,
      // and they surge as the visitor is pulled through the canvas
      const surge = (mode === 'flying' && f.slug === flySlug) ? 0.85 : 0;
      f.escape.setOpacity(Math.min(1, 0.12 + visitAura + f.warmth * 0.5 + surge));
      f.escape.update(clock, 1);
      const s = 1 + f.warmth * 0.03;
      f.group.scale.set(s, s, s);
    }

    for (const a of ambient) a.update(clock, 1);
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
    flyTarget = null;
    clearBurst();
    if (flyGroup) { flyGroup.scale.setScalar(1); flyGroup = null; }  // un-zoom the frame
    veil.style.background = '';  // back to the neutral dark for gallery transitions
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
