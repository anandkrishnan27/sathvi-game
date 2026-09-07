# Implementation Plan — "The Museum" (photo/quiz walking gallery)

## 0. Language & stack decision

**Choice: plain HTML + CSS + vanilla JavaScript (ES5/ES2017-era syntax, no build step, no framework, no npm).**

Justification:

- **JS is not really optional.** The browser executes JavaScript. Java would need to compile to WASM (GWT/TeaVM) and Python would need Pyodide (~10 MB runtime download) or a Flask/FastAPI backend. Both add a build/serve step and a debugging layer for zero benefit here — every line of logic in this game is DOM manipulation, which is JS's native job.
- **No backend needed.** There is no state to persist between sessions, no multiplayer, no auth. Photos are static files. So Python's advantage (server-side logic) is irrelevant.
- **Zero-install delivery matters for a gift.** With no ES modules and no bundler, `index.html` can be **double-clicked and played** straight off a laptop, a USB stick, or a folder in iCloud. A Python version would require the recipient to run a server.
- **Deliberate anti-choice: no React/Vite/TypeScript.** The whole game is ~600 lines. A framework would add `node_modules`, a dev server, and a build artifact that rots in six months. Vanilla stays readable and editable forever.
- **Deliberate anti-choice: no `<canvas>`.** The stage is a stick figure sliding along a line. DOM + CSS transforms gives free animation, free layout, free text rendering, and inspectable elements in devtools. Canvas would mean a render loop and hand-drawn text for no gain.

**One important constraint that follows:** we will use classic `<script>` tags in dependency order, **not** `<script type="module">`. ES modules are blocked by CORS on `file://` in Chrome/Safari, which would break double-click-to-play. Each file attaches one global (`GAME_CONFIG`, `EXHIBITS`, `Stage`, `UI`, `Game`). If a local server is ever preferred: `python3 -m http.server 8000` in the project folder.

---

## 1. File layout

```
sathvi-game/
  index.html            # structure only: top stage, bottom exhibit pane, overlays
  css/
    styles.css          # all styling, 50/50 split, animations
  js/
    config.js           # tunables: steps between exhibits, timings, sizes, text
    exhibit-types.js    # Photo() and Quiz() factories + their renderers
    exhibits.js         # ★ THE ONLY FILE YOU EDIT: the ordered exhibit list
    stage.js            # top window: character, track, camera, walk animation
    ui.js               # bottom window: placard / photo / quiz rendering
    game.js             # state machine, input routing, progression, boot
  assets/
    photos/             # your .jpg / .png files
    audio/              # optional background track
  PLAN.md
  README.md             # how to run + how to add content
```

Load order in `index.html`: `config.js → exhibit-types.js → exhibits.js → stage.js → ui.js → game.js`.

---

## 2. The content API (the part you touch)

`js/exhibits.js` is a single ordered array. Reordering the game = reordering the lines. Nothing else in the codebase knows the order.

```js
const EXHIBITS = [
  Photo({
    src: 'assets/photos/first-date.jpg',
    caption: 'Our first date — you ordered the wrong thing on purpose.',
    alt: 'us at the restaurant',        // optional
  }),

  Quiz({
    question: 'Where did we first meet?',
    choices: ['The library', 'A party', 'Class', 'The dining hall'],
    answer: 2,                          // 0-indexed → 'Class'
    note: 'Row 3, and you were late.',  // optional, shown after answering
  }),

  Photo({ src: 'assets/photos/beach.jpg', caption: 'Beach day.' }),
  // ...add as many as you like, in any order
];
```

Design notes:

- `Photo()` and `Quiz()` are thin factories returning plain objects tagged with `type: 'photo' | 'quiz'`. They do **no** rendering — a `RENDERERS` map in `exhibit-types.js` keyed by `type` does that. This means adding a third kind later (e.g. `Letter({ text })` or `Video({ src })`) is one factory + one renderer, with no changes to `game.js`.
- The array length drives everything: track length, the `Exhibit 3 / 9` counter, the finish screen. No hardcoded counts anywhere.
- Quizzes are always exactly 4 choices (validated at boot, see §6).

---

## 3. The core model — a single integer

This is the key simplification that kills most possible bugs. The entire world is one integer.

```
x = 0 ────●──────────●────────────●──────── x = endX
        exhibit 0   exhibit 1   exhibit 2   (finish line)
```

At **Start**, generate the whole track once:

```js
positions[0]   = randInt(MIN_STEPS, MAX_STEPS);              // e.g. 4..7
positions[i]   = positions[i-1] + randInt(MIN_STEPS, MAX_STEPS);
endX           = positions[last] + randInt(MIN_STEPS, MAX_STEPS);
```

Then:

- `→` does `x++`, `←` does `x--`, both clamped to `[0, endX]`.
- If `x === positions[i]` → that exhibit is at hand.
- If `x === endX` → finish.

Why this beats a "count 5 presses then reset the counter" approach: there is no counter to get out of sync, walking backward needs no special-case rewind logic, and the random spacing requirement is satisfied once at generation time. `x` is the single source of truth; every visual is a pure function of `x`.

**Walking backward:** exhibit markers are permanent fixtures on the track, so walking left back onto exhibit 1 re-opens it. Quiz answers are remembered (`answered[i]`), so a revisited quiz shows its already-revealed green/red state instead of re-asking. This is the museum behavior the two-direction control implies, and it costs almost nothing given the model above.

---

## 4. State machine

Six states, one transition table, one input entry point.

| State | Top window | Bottom window | `→` | `←` | Enter / Space / click |
|---|---|---|---|---|---|
| `TITLE` | title card | teaser text | — | — | Start → `WALKING` |
| `WALKING` | character walks | "keep walking…" hint | `x++` | `x--` | — |
| `AT_EXHIBIT` | character stopped at pedestal | closed placard: *"Exhibit 3 — open it"* | open it | open it | open it → `EXHIBIT_OPEN` |
| `EXHIBIT_OPEN` | character idle | photo+caption, or quiz | close, `x++` | close, `x--` | (quiz: pick answer) |
| `PAUSED` | pause overlay | frozen | — | — | Resume / Exit |
| `FINISH` | finish card | closing message + score | — | — | Replay |

Rules that prevent the classic failure modes:

- **One input funnel.** Every key, click, and on-screen button calls `Game.handleInput(action)`, which `switch`es on `state`. No listener anywhere else in the codebase. This structurally prevents things like "arrow key answered the quiz" or "Start fired twice."
- **Quizzes gate advancement.** In `EXHIBIT_OPEN` on an unanswered quiz, `→` is ignored (with a small nudge animation on the choices) until a choice is picked. Photos advance freely.
- **Closing moves `x` by one** so you never land back on the same marker and re-open it in a loop.
- Any state entry is `setState(next)` → one `render()` call. No partial UI updates scattered around.

Flow end to end: Start → walk 4–7 presses → placard appears below → open → photo or quiz → `→` → walk again → … → last exhibit → a few more steps → finish screen.

---

## 5. Rendering

### Top window (`stage.js`)

- Fixed 50% height, `overflow: hidden`. Character sits **horizontally centered**; the *world* translates by `-x * STEP_PX`. This means the track can be any length and the character never runs off screen — no camera math, no bounds bugs.
- Character: a `<div>` with a background sprite. Starts as an emoji/CSS figure so the game is playable on day one; swapping in a PNG later is a one-line CSS change.
- Walk animation: CSS `transition: transform 220ms ease-out` on the world layer, plus a `.walking` class on the character for a 2-frame bob, removed on a `setTimeout(STEP_MS)` (not `transitionend` — that event can be missed if the tab loses focus). Facing direction via `scaleX(-1)`.
- A parallax back layer (clouds / wall panels) translating at ~0.4× gives depth for ~5 lines of code.
- Exhibit markers drawn as small picture frames / pedestals at each `positions[i]`, so you can see the next one approaching. Visited ones get a subtle "seen" tint.
- HUD: `Exhibit 2 / 9` progress, ⏸ pause, ✕ exit.
- Overlays (title / pause / finish) are absolutely-positioned `<div>`s toggled with the `hidden` attribute — no element creation/destruction, so no leaked listeners.

### Bottom window (`ui.js`)

- Fixed 50% height, its own `overflow: hidden`, content centered.
- **Photo:** `<img>` with `max-height: 100%; object-fit: contain;` so no aspect ratio ever breaks the 50/50 split. Caption below in a serif "museum label" style. All images are preloaded at Start (`new Image().src = ...`) so nothing pops in late.
- **Quiz:** question, then a 2×2 grid of 4 bubble buttons. On click: chosen-and-wrong turns red *and* the correct one turns green; chosen-and-right turns green. All buttons then disabled, optional `note` revealed, and *"press → to continue"* appears.
- Correct-answer count is tracked and shown on the finish screen ("You got 6 / 7 — you were paying attention.").

---

## 6. Robustness (explicit bug-prevention list)

Each of these is a known way this exact kind of game breaks:

1. **Held-down arrow key spam** → `if (e.repeat) return;` plus an `inputLocked` flag for the duration of the step animation. Prevents skipping past exhibits.
2. **Page scrolling / spacebar scroll** → `e.preventDefault()` on all handled keys; `html, body { height: 100%; overflow: hidden; }` and `100dvh` for iOS Safari's shrinking viewport.
3. **Double-open / double-close** → all transitions go through `setState`, which no-ops if already in the target state.
4. **Quiz clicked twice** → `quiz.locked` guard set on first click, before any DOM writes.
5. **Missing or typo'd photo filename** → `img.onerror` renders a graceful caption-only card instead of a broken-image icon, and logs the bad path.
6. **Malformed content** → `validateExhibits()` runs at boot: checks every photo has a `src` and `caption`, every quiz has exactly 4 `choices` and an `answer` in `0..3`, and reports problems both in the console and as a visible red banner. This catches the single most likely mistake (wrong answer index) before the game is ever gifted.
7. **Off-by-one at the ends** → `x` clamped once in a single `moveTo()` function; finish fires exactly once behind a `state !== FINISH` guard.
8. **Exit losing state** → Exit asks for confirmation, then calls one `resetGame()` that rebuilds all state from scratch (fresh track, fresh answers) rather than mutating pieces of the old state.
9. **Case-sensitive paths** → macOS is case-insensitive but GitHub Pages is not. Filenames go in lowercase-with-hyphens, noted in the README.
10. **Huge photos** → resize to ~1600 px on the long edge before adding, so the whole game stays a few MB and loads instantly.
11. **Playing on a phone** → on-screen `←` `→` buttons plus swipe/tap, all routed through the same `handleInput`. The 50/50 vertical split already works in portrait. Cheap insurance if you want to hand her a phone rather than a laptop.
12. **Testing the ending without 40 key presses** → `?debug=1` shows a small state readout (`state`, `x`, next marker), and `window.DEV = { jumpToExhibit(n), jumpToEnd(), reveal() }` is exposed for manual testing from the console.

---

## 7. Build order

| Phase | Deliverable | Done when |
|---|---|---|
| 1 | `index.html` + `styles.css`: 50/50 split, HUD, title/pause/finish overlays; `game.js` state machine skeleton with keyboard input | Start button moves you from title into a walkable empty stage |
| 2 | `stage.js`: track generation, world scroll, walk animation, markers, pause/exit | You can walk forward/back and stop on pedestals; progress counter is right |
| 3 | `exhibit-types.js` + `ui.js`: placard → photo renderer → quiz renderer, revisit memory, score | Both exhibit kinds fully playable with placeholder content |
| 4 | `exhibits.js`: your real photos and quiz text; `validateExhibits()` | Full playthrough start → finish with real content |
| 5 | Polish: art pass on the character and gallery, fonts/colors, optional music toggle, finish-screen message, mobile buttons | Looks like a gift, not a prototype |
| 6 | QA pass against the §6 checklist | Every item verified by hand |

Phases 1–3 are the engine and I can build them before you send any media — placeholder photos and dummy quizzes let it be fully playable, and phase 4 is then just dropping your files into `assets/photos/` and typing captions.

---

## 8. What I need from you (can come after phase 3)

1. **Photos** in `assets/photos/` — any count, any order.
2. **A caption per photo** (one or two lines reads best on the museum label).
3. **Quiz questions**: question text, 4 choices, which one is correct, and an optional one-line note revealed after answering.
4. **Two bits of text**: the title screen line and the finish screen message.
5. **Tone/palette preference** (warm gallery cream vs. dark modern museum vs. something bright) — affects phase 5 only.

## 9. Decisions worth confirming

- **Backward walking re-opens past exhibits** (my recommendation, §3) vs. `←` being purely cosmetic movement with no re-opening. Recommending the former: it makes the two-direction control meaningful and lets her go back for a second look at a photo.
- **`→` at a closed placard opens it** rather than skipping past it, so the entire game is playable with one key and no content can be accidentally missed. Configurable via `OPEN_ON_RIGHT` in `config.js`.
- **Steps between exhibits: random 4–7** by default (`MIN_STEPS` / `MAX_STEPS` in `config.js`), so pacing varies without ever being tedious.
