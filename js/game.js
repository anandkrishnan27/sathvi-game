// State machine, input routing, progression, boot. Every key, click, and
// on-screen button funnels through handleInput() — nothing else listens.
var Game = (function () {
  var STATE = {
    TITLE: 'TITLE',
    WALKING: 'WALKING',
    AT_EXHIBIT: 'AT_EXHIBIT',
    EXHIBIT_OPEN: 'EXHIBIT_OPEN',
    PAUSED: 'PAUSED',
    FINISH: 'FINISH',
  };

  var state = STATE.TITLE;
  var prevState = STATE.WALKING;
  var x = 0;
  var positions = [];
  var endX = 0;
  var answered = [];
  var correctCount = 0;
  var inputLocked = false;
  var els = {};

  function init() {
    els.root = document.getElementById('game-root');
    els.titleOverlay = document.getElementById('title-overlay');
    els.pauseOverlay = document.getElementById('pause-overlay');
    els.finishOverlay = document.getElementById('finish-overlay');
    els.exitConfirm = document.getElementById('exit-confirm');
    els.finishScore = document.getElementById('finish-score');

    var errors = validateExhibits(EXHIBITS);
    if (errors.length) showErrorBanner(errors);

    document.getElementById('title-text').textContent = GAME_CONFIG.TITLE;
    document.getElementById('title-subtitle').textContent = GAME_CONFIG.TITLE_SUBTITLE;
    document.getElementById('finish-title').textContent = GAME_CONFIG.FINISH_TITLE;
    document.getElementById('finish-message').textContent = GAME_CONFIG.FINISH_MESSAGE;

    UI.init(els.root);
    rebuildTrack();
    UI.preload(EXHIBITS);

    bindInput();
    setupDebug();
    render();
  }

  function rebuildTrack() {
    var track = Stage.init(els.root, EXHIBITS);
    positions = track.positions;
    endX = track.endX;
    x = 0;
    answered = EXHIBITS.map(function () { return null; });
    correctCount = 0;
  }

  // --- input -----------------------------------------------------------

  function bindInput() {
    document.addEventListener('keydown', function (e) {
      if (e.repeat) return;
      var action = null;
      if (e.key === 'ArrowRight') action = 'right';
      else if (e.key === 'ArrowLeft') action = 'left';
      else if (e.key === 'Enter' || e.key === ' ') action = 'confirm';
      else if (e.key === 'Escape') action = 'pause';
      if (!action) return;
      e.preventDefault();
      handleInput(action);
    });

    document.body.addEventListener('click', function (e) {
      var actionEl = e.target.closest('[data-action]');
      if (actionEl) { handleInput(actionEl.dataset.action); return; }
      var choiceEl = e.target.closest('.quiz-choice');
      if (choiceEl) handleInput('pick:' + choiceEl.dataset.choice);
    });
  }

  function handleInput(action) {
    if (inputLocked && (action === 'right' || action === 'left')) return;

    switch (state) {
      case STATE.TITLE:
        if (action === 'confirm') startGame();
        break;

      case STATE.WALKING:
        if (action === 'right') step(1);
        else if (action === 'left') step(-1);
        else if (action === 'pause') pause();
        else if (action === 'exit-request') requestExit();
        break;

      case STATE.AT_EXHIBIT:
        if (action === 'right') { if (GAME_CONFIG.OPEN_ON_RIGHT) openExhibit(); else step(1); }
        else if (action === 'left') step(-1);
        else if (action === 'confirm') openExhibit();
        else if (action === 'pause') pause();
        else if (action === 'exit-request') requestExit();
        break;

      case STATE.EXHIBIT_OPEN:
        handleOpenInput(action);
        break;

      case STATE.PAUSED:
        if (action === 'resume') resume();
        else if (action === 'exit-request') requestExit();
        else if (action === 'exit-confirmed') { els.exitConfirm.hidden = true; rebuildTrack(); setState(STATE.TITLE); }
        else if (action === 'exit-cancel') els.exitConfirm.hidden = true;
        break;

      case STATE.FINISH:
        if (action === 'confirm') { rebuildTrack(); setState(STATE.TITLE); }
        break;
    }
  }

  function handleOpenInput(action) {
    var idx = currentIndex();
    var exhibit = EXHIBITS[idx];

    if (action.indexOf('pick:') === 0) {
      if (exhibit.type !== 'quiz' || answered[idx] != null) return;
      var picked = Number(action.slice(5));
      answered[idx] = picked;
      if (picked === exhibit.answer) correctCount++;
      render();
      return;
    }

    if (action === 'right') {
      if (exhibit.type === 'quiz' && answered[idx] == null) { nudgeChoices(); return; }
      step(1);
    } else if (action === 'left') {
      step(-1);
    } else if (action === 'pause') {
      pause();
    } else if (action === 'exit-request') {
      requestExit();
    }
  }

  function nudgeChoices() {
    var grid = UI.getPane().querySelector('.quiz-grid');
    if (!grid) return;
    grid.classList.add('nudge');
    setTimeout(function () { grid.classList.remove('nudge'); }, 300);
  }

  // --- movement / progression ------------------------------------------

  function currentIndex() {
    return positions.indexOf(x);
  }

  function displayIndex() {
    var idx = currentIndex();
    if (idx !== -1) return idx + 1;
    for (var i = 0; i < positions.length; i++) {
      if (positions[i] > x) return i + 1;
    }
    return EXHIBITS.length;
  }

  function step(dir) {
    var newX = clamp(x + dir, 0, endX);
    if (newX === x) return;
    x = newX;
    inputLocked = true;
    setState(STATE.WALKING);
    Stage.moveTo(x, dir);
    setTimeout(function () {
      inputLocked = false;
      checkArrival();
    }, GAME_CONFIG.STEP_MS);
  }

  function checkArrival() {
    if (x === endX) { finish(); return; }
    setState(currentIndex() !== -1 ? STATE.AT_EXHIBIT : STATE.WALKING);
  }

  function openExhibit() {
    Stage.markVisited(currentIndex());
    setState(STATE.EXHIBIT_OPEN);
  }

  function startGame() {
    setState(STATE.WALKING);
    checkArrival();
  }

  function pause() {
    prevState = state;
    setState(STATE.PAUSED);
  }

  function resume() {
    setState(prevState);
  }

  function requestExit() {
    // Exit can be requested straight from the pause menu, where `state` is
    // already PAUSED — don't clobber the state Resume should return to.
    if (state !== STATE.PAUSED) prevState = state;
    setState(STATE.PAUSED);
    els.exitConfirm.hidden = false;
  }

  function finish() {
    setState(STATE.FINISH);
    var quizTotal = EXHIBITS.filter(function (ex) { return ex.type === 'quiz'; }).length;
    els.finishScore.textContent = quizTotal
      ? 'You got ' + correctCount + ' / ' + quizTotal + ' right.'
      : '';
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // --- rendering ---------------------------------------------------------

  function setState(next) {
    if (state === next) return;
    state = next;
    els.exitConfirm.hidden = true;
    render();
  }

  function render() {
    els.titleOverlay.hidden = state !== STATE.TITLE;
    els.pauseOverlay.hidden = state !== STATE.PAUSED;
    els.finishOverlay.hidden = state !== STATE.FINISH;

    if (state === STATE.WALKING) {
      UI.showWalking();
    } else if (state === STATE.AT_EXHIBIT) {
      UI.showClosed(currentIndex(), EXHIBITS.length);
    } else if (state === STATE.EXHIBIT_OPEN) {
      var idx = currentIndex();
      UI.showOpen(EXHIBITS[idx], answered[idx] != null ? { picked: answered[idx] } : null);
    }

    if (state === STATE.WALKING || state === STATE.AT_EXHIBIT || state === STATE.EXHIBIT_OPEN) {
      Stage.setHud(displayIndex(), EXHIBITS.length);
    }

    updateDebugReadout();
  }

  // --- robustness helpers --------------------------------------------

  function showErrorBanner(errors) {
    errors.forEach(function (e) { console.error(e); });
    var banner = document.createElement('div');
    banner.className = 'error-banner';
    banner.textContent = 'Content problems: ' + errors.join(' • ');
    document.body.appendChild(banner);
  }

  var debugEl = null;
  function setupDebug() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('debug') !== '1') return;

    debugEl = document.createElement('div');
    debugEl.className = 'debug-readout';
    document.body.appendChild(debugEl);

    window.DEV = {
      jumpToExhibit: function (n) {
        if (n < 0 || n >= positions.length) return;
        x = positions[n];
        Stage.moveTo(x);
        checkArrival();
      },
      jumpToEnd: function () {
        x = endX;
        Stage.moveTo(x);
        checkArrival();
      },
      reveal: function () {
        var idx = currentIndex();
        if (idx !== -1 && EXHIBITS[idx].type === 'quiz') {
          answered[idx] = EXHIBITS[idx].answer;
          render();
        }
      },
    };
  }

  function updateDebugReadout() {
    if (!debugEl) return;
    debugEl.textContent = 'state=' + state + ' x=' + x + ' next=' + JSON.stringify(positions[currentIndex() + 1]);
  }

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', Game.init);
