/**
 * Stroke fields — paint, floating in space.
 *
 * Every world (and the gallery's dust) is built from these: thousands of
 * soft dabs of pigment as GPU points, each orbiting its home position on
 * its own slow ellipse so the whole field breathes without a single line
 * of per-frame JavaScript. Never geometry, never surfaces: the painting's
 * own language, given depth.
 */
import * as THREE from '../../vendor/three.module.min.js';

// A real oil-brushstroke stamp: a loaded horizontal streak with bristle
// grooves and an impasto highlight, feathered at the ends. Every stroke
// samples this, rotated and squeezed to its own angle and length, so the
// worlds read as thick living paint rather than soft dots.
let brushTexture = null;
function getBrushTexture() {
  if (brushTexture) return brushTexture;
  const W = 128, H = 64;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W, H);
  const buf = img.data;
  const cy = H / 2;
  for (let x = 0; x < W; x++) {
    const u = x / (W - 1);
    const halfH = Math.sin(u * Math.PI) * (H * 0.44);   // feather the ends
    for (let y = 0; y < H; y++) {
      const i = (y * W + x) * 4;
      if (halfH < 0.5) { buf[i + 3] = 0; continue; }
      const dy = (y - cy) / halfH;
      if (Math.abs(dy) > 1) { buf[i + 3] = 0; continue; }
      // bristle grooves along the length + an impasto ridge above centre
      const bristle = 0.6 + 0.4 * Math.sin(y * 1.7 + Math.sin(u * 9) * 1.6);
      const ridge = Math.exp(-Math.pow((dy + 0.25) * 2.1, 2)) * 0.55;
      const body = Math.pow(1 - Math.abs(dy), 0.7);
      const bright = Math.min(1, bristle * body + ridge);
      const alpha = Math.pow(body, 1.1) * (0.82 + 0.18 * bristle);
      const v = Math.round(bright * 255);
      buf[i] = v; buf[i + 1] = v; buf[i + 2] = v;
      buf[i + 3] = Math.round(alpha * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  brushTexture = new THREE.CanvasTexture(canvas);
  brushTexture.minFilter = THREE.LinearFilter;
  brushTexture.magFilter = THREE.LinearFilter;
  return brushTexture;
}

// Brushstrokes, not dots: each point is an oriented streak of pigment with
// a loaded, brighter core — the visual language of the reference paintings.
const VERTEX = /* glsl */ `
  attribute vec3 home;
  attribute vec3 tint;
  attribute float dabSize;
  attribute vec4 orbit;    // radius, speed, phase, wobble
  attribute vec2 brush;    // angle (radians), aspect (length/width)
  uniform float uTime;
  uniform float uTempo;
  uniform float uPixelRatio;
  uniform float uSwirl;
  varying vec3 vTint;
  varying float vFade;
  varying vec2 vBrush;

  void main() {
    float a = orbit.z + uTime * orbit.y * uTempo;
    vec3 off = vec3(
      cos(a),
      sin(a * 0.63 + orbit.w) * 0.6,
      sin(a)
    ) * orbit.x * uSwirl;
    vec3 pos = home + off;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = max(-mv.z, 0.5);
    // point sprite must fit the long axis of the streak
    gl_PointSize = dabSize * uPixelRatio * (150.0 / dist) * max(brush.y, 1.0);
    vTint = tint;
    vFade = 0.72 + 0.28 * sin(uTime * 0.9 * uTempo + orbit.w * 7.0);
    // the streak's orientation drifts a touch, like a wet stroke
    vBrush = vec2(brush.x + sin(uTime * 0.4 * uTempo + orbit.w) * 0.12, max(brush.y, 1.0));
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uOpacity;
  uniform sampler2D uBrush;
  varying vec3 vTint;
  varying float vFade;
  varying vec2 vBrush;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    // rotate into the stroke's frame, then squeeze the short axis to a streak
    float c = cos(vBrush.x), s = sin(vBrush.x);
    vec2 q = vec2(p.x * c - p.y * s, p.x * s + p.y * c);
    vec2 uv = vec2(q.x + 0.5, q.y * vBrush.y + 0.5);   // sample the oil-brush stamp
    if (uv.y < 0.0 || uv.y > 1.0) discard;
    vec4 tx = texture2D(uBrush, uv);
    float alpha = tx.a * uOpacity * vFade;
    if (alpha < 0.004) discard;
    // bristle grooves and the impasto ridge ride as lighter paint over the tint
    vec3 col = vTint * (0.7 + 0.55 * tx.r);
    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * spec: {
 *   count,
 *   home(i, rnd) -> [x,y,z],   // relative to origin if origin given
 *   color(i, rnd) -> [r,g,b] (0..1),
 *   size: [min,max],
 *   orbit: { radius: [min,max], speed: [min,max] },
 *   opacity, blending ('add'|'normal'),
 *   origin?: [x,y,z],  // place the whole field; enables whole-element motion
 *   name?: string,     // lets a world's onTick animate this element
 *   aspect?: [min,max],   // brushstroke length/width (1 = round dab; ~3 = ribbon)
 *   angle?: 'flow'|'swirl'|'vertical'|number|fn(i,rnd,home)  // stroke orientation
 * }
 */
export function createStrokeField(spec, rnd) {
  // Global paint density: phones thin the stroke count for smoothness.
  const count = Math.max(8, Math.round(spec.count * (window.__paintDensity ?? 1)));
  const home = new Float32Array(count * 3);
  const tint = new Float32Array(count * 3);
  const dabSize = new Float32Array(count);
  const orbit = new Float32Array(count * 4);
  const brush = new Float32Array(count * 2);

  const [s0, s1] = spec.size;
  const [or0, or1] = spec.orbit?.radius ?? [0.1, 0.4];
  const [os0, os1] = spec.orbit?.speed ?? [0.05, 0.2];
  const [as0, as1] = spec.aspect ?? [1, 1];
  const angleSpec = spec.angle;

  function angleFor(i, h) {
    if (typeof angleSpec === 'function') return angleSpec(i, rnd, h);
    if (typeof angleSpec === 'number') return angleSpec + (rnd() - 0.5) * 0.4;
    if (angleSpec === 'swirl') return Math.atan2(h[1], h[0]) + Math.PI / 2; // tangent to origin
    if (angleSpec === 'flow') return Math.atan2(h[1], h[0]);                 // radial
    if (angleSpec === 'vertical') return Math.PI / 2 + (rnd() - 0.5) * 0.5;
    if (angleSpec === 'horizontal') return (rnd() - 0.5) * 0.5;
    return rnd() * Math.PI * 2;                                              // random
  }

  for (let i = 0; i < count; i++) {
    const h = spec.home(i, rnd);
    home.set(h, i * 3);
    tint.set(spec.color(i, rnd), i * 3);
    dabSize[i] = s0 + rnd() * (s1 - s0);
    orbit[i * 4] = or0 + rnd() * (or1 - or0);
    orbit[i * 4 + 1] = (os0 + rnd() * (os1 - os0)) * (rnd() < 0.5 ? -1 : 1);
    orbit[i * 4 + 2] = rnd() * Math.PI * 2;
    orbit[i * 4 + 3] = rnd() * Math.PI * 2;
    brush[i * 2] = angleFor(i, h);
    brush[i * 2 + 1] = as0 + rnd() * (as1 - as0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(home.slice(), 3));
  geometry.setAttribute('home', new THREE.BufferAttribute(home, 3));
  geometry.setAttribute('tint', new THREE.BufferAttribute(tint, 3));
  geometry.setAttribute('dabSize', new THREE.BufferAttribute(dabSize, 1));
  geometry.setAttribute('orbit', new THREE.BufferAttribute(orbit, 4));
  geometry.setAttribute('brush', new THREE.BufferAttribute(brush, 2));

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: spec.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uTempo: { value: 1 },
      uPixelRatio: { value: Math.min(devicePixelRatio || 1, 2) },
      uSwirl: { value: 1 },
      uOpacity: { value: spec.opacity ?? 0.55 },
      uBrush: { value: getBrushTexture() },
    },
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  if (spec.origin) points.position.set(...spec.origin);
  if (spec.name) points.userData.name = spec.name;

  return {
    points,
    name: spec.name,
    baseOpacity: spec.opacity ?? 0.55,
    update(time, tempo) {
      material.uniforms.uTime.value = time;
      material.uniforms.uTempo.value = tempo;
    },
    setOpacity(v) {
      material.uniforms.uOpacity.value = v;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

/** A soft radial glow sprite (for beacons, halos, hearts, lamplight). */
export function createGlow(color, size, opacity = 0.8) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.setScalar(size);
  return sprite;
}

/** Position helper: azimuth (degrees), radius, height -> Vector3-ish array. */
export function az(deg, radius, y) {
  const a = (deg * Math.PI) / 180;
  return [Math.cos(a) * radius, y, Math.sin(a) * radius];
}
