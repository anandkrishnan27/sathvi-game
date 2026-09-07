// Photo() and Quiz() factories, plus the renderers that turn an exhibit
// object into the HTML shown in the bottom pane. Adding a third exhibit
// kind later is one factory here + one entry in RENDERERS.

function Photo(opts) {
  return {
    type: 'photo',
    src: opts.src,
    caption: opts.caption || '',
    alt: opts.alt || opts.caption || 'photo',
    steps: opts.steps, // optional; falls back to GAME_CONFIG.DEFAULT_STEPS
  };
}

function Quiz(opts) {
  return {
    type: 'quiz',
    question: opts.question,
    choices: opts.choices || [],
    answer: opts.answer,
    note: opts.note || '',
    steps: opts.steps,
  };
}

function escapeHtml(value) {
  var div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}

function validateExhibits(list) {
  var errors = [];
  list.forEach(function (ex, i) {
    if (ex.type === 'photo') {
      if (!ex.src) errors.push('Exhibit ' + i + ': photo is missing a src');
      if (!ex.caption) errors.push('Exhibit ' + i + ': photo is missing a caption');
    } else if (ex.type === 'quiz') {
      if (!ex.question) errors.push('Exhibit ' + i + ': quiz is missing a question');
      if (!ex.choices || ex.choices.length !== 4) errors.push('Exhibit ' + i + ': quiz needs exactly 4 choices');
      if (typeof ex.answer !== 'number' || ex.answer < 0 || ex.answer > 3) errors.push('Exhibit ' + i + ': quiz answer must be 0-3');
    } else {
      errors.push('Exhibit ' + i + ': unknown exhibit type "' + ex.type + '"');
    }
  });
  return errors;
}

var RENDERERS = {
  photo: function (exhibit) {
    return (
      '<img class="photo-img" src="' + exhibit.src + '" alt="' + escapeHtml(exhibit.alt) + '" ' +
      'onerror="this.classList.add(\'photo-broken\');this.removeAttribute(\'src\');console.error(\'Missing photo: ' + exhibit.src + '\');" />' +
      '<p class="photo-caption">' + escapeHtml(exhibit.caption) + '</p>'
    );
  },

  quiz: function (exhibit, state) {
    var picked = state ? state.picked : null;
    var html = '<p class="quiz-question">' + escapeHtml(exhibit.question) + '</p>';
    html += '<div class="quiz-grid">';
    exhibit.choices.forEach(function (choice, i) {
      var cls = 'quiz-choice';
      if (picked != null) {
        if (i === exhibit.answer) cls += ' correct';
        else if (i === picked) cls += ' wrong';
      }
      html += '<button class="' + cls + '" data-choice="' + i + '"' + (picked != null ? ' disabled' : '') + '>' +
        escapeHtml(choice) + '</button>';
    });
    html += '</div>';
    if (picked != null) {
      if (exhibit.note) html += '<p class="quiz-note">' + escapeHtml(exhibit.note) + '</p>';
      html += '<p class="quiz-continue">press &rarr; to continue</p>';
    }
    return html;
  },
};
