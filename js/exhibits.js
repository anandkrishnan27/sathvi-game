// ★ THE ONLY FILE YOU EDIT for content. Reordering the game = reordering
// these lines. Every photo currently in assets/photos/ is listed below,
// back to back, in no particular order — reorder them, mix in Quiz({...})
// entries, and rewrite the captions as you like.
//
// `steps` controls the walk distance to that exhibit from whatever came
// before it (or from the start, for the first exhibit). Leave it off to
// use GAME_CONFIG.DEFAULT_STEPS.

var EXHIBITS = [
  Photo({ src: "assets/photos/one.JPEG", caption: "First CalypsLit!" }),
  Photo({ src: "assets/photos/two.JPG", caption: "Your quarterzip I guess" }),
  Photo({
    src: "assets/photos/three.JPG",
    caption: "I didn't really like the pasta but something else was pretty fun",
  }),
  Quiz({
    question: "WHEN is our anniversary?",
    choices: ["Jan 6th RAAAAH", "Jan 5th", "Nov 1st", "Jun 24th"],
    answer: 1,
  }),
  Photo({ src: "assets/photos/four.jpg", caption: "ROCK" }),
  Photo({
    src: "assets/photos/five.jpg",
    caption:
      "Will never learn how to skate and that's fine! (you can always push me)",
  }),
  Photo({
    src: "assets/photos/six.JPG",
    caption: "I think this photo made you mad...",
  }),
  Photo({ src: "assets/photos/seven.JPG", caption: "Memorable first melt" }),
  Photo({ src: "assets/photos/eight.jpg", caption: "VIOLIN CONZIRD" }),
  Quiz({
    question: "WHICH song will sabi numpi someday sing together?",
    choices: [
      "chinnanjiru kiliye",
      "titi me pregunto",
      "a dios le pido",
      "war pigs",
    ],
    answer: 0,
    note: "though maybe they all would be cool",
  }),
  Photo({ src: "assets/photos/nine.jpg", caption: "Sabi gets a FUG" }),
  Photo({
    src: "assets/photos/ten.JPG",
    caption: "Someone wasn't in Donner...",
  }),
  Photo({
    src: "assets/photos/eleven.JPG",
    caption: "Moments before a very fun and healthy night",
  }),
  Photo({ src: "assets/photos/twelve.JPG", caption: "Sailors are we" }),
  Photo({ src: "assets/photos/13.JPG", caption: "Lil Gujju dancey dance" }),
  Photo({ src: "assets/photos/14.JPG", caption: "Ahoy there matey!" }),
  Quiz({
    question: "WHAT is the airspeed velocity of an unladen swallow?",
    choices: ["11 m/s", "24 m/s", "Wat da hek", "African or European swallow?"],
    answer: 3,
    note: "AAAAAAAAH *falls off cliff*",
  }),
  Photo({ src: "assets/photos/15.JPG", caption: "Cheer on third down!! " }),
  Photo({ src: "assets/photos/16.JPG", caption: "Long awaited carousel" }),
  Photo({
    src: "assets/photos/17.JPG",
    caption: "Gotts was worth the physics pain",
  }),
  Photo({
    src: "assets/photos/18.JPG",
    caption: "My body is a temple, not your dinner",
  }),
  Photo({
    src: "assets/photos/19.JPG",
    caption: "Standard salt and straw reaction",
  }),
  Quiz({
    question: "WHAT gift did sabi give numpi that he really liked?",
    choices: [
      "a dinosaur",
      "a book that she painted",
      "a GREEN SWEATER",
      "all of da above",
    ],
    answer: 3,
    note: "always room for more!",
  }),
  Photo({
    src: "assets/photos/20.PNG",
    caption: "You really find this picture funny don't you",
  }),
  Photo({ src: "assets/photos/21.JPG", caption: "Matching!" }),
  Photo({
    src: "assets/photos/22.JPG",
    caption: "Monet and some W pizza to follow",
  }),
  Photo({
    src: "assets/photos/23.JPG",
    caption: "I think you might have color in your teeth, idk for sure though",
  }),
  Quiz({
    question: "WHERE are we going after senior year",
    choices: ["ur mom's house", "EUROPE", "HAWAII", "INDIA"],
    answer: 1,
    note: "honestly probably to all of them who knows",
  }),
  Photo({ src: "assets/photos/24.JPG", caption: "EL AYYYYY" }),
];
