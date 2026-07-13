/**
 * The world engine — walking inside a painting.
 *
 * A world is an enveloping space of stroke fields. The camera never
 * stops: it drifts on a slow orbit through the paint, leaning where the
 * pointer looks. Clicking a glowing beacon glides you to it; clicking
 * open paint eases you toward that side of the world. Discovery is still
 * arrival: coming near a node notices it (order-free) and its words
 * surface. The five-beat arc is unchanged — Wonder, Curiosity,
 * Connection (score swells once), Reflection (everything slows and
 * thins, never stops), Return (the world recedes into the whole framed
 * painting; you stand before it; the gallery takes you back).
 *
 * config: { slug, background, fog:[color,near,far], camera:{radius,
 *   height, speed, bob}, strokes:[spec...], nodes:[{id,pos,color,r?}],
 *   glows:[{pos,color,size,opacity}], music: score spec }
 * Text, tones, ambient sound and the whole-composition rendering come
 * from the painting's 2D scene module (js/paintings/<slug>/scene.js) —
 * one source of research-cleared truth.
 */
import * as THREE from '../../vendor/three.module.min.js';
import { createArc } from '../core/arc.js';
import { createScore } from '../core/score.js';
import { createStrokeField, createGlow } from './strokes.js';
import { mulberry32 } from '../paintings/helpers.js';

const T = (ms) => ms / (window.__museumTempo || 1);

export async function runWorld(config, ctx, onClose) {
  const { renderer, sound, memory, overlays } = ctx;
  const scene2d = (await import(`../paintings/${config.slug}/scene.js`)).default;
  const rnd = mulberry32(config.seed ?? 7);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.background);
  if (config.fog) scene.fog = new THREE.Fog(...config.fog);

  const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 220);

  const fields = config.strokes.map((spec) => {
    const field = createStrokeField(spec, rnd);
    scene.add(field.points);
    return field;
  });
  const fieldByName = new Map(fields.filter((f) => f.name).map((f) => [f.name, f.points]));
  const tickApi = { scene, field: (name) => fieldByName.get(name) };

  for (const g of config.glows ?? []) {
    const glow = createGlow(g.color, g.size, g.opacity ?? 0.5);
    glow.position.set(...g.pos);
    scene.add(glow);
  }

  /* ----- discovery nodes ----- */
  const revealById = new Map(scene2d.nodes.map((n) => [n.id, n.reveal]));
  const nodes = config.nodes.map((n) => {
    const beacon = createGlow(n.color, n.size ?? 1.6, 0.5);
    beacon.position.set(...n.pos);
    scene.add(beacon);
    return { ...n, beacon, vec: new THREE.Vector3(...n.pos), nearSince: null, noticed: false };
  });

  const arc = createArc({ connectionThreshold: scene2d.connectionThreshold ?? 3 });
  const score = createScore(sound, config.music);
  let airs = null;
  const timers = [setTimeout(() => {
    airs = scene2d.ambient?.(sound) ?? null;
    score.start(10);
  }, T(1200))];

  /* ----- overlays (shared DOM, reused across worlds) ----- */
  const { reveal, revealText, revealAttr, whole, frame, label, veil } = overlays;
  const revealQueue = [];
  let revealBusy = false;
  function showReveal(r) {
    if (!r) return;
    revealQueue.push(r);
    pumpReveals();
  }
  function pumpReveals() {
    if (revealBusy || !revealQueue.length || returning) return;
    revealBusy = true;
    const r = revealQueue.shift();
    revealText.textContent = r.text;
    revealText.classList.toggle('sense', r.kind === 'sense');
    revealAttr.textContent = r.attribution ?? '';
    reveal.classList.add('on');
    timers.push(setTimeout(() => {
      reveal.classList.remove('on');
      timers.push(setTimeout(() => { revealBusy = false; pumpReveals(); }, T(2200)));
    }, T(r.kind === 'quote' ? 9000 : 7000)));
  }

  /* ----- the drifting camera ----- */
  const cam = {
    angle: rnd() * Math.PI * 2,
    radius: config.camera.radius * 1.8,   // start further out, then dolly in
    height: config.camera.height,
    targetRadius: config.camera.radius,   // ...through the surface of the canvas
    targetHeight: config.camera.height,
    targetAngle: null, // set while gliding
    speed: config.camera.speed,
  };
  const pointer = { x: 0, y: 0 };
  const lookHeight = config.camera.lookHeight ?? config.camera.height * 0.6;
  const look = new THREE.Vector3(0, lookHeight, 0);

  function onMove(e) {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
  }

  const raycaster = new THREE.Raycaster();
  function onClick(e) {
    if (returning) return;
    raycaster.setFromCamera(new THREE.Vector2(
      (e.clientX / innerWidth) * 2 - 1,
      -(e.clientY / innerHeight) * 2 + 1), camera);
    let best = null;
    for (const n of nodes) {
      const hit = raycaster.ray.distanceToPoint(n.vec);
      if (hit < (n.size ?? 1.6) * 1.6 && (!best || hit < best.d)) best = { n, d: hit };
    }
    if (best) {
      glideTo(best.n.id);
    } else {
      // Open paint: drift toward the clicked side of the world.
      cam.angle -= pointer.x * 0.5;
      cam.targetRadius = Math.max(config.camera.radius * 0.55,
        cam.targetRadius * (pointer.y > 0 ? 1.06 : 0.9));
    }
    arc.stir();
  }

  function glideTo(id) {
    const n = nodes.find((x) => x.id === id);
    if (!n) return;
    cam.targetAngle = Math.atan2(n.vec.z, n.vec.x);
    cam.targetRadius = Math.max(2.2, n.vec.length() * 0.55);
    cam.targetHeight = n.vec.y * 0.7 + config.camera.height * 0.3;
    look.copy(n.vec);
  }

  addEventListener('pointermove', onMove);
  addEventListener('click', onClick);
  function onKey(e) { if (e.key === 'Escape') arc.withdraw(); }
  addEventListener('keydown', onKey);
  function onResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', onResize);

  /* ----- beats ----- */
  let tempo = 1;
  let tempoTarget = 1;
  arc.on('beat', ({ to }) => {
    if (to === 'connection') {
      score.swell(T(9000) / 1000);
      sound.holdTone({
        frequencies: scene2d.connectionTone,
        peak: 0.05, attack: T(3000) / 1000, hold: T(900) / 1000, release: T(5500) / 1000,
      });
      for (const n of nodes) n.beacon.material.opacity = 0.75;
      timers.push(setTimeout(() => arc.settle(), T(9500)));
    }
    if (to === 'reflection') {
      tempoTarget = 0.22;
      score.thin(T(6500) / 1000);
      sound.thin(0.3, T(6500) / 1000);
      timers.push(setTimeout(() => arc.withdraw(), T(12000)));
    }
    if (to === 'return') beginReturn();
  });

  /* ----- the Return ritual ----- */
  let returning = false;
  let paintingImg = null;
  fetch(`assets/art/${config.slug}/painting.jpg`, { method: 'HEAD' })
    .then((r) => {
      if (!r.ok) return;
      const img = new Image();
      img.onload = () => { paintingImg = img; };
      img.src = `assets/art/${config.slug}/painting.jpg`;
    })
    .catch(() => {});

  let wholeRaf = null;
  function beginReturn() {
    if (returning) return;
    returning = true;
    reveal.classList.remove('on');
    revealQueue.length = 0;
    airs?.stop?.(T(6000) / 1000);
    score.stop(T(8000) / 1000);
    tempoTarget = 0.1;
    cam.targetRadius = config.camera.radius * 1.9; // pull back out of the paint

    const maxW = innerWidth * 0.6, maxH = innerHeight * 0.62;
    let fw = maxW, fh = fw / scene2d.aspect;
    if (fh > maxH) { fh = maxH; fw = fh * scene2d.aspect; }
    const fx = (innerWidth - fw) / 2;
    const fy = (innerHeight - fh) / 2 - innerHeight * 0.03;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    whole.width = fw * dpr;
    whole.height = fh * dpr;
    Object.assign(whole.style, { left: `${fx}px`, top: `${fy}px`, width: `${fw}px`, height: `${fh}px` });
    Object.assign(frame.style, { left: `${fx - 14}px`, top: `${fy - 14}px`, width: `${fw + 28}px`, height: `${fh + 28}px` });
    Object.assign(label.style, { left: `${fx}px`, top: `${fy + fh + 30}px`, width: `${fw}px` });
    label.innerHTML = '';
    const t1 = document.createElement('div');
    t1.className = 'exp-label-title';
    t1.textContent = scene2d.title;
    const t2 = document.createElement('div');
    t2.className = 'exp-label-artist';
    t2.textContent = `${scene2d.artist}, ${scene2d.year}`;
    label.append(t1, t2);

    const wctx = whole.getContext('2d');
    wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    function drawWholeFrame(now) {
      if (paintingImg) {
        const s = Math.max(fw / paintingImg.width, fh / paintingImg.height);
        const iw = paintingImg.width * s, ih = paintingImg.height * s;
        wctx.drawImage(paintingImg, (fw - iw) / 2, (fh - ih) / 2, iw, ih);
      } else {
        scene2d.drawWhole(wctx, fw, fh, now / 1000);
      }
      wholeRaf = requestAnimationFrame(drawWholeFrame);
    }
    wholeRaf = requestAnimationFrame(drawWholeFrame);

    timers.push(setTimeout(() => { frame.classList.add('on'); whole.classList.add('on'); }, T(1600)));
    timers.push(setTimeout(() => label.classList.add('on'), T(3800)));
    memory.rememberReturn(config.slug);
    timers.push(setTimeout(() => {
      veil.style.background = '';   // fade the world out to neutral dark for the gallery
      veil.classList.add('dark');
      timers.push(setTimeout(teardown, T(2600)));
    }, T(11500)));
  }

  function teardown() {
    running = false;
    if (wholeRaf) cancelAnimationFrame(wholeRaf);
    for (const t of timers) clearTimeout(t);
    removeEventListener('pointermove', onMove);
    removeEventListener('click', onClick);
    removeEventListener('keydown', onKey);
    removeEventListener('resize', onResize);
    airs?.stop?.(0.5);
    sound.restore(2);
    for (const f of fields) f.dispose();
    frame.classList.remove('on');
    whole.classList.remove('on');
    label.classList.remove('on');
    window.__world = null;
    onClose();
  }

  /* ----- the loop: never still ----- */
  let running = true;
  let last = performance.now();
  let worldClock = 0;

  function animate(now) {
    if (!running) return;
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
    last = now;
    tempo += (tempoTarget - tempo) * (1 - Math.exp(-dt * 1.3));
    worldClock += dt;

    // Drift: the orbit never stops, even in Reflection (slowed, not still).
    cam.angle += cam.speed * dt * Math.max(tempo, 0.12);
    if (cam.targetAngle !== null) {
      let d = cam.targetAngle - cam.angle;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      cam.angle += d * (1 - Math.exp(-dt * 1.6));
      if (Math.abs(d) < 0.05) cam.targetAngle = null;
    }
    cam.radius += (cam.targetRadius - cam.radius) * (1 - Math.exp(-dt * 0.9));
    cam.height += (cam.targetHeight - cam.height) * (1 - Math.exp(-dt * 0.9));

    const bob = Math.sin(worldClock * 0.24) * (config.camera.bob ?? 0.35);
    camera.position.set(
      Math.cos(cam.angle) * cam.radius,
      cam.height + bob,
      Math.sin(cam.angle) * cam.radius,
    );
    // Look toward the world's heart, leaning with the pointer.
    const lookGoal = new THREE.Vector3(
      look.x + -Math.cos(cam.angle) * pointer.x * 3,
      look.y - pointer.y * 2.2 + bob * 0.5,
      look.z + -Math.sin(cam.angle) * pointer.x * 3,
    );
    camera.lookAt(lookGoal);
    look.lerp(new THREE.Vector3(0, lookHeight, 0), dt * 0.12);

    // Nodes: nearness notices; beacons breathe and flare once found.
    for (const n of nodes) {
      const dist = camera.position.distanceTo(n.vec);
      const near = dist < (n.reach ?? 4.2);
      if (near && !n.noticed && !returning) {
        n.nearSince ??= worldClock;
        if (worldClock - n.nearSince > 0.8 && arc.notice(n.id)) {
          n.noticed = true;
          showReveal(revealById.get(n.id));
        }
      } else if (!near) {
        n.nearSince = null;
      }
      const pulse = 0.5 + 0.25 * Math.sin(worldClock * 1.4 + n.vec.x);
      n.beacon.material.opacity = n.noticed ? 0.28 : pulse;
    }

    for (const f of fields) f.update(worldClock, tempo);
    config.onTick?.(worldClock, tempo, tickApi);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  veil.classList.add('dark');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => veil.classList.remove('dark'));
  });
  requestAnimationFrame(animate);

  // Quiet debug/testing surface.
  window.__world = {
    arc,
    slug: config.slug,
    glideTo,
    get beat() { return arc.beat; },
    nodes: () => nodes.map((n) => ({ id: n.id, noticed: n.noticed })),
    place(id) { // test hook: jump the drift target straight to a node
      const n = nodes.find((x) => x.id === id);
      if (n) {
        cam.angle = Math.atan2(n.vec.z, n.vec.x);
        cam.radius = Math.max(2.0, n.vec.length() * 0.5);
        cam.targetRadius = cam.radius;
        cam.height = n.vec.y;
        cam.targetHeight = n.vec.y;
      }
    },
  };
}
