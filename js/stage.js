// Top window: character, track, camera (world scroll), walk animation.
var Stage = (function () {
  var worldEl, charEl, trackEl, cloudsEl, hudEl;
  var positions = [];
  var endX = 0;

  function init(root, exhibits) {
    worldEl = root.querySelector('.world');
    charEl = root.querySelector('.character');
    trackEl = root.querySelector('.track');
    cloudsEl = root.querySelector('.clouds');
    hudEl = root.querySelector('.hud-progress');

    buildTrack(exhibits);
    renderMarkers(exhibits);
    if (!cloudsEl.childElementCount) renderClouds();
    worldEl.style.transform = 'translateX(0px)';
    cloudsEl.style.transform = 'translateX(0px)';
    charEl.classList.remove('walking', 'facing-left');

    return { positions: positions, endX: endX };
  }

  function buildTrack(exhibits) {
    var x = 0;
    positions = exhibits.map(function (ex) {
      x += typeof ex.steps === 'number' ? ex.steps : GAME_CONFIG.DEFAULT_STEPS;
      return x;
    });
    endX = x + GAME_CONFIG.END_STEPS;
  }

  function renderMarkers(exhibits) {
    trackEl.innerHTML = '';
    positions.forEach(function (pos, i) {
      var marker = document.createElement('div');
      marker.className = 'marker';
      marker.dataset.index = i;
      marker.style.left = pos * GAME_CONFIG.STEP_PX + 'px';
      marker.innerHTML =
        '<div class="frame">' + (exhibits[i].type === 'quiz' ? '?' : '🖼') + '</div>' +
        '<div class="pedestal"></div>';
      trackEl.appendChild(marker);
    });

    var finish = document.createElement('div');
    finish.className = 'marker finish-marker';
    finish.style.left = endX * GAME_CONFIG.STEP_PX + 'px';
    finish.innerHTML = '<div class="finish-flag">🏁</div>';
    trackEl.appendChild(finish);
  }

  var CLOUD_PARALLAX = 0.4;

  function renderClouds() {
    // Clouds scroll slower than the track (CLOUD_PARALLAX), so they need to
    // span further than the track itself to stay visible for the full walk.
    var span = (endX * GAME_CONFIG.STEP_PX) / CLOUD_PARALLAX + window.innerWidth;
    var count = Math.ceil(span / 260) + 1;
    for (var i = 0; i < count; i++) {
      var cloud = document.createElement('div');
      cloud.className = 'cloud cloud-' + (i % 3);
      cloud.style.top = 8 + Math.random() * 55 + '%';
      cloud.style.left = i * 260 + Math.random() * 140 + 'px';
      cloudsEl.appendChild(cloud);
    }
  }

  function moveTo(x, direction) {
    var offset = -x * GAME_CONFIG.STEP_PX;
    worldEl.style.transform = 'translateX(' + offset + 'px)';
    cloudsEl.style.transform = 'translateX(' + offset * CLOUD_PARALLAX + 'px)';
    charEl.classList.add('walking');
    if (direction) charEl.classList.toggle('facing-left', direction < 0);
    setTimeout(function () {
      charEl.classList.remove('walking');
    }, GAME_CONFIG.STEP_MS);
  }

  function markVisited(index) {
    var marker = trackEl.querySelector('.marker[data-index="' + index + '"]');
    if (marker) marker.classList.add('visited');
  }

  function setHud(displayIndex, total) {
    hudEl.textContent = 'Exhibit ' + displayIndex + ' / ' + total;
  }

  return {
    init: init,
    moveTo: moveTo,
    markVisited: markVisited,
    setHud: setHud,
    getPositions: function () { return positions; },
    getEndX: function () { return endX; },
  };
})();
