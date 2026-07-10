# The Museum — CLAUDE.md (v2)

This file binds every session working on this project. The founding brief lives in
`MUSEUM_BIBLE.md` — read it, **including its v2 Amendments**, before making design
decisions. Where this file and the bible (as amended) disagree, the bible wins. The
rules below are **non-negotiable**; do not relax them for convenience, deadlines, or
technical ease. If a requested change would violate one, say so instead of quietly
complying.

## What this is

An emotional atlas of art — a **moving gallery** whose five real paintings are windows
into walkable painted worlds. *"This museum doesn't ask what the artist painted. It
asks what they felt."* Success is measured by feeling, not information retained.

## Technical constraints

- **Plain HTML/CSS/JS, no build step.** No bundlers, no npm install, no transpilation.
  Vendored single-file libraries are allowed and committed under `vendor/`
  (currently Three.js r170 + its license). Files are served and run as written from a
  static server (`python3 -m http.server`). No server-side code.
- **Visuals:** WebGL (Three.js) for hall and worlds; Canvas 2D for whole-painting
  compositions. **Sound:** Web Audio API only — all music and ambience is synthesized;
  no audio assets required.

## Binding design rules (v2)

### Structure
1. **Home IS the gallery.** The first screen is the drifting 3D hall of the five
   framed paintings. No menus, no conventional navigation chrome — anywhere.
2. **Each painting is a window.** Clicking it carries the camera through the frame
   into that painting's world. In v1 scope a painting has exactly one world.
3. **The gallery is home base.** After a painting's Return, the visitor lands back in
   the hall **standing before the painting they entered**. Frames of returned-from
   worlds carry a small warm ember — light only, **never** a badge, checkmark,
   counter, or achievement marker.

### The five-beat arc (every painting, no exceptions)
Wonder → Curiosity → Connection → Reflection → Return.
- **Wonder:** arrival inside the paint. No text, no UI, no instructions.
- **Curiosity:** glowing presences invite; clicking one glides the camera toward it,
  but **discovery is arrival** — coming near a node is what notices it.
- **Connection:** a **threshold state** — fires when *enough has been noticed*,
  regardless of which fragments were found or in what order. Never script it to
  specific content or a fixed sequence. The score swells once, then returns to itself.
- **Reflection:** motion and music slow and thin toward almost-nothing. Nothing new
  is introduced. Slowed, never stopped.
- **Return (the closing ritual):** the world recedes; the whole painting reassembles
  inside a reforming frame with its museum label; the visitor stands before it, no
  longer inside it. **Every visit closes with this — including visits cut short**
  (Escape withdraws at any time).

### Visual
4. **Painterly 3D, never photoreal.** Worlds are true 3D spaces, but built from
   strokes of pigment and light floating in space (GPU point fields, glow sprites) —
   never modeled geometry with realistic materials, never a game-like environment.
5. **The screen is never still.** The camera drifts continuously in the hall and in
   every world; stroke fields breathe on their own orbits. Reflection slows the
   world; nothing ever freezes.

### Movement & interaction
6. **No game-like navigation.** No WASD, no free-look FPS camera. The camera drifts
   on slow paths; the pointer leans it; clicks are deliberate passages (enter a
   painting, glide to a presence, ease toward a side of the world). Slow, dreamlike.
7. **Presences signal subtly** — soft pulsing glows in the world's own palette, never
   UI markers, never a menu of hotspots.
8. **Discovery order is free.** Any order, any subset. Every Connection beat must
   work regardless.

### Storytelling & authenticity (unchanged from v1 — absolute)
9. **Never a textbook, never invented words.** Artists with surviving writings
   (Van Gogh, Kahlo, Monet's documented intentions): authentic words, sparingly, as
   remembered echoes. Artists with no personal record (Vermeer, Hokusai):
   environmental sense-lines only. **Never invent words or an inner monologue for an
   artist who left none.**
10. **Verify before writing.** Every quote and factual claim must exist, with its
    source, in `docs/research/<slug>.md` before it enters any experience. Van Gogh
    letters cross-checked against vangoghletters.org. Nothing unverified ships.
11. **The artist's voice is a remembered echo** — never performed, never narration.
    The artist is almost never visually depicted.

### Sound (v2)
12. **Each world has a continuous generative score** — an evolving, never-looping
    random walk through one scale, unique per painting, plus the world's own ambient
    sound (synthesized noise beds and drones). It wanders; it never becomes a theme
    or an audible loop.
13. **The score serves the arc:** it swells once under Connection, thins toward
    near-silence in Reflection, and dissolves through the Return.
14. **The hall is quieter than the worlds.** Silence is still a material — the
    museum should never feel scored over, only inhabited.

### Emotional ceiling (unchanged)
15. Heavier facts (illness, confinement, suffering) belong in the experience but must
    **never** be the defining takeaway. Darkness deepens connection; it never
    concludes the experience. The visitor leaves with admiration and beauty.

## v1 scope (unchanged roster)

| Painting | Artist | Feeling | Storytelling mode |
|---|---|---|---|
| The Starry Night (1889) | Vincent van Gogh | Wonder | Authentic letters |
| Water Lilies / Grandes Décorations | Claude Monet | Serenity | Documented intention |
| The Two Fridas (1939) | Frida Kahlo | Longing / Endurance | Authentic diary |
| Girl with a Pearl Earring (c. 1665) | Johannes Vermeer | Intimacy | Environmental only |
| The Great Wave off Kanagawa (c. 1831) | Katsushika Hokusai | Awe / Impermanence | Environmental only |

## Folder structure

```
index.html            One canvas + a few overlay elements
vendor/               Vendored libraries (three.module.min.js + license)
css/                  base.css, gallery.css
js/main.js            Boot: renderer, sound, memory, hall <-> world handoff
js/core/              arc state machine, Web Audio helpers, generative score,
                      visit-trace memory, emitter
js/gallery/hall.js    The moving gallery of the five framed paintings
js/worlds/            engine.js (world runner), strokes.js (paint-in-space),
                      one config per painting world
js/paintings/<slug>/  scene.js — the research-cleared source of truth per painting:
                      title/aspect, reveal texts, connection tones, ambient sound,
                      and the whole-composition drawWhole() used for frame textures
                      and the Return
assets/art/<slug>/    OPTIONAL painting.jpg (public domain) — auto-detected: used for
                      the hall frames and the Return, replacing procedural renderings
docs/research/        Verified quotes & facts WITH sources — the gate every word
                      must pass before entering an experience
```

Slugs: `starry-night`, `water-lilies`, `two-fridas`, `pearl-earring`, `great-wave`.

## Working rules for sessions

- Before writing any quote or historical claim into an experience, its verified text
  and source must exist in `docs/research/<slug>.md`.
- Reveal text lives ONLY in `js/paintings/<slug>/scene.js` (one source of truth);
  world configs reference nodes by id.
- When building or reviewing a world, check it against the five-beat arc and every
  rule above before considering it done. Verify in a real browser (Playwright).
