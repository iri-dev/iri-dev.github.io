(function () {
  'use strict';
  var root = document.getElementById('nails');
  var data = window.NAIL_STUDIO, art = window.NAIL_RENDERER, designer = window.NAIL_DESIGNER;
  if (!root || !data || !art || !designer) return;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var presets = new Map(data.presets.map(function (p) { return [p.id, p]; }));
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function button(text, className) { var b = el('button', className, text); b.type = 'button'; return b; }
  function matchingPreset(state) {
    return data.presets.find(function (p) { return Object.keys(p.state).every(function (key) { return p.state[key] === state[key]; }); });
  }
  function load(state, focus) {
    if (!designer.setState(state)) return;
    if (focus) {
      var title = root.querySelector('#ns-designer-title');
      title.scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'start' });
      title.focus({ preventScroll: true });
    }
  }
  function loadPreset(id, focus) { var p = presets.get(id); if (p) load(p.state, focus); }
  root.querySelector('[data-nail-signature]').append(art.render(data.presets[0].state, 'My signature design: deep amethyst medium-long almond nails with magnetic cat-eye shimmer and subtle silver details'));
  var collection = root.querySelector('[data-nail-collection]');
  var presetButtons = root.querySelector('[data-nail-presets]');
  data.presets.forEach(function (p, i) {
    var card = el('article', 'ns-set');
    card.dataset.set = p.id;
    card.style.setProperty('--set-tint', p.swatches[0]);
    var image = el('div', 'ns-set-art');
    image.append(el('span', 'ns-set-number', '0' + (i + 1)), art.render(p.state, p.name + ': ' + p.description), el('span', 'ns-set-label', p.label));
    var copy = el('div', 'ns-set-copy');
    copy.append(el('h5', '', p.name), el('p', 'ns-set-description', p.description));
    var swatches = el('div', 'ns-set-swatches');
    swatches.setAttribute('aria-label', 'Design colors: ' + p.swatches.join(', '));
    p.swatches.forEach(function (colour) { var swatch = el('span'); swatch.style.backgroundColor = colour; swatch.setAttribute('aria-hidden', 'true'); swatches.append(swatch); });
    var tryButton = button('Try this set ↗', 'ns-link');
    tryButton.dataset.loadNail = p.id;
    tryButton.setAttribute('aria-label', 'Load ' + p.name + ' into the nail designer');
    copy.append(swatches, el('p', 'ns-set-note', p.note), tryButton);
    card.append(image, copy); collection.append(card);
    var preset = button(p.name, 'ns-preset');
    preset.dataset.nailPreset = p.id;
    preset.setAttribute('aria-pressed', 'false');
    preset.setAttribute('aria-controls', 'nail-card');
    presetButtons.append(preset);
  });
  root.addEventListener('click', function (event) {
    var b = event.target.closest('[data-load-nail], [data-nail-preset]');
    if (!b || !root.contains(b)) return;
    loadPreset(b.dataset.loadNail || b.dataset.nailPreset, b.hasAttribute('data-load-nail'));
  });
  function syncDesign(state) {
    var p = matchingPreset(state);
    root.querySelector('[data-nail-design-name]').textContent = p ? p.name : 'A little something I made';
    root.querySelector('[data-nail-design-note]').textContent = p ? p.note : 'Your colors, your shape, your tiny masterpiece. Keep playing until it feels like you.';
    root.querySelector('[data-nail-color-name]').textContent = ' / ' + state.colour;
    presetButtons.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(!!p && b.dataset.nailPreset === p.id)); });

  }
  root.addEventListener('nailchange', function (event) { syncDesign(event.detail); });
  syncDesign(designer.getState());

  var opinions = root.querySelector('[data-nail-opinions]');
  data.opinions.forEach(function (opinion, i) { var note = el('article', 'ns-opinion'); note.style.setProperty('--tilt', (i % 2 ? 1 : -1.3) + 'deg'); note.append(el('h5', '', opinion[0]), el('p', '', opinion[1])); opinions.append(note); });
  var notebook = root.querySelector('[data-nail-notebook]');
  data.notebook.forEach(function (entry) { var row = el('div'); row.append(el('dt', '', entry[0]), el('dd', '', entry[1])); notebook.append(row); });

})();
