# The Museum

An emotional atlas of art — a moving gallery whose paintings are windows.

> "This museum doesn't ask what the artist painted. It asks what they felt."

You arrive in a drifting hall where five paintings hang in the dark. Click
one and the camera carries you through the frame — into a world built from
the painting's own brushstrokes, floating in space around you. The camera
never rests. Glowing presences invite you closer; coming near one lets its
story surface (the artist's own verified words, or the world's quiet
facts). When enough has been noticed, the world leans in once — then slows,
thins, and finally recedes into the whole framed painting: you stand before
it again, changed. The gallery remembers where you've been with a small
warm ember on the frame. Press Escape in any world to step back early —
every visit closes with the Return.

Each world carries its own continuous generative score — synthesized live,
evolving, never looping — beneath the sound of the world itself.

## Run it

```
python3 -m http.server
```

then open http://localhost:8000/ — that's all. Plain HTML/CSS/JS with one
vendored library (`vendor/three.module.min.js`, MIT); no build step, no
npm install, no server-side code. Any static host works. Audio begins with
your first click (a browser autoplay rule) — which is also how you enter.

## The paintings

| Feeling | Painting |
|---|---|
| Wonder | The Starry Night — Vincent van Gogh, 1889 |
| Serenity | Water Lilies — Claude Monet, c. 1915–26 |
| Longing / Endurance | The Two Fridas — Frida Kahlo, 1939 |
| Intimacy | Girl with a Pearl Earring — Johannes Vermeer, c. 1665 |
| Awe / Impermanence | Under the Wave off Kanagawa — Katsushika Hokusai, c. 1830–32 |

**Show the real paintings:** drop a public-domain image at
`assets/art/<slug>/painting.jpg` (slugs: `starry-night`, `water-lilies`,
`two-fridas`, `pearl-earring`, `great-wave`) and it is auto-detected — the
hall frames and the Return ritual will show the original itself instead of
the procedural rendering. No code changes needed.

Every quoted word is verified against its source before it ships; see
`docs/research/`. The founding brief and its v2 amendments live in
`MUSEUM_BIBLE.md`; the binding rules in `CLAUDE.md`.
