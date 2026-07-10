/**
 * Shared painterly drawing vocabulary for painting worlds: dabs, glows,
 * seeded randomness. Everything is pigment — no geometry, no photorealism.
 */

export const TAU = Math.PI * 2;

export function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hsla([h, s, l], a) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

export function glow(ctx, x, y, r, color, alpha) {
  if (alpha <= 0.004 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hsla(color, alpha));
  g.addColorStop(1, hsla(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

export function dab(ctx, x, y, rx, ry, rot, color, alpha) {
  if (alpha <= 0.004) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = hsla(color, alpha);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}
