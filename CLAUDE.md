# The Museum — CLAUDE.md

This file binds every session working on this project. The full founding brief lives in
`MUSEUM_BIBLE.md` — read it before making design decisions. Where this file and the bible
disagree, the bible wins. The rules below are **non-negotiable**; do not relax them for
convenience, deadlines, or technical ease. If a requested change would violate one, say so
instead of quietly complying.

## What this is

An emotional atlas of art — not a gallery, not a traditional website.
*"This museum doesn't ask what the artist painted. It asks what they felt."*
Success is measured by feeling, not information retained.

## Technical constraints

- **Plain HTML/CSS/JS only.** No frameworks, no build tools, no bundlers, no npm
  dependencies, no transpilation. Files are served and run as written.
- **Visuals:** SVG and Canvas. **Sound:** Web Audio API.
- Everything must work by opening `index.html` through a simple static file server
  (e.g. `python3 -m http.server`). No server-side code.

## Binding design rules

### Structure
1. **Home IS the emotion map.** The first screen is itself an immersive world. No
   traditional homepage, no menus, no conventional navigation chrome — anywhere.
2. **Each emotion is a room** containing a small curated set of paintings. In v1 a
   painting has exactly **one** primary emotional home (no multi-membership).
3. **The emotion room is home base.** After a painting, the visitor returns to the
   emotion room they entered from — never a generic homepage. That room quietly
   remembers the visit: a subtle, non-showy trace. **Never** a badge, checkmark,
   counter, or achievement marker.

### The five-beat arc (every painting, no exceptions)
Wonder → Curiosity → Connection → Reflection → Return.
- **Wonder:** pure sensory arrival. No text, no UI, no instructions.
- **Curiosity:** the world responds to attention (proximity/lingering), inviting exploration.
- **Connection:** a **threshold state** — it must fire when *enough has been noticed*,
  regardless of which fragments were found or in what order. Never script it to specific
  content or a fixed sequence.
- **Reflection:** motion slows, sound thins toward near-silence. Nothing new is
  introduced here — this beat is for absorbing, not acquiring.
- **Return (the closing ritual):** the fragmented close-up world reassembles into the
  whole original painting, exactly as the artist made it, frame reforming. The visitor
  stands before it, no longer inside it. Nothing about the artwork changed; the visitor
  did. **Every painting experience must close with this.**

### Visual
4. **Painterly, never photorealistic.** Never convert a painting into 3D-modeled
   geometry with realistic lighting/materials. Brushwork, flatness, and the compression
   of emotion into paint IS the content.
5. **Depth = layered parallax** (foreground/midground/background planes shifting with
   movement and attention). **Never** free 3D navigation or arbitrary camera angles.

### Movement & discovery
6. **No game-like navigation.** No WASD, no game-camera feel, no "levels." Movement is
   slow, intuitive, dreamlike — agency blended with atmosphere.
7. **Discovery is proximity- and attention-based.** Elements sharpen and draw nearer the
   longer attention rests on them. They signal presence subtly (soft glow, sway, warming
   light) — **never** obvious clickable markers or a menu of hotspots.
8. **Discovery order is free.** Every visitor may find fragments in any order and any
   subset. Design every Connection beat to work regardless.

### Storytelling & authenticity
9. **Never a textbook, never invented words.**
   - Artists with surviving writings (Van Gogh, Kahlo, Monet's documented intentions):
     use their authentic words, sparingly, at meaningful moments — never as a wall of
     narration.
   - Artists with no personal record (Vermeer, Hokusai): storytelling is built entirely
     from environmental detail, symbolism, and researched historical context.
     **Never invent words or an inner monologue for an artist who left none.** The
     absence itself can be part of the story.
10. **Verify before writing.** Every factual/historical claim must be checked against a
    reliable source before it enters any experience. Van Gogh letter wording and
    numbering must be cross-checked against **vangoghletters.org** (the scholarly source
    of record). Keep verified quotes with their sources in `docs/research/` — nothing
    unverified ships. Never smooth over uncertainty by inventing specifics.
11. **The artist's voice is a remembered echo.** Quoted words are never performed,
    impersonated, or delivered as narration — they surface quietly, as if from memory.
    The artist is almost never visually depicted: felt through the world they made,
    never seen as a character or guide.

### Sound
12. **No continuous background score, anywhere.** Each painting has its own unique
    ambient soundscape — its literal world's sound, not "mood music."
13. **Music only in brief, sparing moments** that deepen a real emotional beat (e.g.
    under Connection): a held tone or chord, never a theme, receding quickly.
14. **Silence is deliberate.** Never fill it by default. The visitor should feel they're
    *hearing the world*, not listening to a soundtrack.

### Emotional ceiling
15. Heavier facts (illness, confinement, suffering) belong in the experience but must
    **never** be the defining takeaway. Darkness deepens connection; it never concludes
    the experience. The visitor leaves with admiration and beauty, not sorrow.

## v1 scope

Five paintings, each fully realized — depth over breadth. Unique world, sound, and
discovery mechanism per painting; only the five-beat arc, the Return ritual, the
movement feel, and the authenticity rules are constant.

| Painting | Artist | Emotion (room) | Storytelling mode |
|---|---|---|---|
| The Starry Night (1889) | Vincent van Gogh | Wonder | Authentic letters |
| Water Lilies / Grandes Décorations | Claude Monet | Serenity | Documented intention |
| The Two Fridas (1939) | Frida Kahlo | Longing / Endurance | Authentic diary & letters |
| Girl with a Pearl Earring (c. 1665) | Johannes Vermeer | Intimacy | Environmental / symbolic only |
| The Great Wave off Kanagawa (c. 1831) | Katsushika Hokusai | Awe / Impermanence | Environmental / historical only |

Excluded from v1 (reserved for a future "deeper" wing): The Scream, Guernica, The Garden
of Earthly Delights. v1 must feel inviting.

## Folder structure

```
index.html            The emotion map — the museum itself, not a menu
css/                  base.css (shared foundations) + per-surface styles
js/main.js            Entry point; boots the emotion map
js/core/              Shared engine: arc state machine, attention/proximity tracking,
                      parallax layers, Web Audio helpers, visit-trace memory
js/map/               The emotion map's world: regions, atmosphere, entry ritual
js/rooms/             One module per emotion room
js/paintings/<name>/  One folder per painting — its scene, layers, discovery nodes, sound
assets/art/           SVG layers / source imagery, grouped per painting
assets/audio/         Soundscape samples, grouped per painting
docs/research/        Verified quotes & facts WITH sources, one file per painting —
                      the gate every word must pass before entering an experience
```

Painting slugs: `starry-night`, `water-lilies`, `two-fridas`, `pearl-earring`,
`great-wave`. Use these consistently across `js/paintings/`, `assets/`, and
`docs/research/`.

## Working rules for sessions

- Before writing any quote or historical claim into an experience, its verified text and
  source must exist in `docs/research/<painting>.md`.
- When building or reviewing a painting experience, check it against the five-beat arc
  and every rule above before considering it done.
- Starry Night's reference design in the bible is the template for **process**, not for
  surface treatment — each painting's world must be its own.
