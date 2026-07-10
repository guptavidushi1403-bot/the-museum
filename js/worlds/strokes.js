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

const VERTEX = /* glsl */ `
  attribute vec3 home;
  attribute vec3 tint;
  attribute float dabSize;
  attribute vec4 orbit; // radius, speed, phase, wobble
  uniform float uTime;
  uniform float uTempo;
  uniform float uPixelRatio;
  uniform float uSwirl;
  varying vec3 vTint;
  varying float vFade;

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
    gl_PointSize = dabSize * uPixelRatio * (140.0 / dist);
    vTint = tint;
    // Breathe a little, each dab on its own phase.
    vFade = 0.75 + 0.25 * sin(uTime * 0.9 * uTempo + orbit.w * 7.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vTint;
  varying float vFade;

  void main() {
    vec2 q = gl_PointCoord - 0.5;
    float d = length(q);
    float alpha = smoothstep(0.5, 0.06, d) * uOpacity * vFade;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(vTint, alpha);
  }
`;

/**
 * spec: {
 *   count,
 *   home(i, rnd) -> [x,y,z],
 *   color(i, rnd) -> [r,g,b] (0..1),
 *   size: [min,max],
 *   orbit: { radius: [min,max], speed: [min,max] },
 *   opacity, blending ('add'|'normal')
 * }
 */
export function createStrokeField(spec, rnd) {
  const count = spec.count;
  const home = new Float32Array(count * 3);
  const tint = new Float32Array(count * 3);
  const dabSize = new Float32Array(count);
  const orbit = new Float32Array(count * 4);

  const [s0, s1] = spec.size;
  const [or0, or1] = spec.orbit?.radius ?? [0.1, 0.4];
  const [os0, os1] = spec.orbit?.speed ?? [0.05, 0.2];

  for (let i = 0; i < count; i++) {
    const h = spec.home(i, rnd);
    home.set(h, i * 3);
    tint.set(spec.color(i, rnd), i * 3);
    dabSize[i] = s0 + rnd() * (s1 - s0);
    orbit[i * 4] = or0 + rnd() * (or1 - or0);
    orbit[i * 4 + 1] = (os0 + rnd() * (os1 - os0)) * (rnd() < 0.5 ? -1 : 1);
    orbit[i * 4 + 2] = rnd() * Math.PI * 2;
    orbit[i * 4 + 3] = rnd() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(home.slice(), 3));
  geometry.setAttribute('home', new THREE.BufferAttribute(home, 3));
  geometry.setAttribute('tint', new THREE.BufferAttribute(tint, 3));
  geometry.setAttribute('dabSize', new THREE.BufferAttribute(dabSize, 1));
  geometry.setAttribute('orbit', new THREE.BufferAttribute(orbit, 4));

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
    },
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  return {
    points,
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
