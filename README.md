# The Museum

A tiny walking gallery: walk left/right along a track, stop at exhibits,
look at photos or answer quizzes about the two of you. Plain HTML/CSS/JS,
no build step, no dependencies. See [PLAN.md](PLAN.md) for the design.

## Running it

Just open `index.html` in a browser (double-click it, or drag it into a
tab). Everything is a `file://` page — no server required.

If you'd rather use a local server (optional):

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

Add `?debug=1` to the URL for a small on-screen state readout and a
`window.DEV` console helper (`DEV.jumpToExhibit(n)`, `DEV.jumpToEnd()`,
`DEV.reveal()`) so you can test the ending without walking the whole track.

## Adding your own content

Everything you need to touch lives in **[js/exhibits.js](js/exhibits.js)**:
it's a single ordered array of `Photo({...})` and `Quiz({...})` entries.
Reordering the game = reordering the lines.

```js
Photo({
  src: 'assets/photos/first-date.jpg',
  caption: 'Our first date — you ordered the wrong thing on purpose.',
  steps: 5,        // optional: how many steps to walk to reach this one
}),

Quiz({
  question: 'Where did we first meet?',
  choices: ['The library', 'A party', 'Class', 'The dining hall'],
  answer: 2,       // 0-indexed → 'Class'
  note: 'Row 3, and you were late.',   // optional
  steps: 6,
}),
```

Notes:

- `steps` is manual, per exhibit — it's the walk distance from whatever
  came before it (or from the start, for the first one). Leave it off and
  it falls back to `DEFAULT_STEPS` in `js/config.js`.
- Quizzes need exactly 4 choices. Getting the `answer` index wrong is the
  single most likely mistake — a red banner (and a `console.error`) will
  tell you at load time if something's off.
- Photos go in `assets/photos/`. **Use lowercase-with-hyphens filenames**
  (`first-date.jpg`, not `FirstDate.JPG`) — macOS doesn't care about case,
  but GitHub Pages does, so a mismatch works locally and breaks once
  deployed.
- Resize photos to ~1600px on the long edge before adding them, so the
  whole game stays a few MB and loads instantly.
- Walking backward re-opens past exhibits, and quizzes remember how you
  answered them, so revisiting one shows its already-revealed state.

Other things worth editing in `js/config.js`:

- `TITLE` / `TITLE_SUBTITLE` — the title screen text.
- `FINISH_TITLE` / `FINISH_MESSAGE` — the closing screen text.
- `OPEN_ON_RIGHT` — whether `→` at a closed exhibit opens it directly
  (`true`, recommended) or just walks past it, requiring Enter/click to open.

## Deploying to GitHub Pages

This repo is already static, so there's no build step to configure:

1. Push this repo to GitHub (`main` branch).
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy
   from a branch**, then pick **Branch: main, folder: / (root)**.
3. Save. Your game will be live at
   `https://<your-username>.github.io/<repo-name>/` within a minute or two.

All asset paths in the code are relative (`assets/photos/...`,
`css/styles.css`, etc.), so it works the same whether it's opened from
`file://`, a local server, or a GitHub Pages subpath.

## File layout

```
index.html            structure: stage, exhibit pane, overlays
css/styles.css         all styling
js/config.js           tunables
js/exhibit-types.js    Photo()/Quiz() factories + renderers + validation
js/exhibits.js         ★ the content — edit this one
js/stage.js            top window: character, track, camera, clouds
js/ui.js               bottom window: placard/photo/quiz rendering
js/game.js             state machine, input routing, boot
assets/photos/         your images (placeholders in there now)
assets/audio/          optional background track
```
