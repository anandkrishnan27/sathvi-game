// Tunables. Nothing here is game logic — safe to tweak freely.
var GAME_CONFIG = {
  STEP_PX: 90,          // pixels the world scrolls per step
  STEP_MS: 220,         // walk animation duration

  // Manual pacing: each exhibit in exhibits.js can set its own `steps`
  // (distance from the previous point). DEFAULT_STEPS is used for any
  // exhibit that doesn't specify one. END_STEPS is the walk from the
  // last exhibit to the finish line.
  DEFAULT_STEPS: 5,
  END_STEPS: 5,

  // '→' on a closed placard opens it immediately instead of walking past it.
  OPEN_ON_RIGHT: true,

  TITLE: 'The Museum',
  TITLE_SUBTITLE: 'A little walk through us.',
  FINISH_TITLE: "That's the whole gallery.",
  FINISH_MESSAGE: 'Thanks for wandering through with me.',
};
