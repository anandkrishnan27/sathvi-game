// Bottom window: placard / photo / quiz rendering.
var UI = (function () {
  var paneEl;

  function init(root) {
    paneEl = root.querySelector('.exhibit-pane');
  }

  function preload(exhibits) {
    exhibits.forEach(function (ex) {
      if (ex.type === 'photo') {
        var img = new Image();
        img.src = ex.src;
      }
    });
  }

  function showWalking() {
    paneEl.innerHTML = '<p class="hint">keep walking&hellip;</p>';
  }

  function showClosed(index, total) {
    paneEl.innerHTML =
      '<div class="placard">' +
      '<p class="placard-label">Exhibit ' + (index + 1) + ' / ' + total + '</p>' +
      '<button class="open-btn" data-action="confirm">Open it</button>' +
      '</div>';
  }

  function showOpen(exhibit, quizState) {
    paneEl.innerHTML = '<div class="exhibit-card">' + RENDERERS[exhibit.type](exhibit, quizState) + '</div>';
  }

  function getPane() {
    return paneEl;
  }

  return {
    init: init,
    preload: preload,
    showWalking: showWalking,
    showClosed: showClosed,
    showOpen: showOpen,
    getPane: getPane,
  };
})();
