/* The original five-nail designer, with shared illustrations and an expanded polish drawer. */
(function () {
  'use strict';
  var root = document.getElementById('nails');
  var card = document.getElementById('nail-card');
  var data = window.NAIL_STUDIO, renderer = window.NAIL_RENDERER;
  if (!root || !card || !data || !renderer) return;
  var state = renderer.copy(data.presets[0].state);
  function button(text, attr, value, parent) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = text;
    b.setAttribute('data-' + attr, value); b.setAttribute('aria-pressed', 'false');
    parent.append(b);
    return b;
  }
  Object.keys(data.colours).forEach(function (colour) {
    var b = button('', 'colour', colour, root.querySelector('[data-nail-colours]'));
    b.className = 'polish'; b.setAttribute('aria-label', colour); b.title = colour;
    b.style.setProperty('--polish', data.colours[colour]); b.append(document.createElement('span'));
  });
  [['shape', data.shapes.map(function (v) { return [v, v]; })], ['len', Object.entries(data.lengths).sort(function (a, b) { return Number(a[0]) - Number(b[0]); })], ['finish', Object.entries(data.finishes)], ['art', Object.entries(data.art)]].forEach(function (group) {
    var list = root.querySelector('[data-nail-options="' + group[0] + '"]');
    group[1].forEach(function (row) { button(row[1], group[0], row[0], list); });
  });
  function draw() {
    card.replaceChildren(renderer.render(state));
    document.getElementById('nail-caption').textContent = renderer.describe(state) + ' ♡';
    [['colour', 'colour'], ['shape', 'shape'], ['len', 'length'], ['finish', 'finish'], ['art', 'art']].forEach(function (pair) {
      root.querySelectorAll('[data-' + pair[0] + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset[pair[0]] === String(state[pair[1]]))); });
    });
    root.dispatchEvent(new CustomEvent('nailchange', { detail: renderer.copy(state) }));
  }
  root.addEventListener('click', function (event) {
    var b = event.target.closest('[data-colour], [data-shape], [data-len], [data-finish], [data-art]');
    if (!b || !root.contains(b)) return;
    var next = renderer.copy(state);
    [['colour', 'colour'], ['shape', 'shape'], ['len', 'length'], ['finish', 'finish'], ['art', 'art']].forEach(function (pair) {
      if (b.hasAttribute('data-' + pair[0])) next[pair[1]] = pair[1] === 'length' ? Number(b.dataset[pair[0]]) : b.dataset[pair[0]];
    });
    if (!renderer.valid(next)) return;
    state = next; draw();
  });
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  document.getElementById('nail-random').addEventListener('click', function () {
    state = { colour: pick(Object.keys(data.colours)), shape: pick(data.shapes), length: Number(pick(Object.keys(data.lengths))), finish: pick(Object.keys(data.finishes)), art: pick(Object.keys(data.art)) };
    draw();
  });
  window.NAIL_DESIGNER = {
    getState: function () { return renderer.copy(state); },
    setState: function (next) { if (!renderer.valid(next)) return false; state = renderer.copy(next); draw(); return true; }
  };
  draw();
})();
