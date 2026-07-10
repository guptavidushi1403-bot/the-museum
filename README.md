# The Museum

An emotional atlas of art — not a gallery, not a traditional website.

> "This museum doesn't ask what the artist painted. It asks what they felt."

Five emotions, five paintings, one rule everywhere: nothing is clicked.
Attention is the only door. Rest your gaze on what draws you; the world
answers. Lingering at the bottom of any world breathes you back out.

## Run it

```
python3 -m http.server
```

then open http://localhost:8000/ — that's all. Plain HTML/CSS/JS: no build
step, no dependencies, no server-side code. Any static host works.

Sound begins after your first click or keypress anywhere (a browser
autoplay rule); until then the museum is simply silent.

## The paintings

| Emotion | Painting |
|---|---|
| Wonder | The Starry Night — Vincent van Gogh, 1889 |
| Serenity | Water Lilies — Claude Monet, c. 1915–26 |
| Longing / Endurance | The Two Fridas — Frida Kahlo, 1939 |
| Intimacy | Girl with a Pearl Earring — Johannes Vermeer, c. 1665 |
| Awe / Impermanence | Under the Wave off Kanagawa — Katsushika Hokusai, c. 1830–32 |

Every painting closes with the Return: the world you were inside recedes
into the whole composition, frame reforming — you stand before it again.

**Optional:** drop a public-domain image of a painting at
`assets/art/<slug>/painting.jpg` (slugs: `starry-night`, `water-lilies`,
`two-fridas`, `pearl-earring`, `great-wave`) and the Return ritual will
show the original itself instead of the procedural rendering. No other
change needed — the experience probes for the file.

Every quoted word in the museum is verified against its source before it
ships; see `docs/research/`. The founding brief lives in `MUSEUM_BIBLE.md`,
its binding rules in `CLAUDE.md`.
