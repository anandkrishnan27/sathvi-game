// ★ THE ONLY FILE YOU EDIT for content. Reordering the game = reordering
// these lines. Photos/quizzes below are placeholders — swap them out and
// put them in whatever order you like.
//
// `steps` controls the walk distance to that exhibit from whatever came
// before it (or from the start, for the first exhibit). Leave it off to
// use GAME_CONFIG.DEFAULT_STEPS.

var EXHIBITS = [
  Photo({
    src: 'assets/photos/placeholder-1.svg',
    caption: 'Placeholder caption — swap this photo and text.',
    steps: 4,
  }),

  Quiz({
    question: 'Placeholder question — where did we first meet?',
    choices: ['The library', 'A party', 'Class', 'The dining hall'],
    answer: 2,
    note: 'Placeholder note, revealed after answering.',
    steps: 6,
  }),

  Photo({
    src: 'assets/photos/placeholder-2.svg',
    caption: 'Another placeholder caption.',
    steps: 5,
  }),

  Quiz({
    question: 'Placeholder question #2?',
    choices: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
    answer: 0,
    steps: 5,
  }),
];
