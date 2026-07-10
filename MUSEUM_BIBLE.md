# The Museum — Founding Brief

## Core Thesis
This is not a gallery and not a traditional website. It is an emotional atlas of art.

> "This museum doesn't ask what the artist painted. It asks what they felt."
> (Internal version: We are not preserving paintings. We are preserving the emotions that created them.)

Success is measured by feeling, not information retained. A visitor should leave having connected with the human being behind the work — not with a list of facts.

## Structure

**Home is the emotion map, not a menu.** The very first screen is itself an immersive world — choosing "Wonder" or "Longing" already feels like stepping into the experience, not selecting from a UI. No traditional homepage, no conventional navigation chrome.

Each emotion is a "room" — a world in its own right — containing a small, curated set of paintings that share that feeling regardless of era, culture, or movement. A painting has exactly one primary emotional home in v1 (no multi-membership yet, to keep the experience focused).

The emotion room is the visitor's **home base**. After completing a painting, they return to the same emotional world they entered from — not a generic homepage — and that world quietly remembers they've been there (a subtle, non-showy trace, not a badge or achievement marker).

## The v1 Roster

| Painting | Artist | Emotion | Storytelling mode |
|---|---|---|---|
| The Starry Night (1889) | Vincent van Gogh | Wonder (with an ache beneath it) | Authentic letters |
| Water Lilies / Grandes Décorations | Claude Monet | Serenity | Documented intention (letters/quotes, less confessional than Van Gogh) |
| The Two Fridas (1939) | Frida Kahlo | Longing / Endurance | Authentic diary & letters |
| Girl with a Pearl Earring (c. 1665) | Johannes Vermeer | Intimacy | Environmental / symbolic only — no personal writings survive |
| The Great Wave off Kanagawa (c. 1831) | Katsushika Hokusai | Awe / Impermanence | Environmental / historical only |

Deliberately excluded from v1 (reserved for a future "deeper" wing once trust is established): The Scream, Guernica, The Garden of Earthly Delights. v1 should feel inviting, not overwhelming with darkness.

## The Universal Emotional Arc

Every painting experience moves through the same five beats, regardless of how different its surface treatment is:

1. **Wonder** — arrival. Pure sensory presence, no text, no UI. The world simply exists around the visitor.
2. **Curiosity** — the visitor notices the world responding to attention (proximity/lingering, not clicking) and begins to explore.
3. **Connection** — accumulated discoveries resolve into a feeling of meeting the human being behind the work. This must work regardless of *which* fragments a given visitor found — design it as a threshold state ("enough has been noticed"), not a scripted payoff tied to specific content.
4. **Reflection** — motion slows, sound thins toward near-silence. Nothing new is learned here; this beat is for absorbing, not acquiring.
5. **Return** (the closing ritual — applies to every painting) — the visitor consciously pulls back. The fragmented, close-up world reassembles into the whole original painting, exactly as the artist made it, frame reforming. They are no longer inside it; they are standing before it again. Nothing about the artwork changed. The visitor did. This is the literal enactment of the museum's thesis and should close every single painting experience.

## Non-Negotiable Design Principles

**Visual — painterly, not photorealistic.** Never convert a painting into 3D-modeled geometry with realistic lighting/materials. The brushwork, flatness, and compression of emotion into paint IS the content. Depth and movement are achieved through **layered parallax** (foreground/midground/background planes shifting relative to each other as the visitor moves or their attention lingers) — never full 3D navigation with the freedom to walk around and view geometry from arbitrary angles.

**Movement — a blend of agency and atmosphere.** The visitor should feel they're choosing where to explore, but the world should respond to curiosity rather than requiring deliberate game-like navigation (no WASD-style controls, no game-camera feel). Elements sharpen and draw nearer the longer attention rests on them. Slow, intuitive, dreamlike — never a "level" to traverse.

**Discovery — proximity and attention-based, never a menu of hotspots.** Elements signal their presence subtly (a soft glow, a sway, a warming light) rather than obvious clickable markers. **Discovery order is free, not fixed** — every visitor may find fragments in a different sequence. Design each painting's Connection beat to work regardless of order or count of fragments found.

**Storytelling — never a textbook, never invented words.**
- Where authentic letters/diaries/writings survive (Van Gogh, Kahlo, Monet's documented intentions), use them, sparingly, at meaningful moments — never as a wall of narration.
- Where no personal record survives (Vermeer, Hokusai), storytelling is built entirely from environmental detail, symbolism, and carefully researched historical context. **Never invent words or an inner monologue for an artist who left none.** The absence of a paper trail is not a gap to paper over — it can become part of the story itself (e.g., Vermeer's anonymity, the mystery of the girl's identity).
- All factual/historical claims must be verified against reliable sources before being written into any experience (for Van Gogh specifically, cross-check exact letter wording and numbering against vangoghletters.org, the scholarly source of record).

**The artist's "voice."** When quoting an artist's own words, they should never be performed or impersonated, and never delivered as generic narration either. Treat them as **remembered thought / echo** — quiet, intimate, distant, as if surfacing from memory rather than being spoken by a present narrator. The focus stays on the words, never on a implied speaker or character. The artist themself should almost never be visually depicted — felt through the world they made, not seen as a character or guide.

**Sound — restrained, cinematic, mostly silence.** No continuous background score anywhere in the museum. Each painting has its own unique ambient soundscape (its literal world's sound, not "mood music"). Music appears only in brief, sparing moments that deepen a real emotional beat (e.g., under a Connection moment) — a held tone or chord, never a theme — and recedes quickly. Silence is used deliberately, not filled by default. The design goal: visitors should feel they're *hearing the world*, not *listening to a soundtrack*.

**Emotional ceiling per painting.** Heavier historical facts (illness, confinement, suffering) belong in the experience but must never become the defining takeaway of a piece, especially in v1's more inviting roster. The final impression a visitor leaves with should be admiration and beauty, not sorrow — darkness deepens connection, it doesn't conclude the experience.

## Starry Night — Full Reference Design (the template for process, not for surface treatment)

**Entry:** No loading screen. Selecting the painting from the Wonder room pulls the view inward, brushstrokes filling the frame, until the visitor arrives standing low in the composition — a wheat field at night, sky rolling overhead.

**Wonder:** Sky in slow, continuous motion (paint-like, not weather-simulation-realistic). Stars pulse gently, catching light like impasto. No text, no instructions. A single nearby star drifts slightly as an organic invitation to move — this is how the visitor learns they can explore, without ever being told.

**Curiosity — discovery nodes (visited in any order, any subset):**
- *The cypress* — sways more as approached. Surfaces (verify exact source before production): "The cypresses are always occupying my thoughts... it astonishes me that they have not yet been done as I see them." Reveal: he saw the cypress as vital and alive, not as the death-symbol its traditional graveyard association suggests.
- *The sky itself* — lingering in the swirl surfaces: "When I have a terrible need of — shall I say the word — religion — then I go out and paint the stars." Reveal: the sky is devotion, not decoration.
- *The village* — the longer it's observed, the more it feels quietly invented — because it was: painted from memory, the church spire Dutch in style, not Provençal. Reveal: this is not an observed place. It's a memory being reassembled.
- *The horizon / a single star (held for last, most subtle)* — a faint, brief suggestion of bars at the edge of vision, paired with: "Looking at the stars always makes me dream, as simply as I dream over the black dots representing towns and villages on a map." Reveal, softly: Van Gogh painted this from Saint-Rémy asylum, but the sky itself he genuinely watched through his cell window (he wrote of observing Venus). The wonder is real. So was the confinement. This must stay subtle — a felt shift, not a scene or a stated fact block.

**Connection:** No new content — the accumulated weight of whatever was discovered settles. A single sustained string tone may swell almost imperceptibly, then recede.

**Reflection:** Sky's motion slows (never stops entirely). Sound thins to near-silence — wind, faint rustle, nothing more.

**Return:** The visitor turns/steps back. The whole canvas comes back into view, exactly as Van Gogh painted it, frame reforming. They stand before it, not within it — changed, though the painting is not.

## Fact-Verification Note
All Van Gogh letter fragments above are genuine but must be checked for exact wording and letter number against vangoghletters.org before final implementation. The Saint-Rémy/Venus detail should be similarly verified against a reputable biographical source before being written into the experience. The same standard applies to every painting: verify before writing, always cite mentally to a real source, never smooth over uncertainty by inventing specifics.

## Scope for v1
Five paintings, each fully realized rather than many done shallowly. Each painting's world, sound, and discovery mechanism should be unique — only the five-beat emotional arc, the Return ritual, the movement feel, and the authenticity rules above are constant across all five.
