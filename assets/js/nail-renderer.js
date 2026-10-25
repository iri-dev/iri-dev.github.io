(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var data = window.NAIL_STUDIO;
  var sequence = 0;
  var LENGTHS = { 1: 46, 2: 70, 2.5: 85, 3: 100 };
  var FINGERS = [{ w: 44, s: .92 }, { w: 36, s: 1 }, { w: 38, s: 1.06 }, { w: 36, s: 1 }, { w: 30, s: .86 }];

  function el(tag, attrs, parent) {
    var node = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    if (parent) parent.appendChild(node);
    return node;
  }
  function tint(hex, amount) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgb(' + [n >> 16, (n >> 8) & 255, n & 255].map(function (v) { return Math.round(v + (amount > 0 ? 255 - v : v) * amount); }).join(',') + ')';
  }
  function shapePath(shape, w, L) {
    var h = w / 2, cut = 'Q' + h + ' ' + (L - 12) + ' 0 ' + L + 'Z';
    switch (shape) {
      case 'square': return 'M0 ' + L + 'V8Q0 0 8 0H' + (w - 8) + 'Q' + w + ' 0 ' + w + ' 8V' + L + cut;
      case 'round': return 'M0 ' + L + 'V' + h + 'A' + h + ' ' + h + ' 0 0 1 ' + w + ' ' + h + 'V' + L + cut;
      case 'coffin': return 'M0 ' + L + 'L' + (w * .2) + ' 6Q' + (w * .22) + ' 0 ' + (w * .32) + ' 0H' + (w * .68) + 'Q' + (w * .78) + ' 0 ' + (w * .8) + ' 6L' + w + ' ' + L + cut;
      case 'stiletto': return 'M0 ' + L + 'C0 ' + (L * .5) + ' ' + (w * .38) + ' ' + (L * .14) + ' ' + h + ' 0C' + (w * .62) + ' ' + (L * .14) + ' ' + w + ' ' + (L * .5) + ' ' + w + ' ' + L + cut;
      default: return 'M0 ' + L + 'C0 ' + (L * .32) + ' ' + (w * .26) + ' 0 ' + h + ' 0C' + (w * .74) + ' 0 ' + w + ' ' + (L * .32) + ' ' + w + ' ' + L + cut;
    }
  }
  function heartD(cx, cy, s) {
    return 'M' + cx + ' ' + (cy + s) + 'C' + (cx - s * .2) + ' ' + (cy + s * .8) + ' ' + (cx - s) + ' ' + (cy + s * .3) + ' ' + (cx - s) + ' ' + (cy - s * .2) +
      'C' + (cx - s) + ' ' + (cy - s * .75) + ' ' + (cx - s * .2) + ' ' + (cy - s * .85) + ' ' + cx + ' ' + (cy - s * .35) +
      'C' + (cx + s * .2) + ' ' + (cy - s * .85) + ' ' + (cx + s) + ' ' + (cy - s * .75) + ' ' + (cx + s) + ' ' + (cy - s * .2) +
      'C' + (cx + s) + ' ' + (cy + s * .3) + ' ' + (cx + s * .2) + ' ' + (cy + s * .8) + ' ' + cx + ' ' + (cy + s) + 'Z';
  }
  function star(cx, cy, radius, parent, fill, points) {
    var coords = [];
    for (var i = 0; i < points * 2; i++) {
      var a = i * Math.PI / points - Math.PI / 2, r = i % 2 ? radius * .32 : radius;
      coords.push((cx + Math.cos(a) * r) + ',' + (cy + Math.sin(a) * r));
    }
    el('polygon', { points: coords.join(' '), fill: fill }, parent);
  }
  function valid(state) {
    return state && typeof state === 'object' && !Array.isArray(state) &&
      typeof state.colour === 'string' && typeof state.finish === 'string' && typeof state.art === 'string' &&
      Object.hasOwn(data.colours, state.colour) && data.shapes.includes(state.shape) &&
      typeof state.length === 'number' && Object.hasOwn(data.lengths, state.length) &&
      Object.hasOwn(data.finishes, state.finish) && Object.hasOwn(data.art, state.art);
  }
  function copy(state) { return { colour: state.colour, shape: state.shape, length: state.length, finish: state.finish, art: state.art }; }
  function describe(state) { return state.colour + ' · ' + data.lengths[state.length] + ' ' + state.shape + ' · ' + data.finishes[state.finish] + (state.art === 'none' ? '' : ' · ' + data.art[state.art]); }
  function render(state, label) {
    if (!valid(state)) throw new TypeError('Invalid nail design');
    var prefix = 'ns-art-' + (++sequence) + '-';
    var colour = data.colours[state.colour];
    var svg = el('svg', { xmlns: NS, viewBox: '0 0 440 230', role: 'img', 'aria-label': label || 'Illustration of five press-on nails: ' + describe(state) });
    var defs = el('defs', {}, svg);
    function gradient(name, stops, attrs) {
      var id = prefix + name;
      var g = el('linearGradient', Object.assign({ id: id, x1: '0%', y1: '0%', x2: '100%', y2: '0%' }, attrs), defs);
      stops.forEach(function (stop) { el('stop', { offset: stop[0], 'stop-color': stop[1] }, g); });
      return 'url(#' + id + ')';
    }
    var silver = gradient('silver', [[0, '#7d859a'], [.23, '#f8f9ff'], [.47, '#afb9ce'], [.7, '#fff'], [1, '#8791a8']]);
    var pearl = gradient('pearl', [[0, '#dfd9e8'], [.3, '#fffaf5'], [.6, '#f1d9ec'], [.8, '#f9fcff'], [1, '#c5c8df']], { y2: '100%' });
    var fill = gradient('body', [[0, tint(colour, -.26)], [.2, colour], [.55, tint(colour, .16)], [.8, colour], [1, tint(colour, -.3)]]);
    if (state.finish === 'chrome') fill = gradient('chrome', [[0, tint(colour, -.23)], [.16, tint(colour, .45)], [.32, '#f7eef9'], [.42, colour], [.57, tint(colour, .66)], [.7, '#f5ecf4'], [.86, colour], [1, tint(colour, -.25)]], { x2: '85%', y2: '35%' });
    if (state.finish === 'ombre') fill = gradient('ombre', [[0, colour], [1, tint(colour, .84)]], { x2: '0%', y2: '100%' });
    if (state.finish === 'matte') fill = gradient('matte', [[0, tint(colour, -.12)], [.5, tint(colour, .13)], [1, tint(colour, -.15)]]);
    if (state.finish === 'jelly') fill = gradient('jelly', [[0, tint(colour, .1)], [.5, tint(colour, .58)], [1, tint(colour, .16)]]);
    if (state.finish === 'pearl') fill = gradient('pearl-body', [[0, tint(colour, .12)], [.22, tint(colour, .62)], [.42, '#f5e9f1'], [.64, tint(colour, .28)], [.78, '#f8f1f8'], [1, colour]], { x2: '80%', y2: '100%' });
    if (state.finish === 'cat-eye') fill = gradient('cat-eye', [[0, tint(colour, -.6)], [.3, colour], [.44, tint(colour, .23)], [.51, tint(colour, .72)], [.56, '#d4c4ec'], [.63, tint(colour, .3)], [.77, colour], [1, tint(colour, -.55)]], { x2: '100%', y2: '55%' });
    if (state.finish === 'velvet') {
      var velvet = el('radialGradient', { id: prefix + 'velvet', cx: '42%', cy: '35%', r: '75%' }, defs);
      [[0, tint(colour, .7)], [.45, tint(colour, .26)], [1, tint(colour, -.45)]].forEach(function (st) { el('stop', { offset: st[0], 'stop-color': st[1] }, velvet); });
      fill = 'url(#' + prefix + 'velvet)';
    }
    var shadow = el('filter', { id: prefix + 'shadow', x: '-50%', y: '-20%', width: '200%', height: '160%' }, defs);
    el('feDropShadow', { dx: 2, dy: 5, stdDeviation: 3, 'flood-color': '#4e315f', 'flood-opacity': '.18' }, shadow);
    var x = 28;
    FINGERS.forEach(function (finger, i) {
      var w = finger.w, L = Math.round(LENGTHS[state.length] * finger.s) + 34, top = 196 - L;
      var d = shapePath(state.shape, w, L);
      var group = el('g', { transform: 'translate(' + x + ' ' + top + ') rotate(' + ((i - 2) * 3) + ' ' + (w / 2) + ' ' + L + ')' }, svg);
      var clipId = prefix + 'clip-' + i;
      var clip = el('clipPath', { id: clipId }, defs);
      el('path', { d: d }, clip);
      el('ellipse', { cx: w / 2, cy: L + 2, rx: w * .47, ry: 5, fill: '#75647f', opacity: '.1' }, group);
      el('path', { d: d, fill: fill, 'fill-opacity': state.finish === 'jelly' ? '.68' : '1', stroke: tint(colour, -.25), 'stroke-width': '.8', filter: 'url(#' + prefix + 'shadow)' }, group);
      var inner = el('g', { 'clip-path': 'url(#' + clipId + ')' }, group);
      if (['glitter', 'cat-eye', 'velvet'].includes(state.finish)) {
        var count = state.finish === 'glitter' ? 100 : 65;
        for (var n = 0; n < count; n++) {
          var sx = ((n * 13 + i * 7) % 97) / 97 * w, sy = ((n * 37 + i * 11) % 101) / 101 * L;
          el('circle', { cx: sx, cy: sy, r: state.finish === 'glitter' ? .45 + n % 3 * .2 : .32, fill: n % 3 ? '#e0d9f2' : '#fff', opacity: state.finish === 'glitter' ? '.8' : '.42' }, inner);
        }
      }
      if (['french tip', 'micro french', 'gradient french'].includes(state.art)) {
        var depth = state.art === 'micro french' ? .1 : .29;
        el('path', { d: 'M-2 -2H' + (w + 2) + 'V' + (L * depth) + 'Q' + (w / 2) + ' ' + (L * depth * .5) + ' -2 ' + (L * depth) + 'Z', fill: state.art === 'micro french' ? pearl : state.art === 'gradient french' ? gradient('tip-' + i, [[0, tint(colour, .85)], [1, '#bd9fe2']], { x2: '0%', y2: '100%' }) : '#fffaf5' }, inner);
      } else if (state.art === 'hearts') {
        el('path', { d: heartD(w / 2, L * .55, w * .2), fill: '#fff5fb' }, inner);
      } else if (state.art === 'sparkles' || state.art === 'celestial') {
        [[.35, .35, .14], [.65, .65, .1], [.4, .8, .07]].forEach(function (p) { star(w * p[0], L * p[1], w * p[2], inner, silver, state.art === 'celestial' ? 5 : 4); });
      }
      if (state.art === 'a moon' || (state.art === 'celestial' && i % 2 === 0)) {
        var cx = w * .57, cy = L * .49, r = w * .2;
        el('path', { d: 'M' + (cx + r * .4) + ' ' + (cy - r) + 'A' + r + ' ' + r + ' 0 1 0 ' + (cx + r * .4) + ' ' + (cy + r) + 'A' + (r * .82) + ' ' + (r * .82) + ' 0 0 1 ' + (cx + r * .4) + ' ' + (cy - r) + 'Z', fill: state.art === 'celestial' ? silver : '#f7dfac' }, inner);
      }
      if (state.art === 'flowers') {
        var stem = 'M' + w * .43 + ' ' + L * .9 + 'Q' + w * .8 + ' ' + L * .55 + ' ' + w * .43 + ' ' + L * .25;
        el('path', { d: stem, stroke: '#78886f', 'stroke-width': '.8', fill: 'none' }, inner);
        [[.45, .31], [.62, .49], [.48, .67]].forEach(function (p, j) {
          var fx = w * p[0], fy = L * p[1];
          for (var petal = 0; petal < 5; petal++) el('ellipse', { cx: fx, cy: fy - 2.5, rx: 1.7, ry: 3.3, fill: j % 2 ? '#b398d5' : '#d6c2eb', transform: 'rotate(' + petal * 72 + ' ' + fx + ' ' + fy + ')' }, inner);
          el('circle', { cx: fx, cy: fy, r: 1.2, fill: '#fcf3dc' }, inner);
        });
      }
      if (state.art === 'lines') {
        el('path', { d: 'M-2 ' + L * .1 + 'L' + (w + 2) + ' ' + L * .4 + 'V' + (L + 3) + 'H' + w * .6 + 'Z', fill: i % 2 ? '#17121d' : '#59234f' }, inner);
        el('path', { d: 'M' + w * .15 + ' ' + L * .12 + 'C' + w * .95 + ' ' + L * .3 + ' ' + w * .15 + ' ' + L * .55 + ' ' + w * .86 + ' ' + L * .86 + 'M' + w * .1 + ' ' + L * .87 + 'L' + w * .9 + ' ' + L * .22, fill: 'none', stroke: silver, 'stroke-width': '1.4' }, inner);
      }
      if (state.art === 'crystals') {
        [[.4, .78], [.6, .86], [.48, .92]].forEach(function (p) { el('path', { d: 'M' + w * p[0] + ' ' + (L * p[1] - 2.3) + 'l2 2.3-2 2.3-2-2.3Z', fill: silver, stroke: '#fff', 'stroke-width': '.4' }, inner); });
        if (i === 2) {
          var snow = el('g', { stroke: silver, 'stroke-width': '1', transform: 'translate(' + w * .5 + ' ' + L * .47 + ')' }, inner);
          for (var arm = 0; arm < 6; arm++) el('path', { d: 'M0 0V-9M0-5L-3-8M0-5L3-8', transform: 'rotate(' + arm * 60 + ')' }, snow);
        }
      }
      if (state.art === 'silver accents' && (i === 1 || i === 3)) el('path', { d: 'M' + w * .22 + ' ' + L * .9 + 'Q' + w * .5 + ' ' + L * .81 + ' ' + w * .78 + ' ' + L * .9, fill: 'none', stroke: silver, 'stroke-width': '1.2' }, inner);
      var highlight = state.finish === 'matte' ? .08 : state.finish === 'velvet' ? .16 : state.finish === 'cat-eye' ? .26 : .53;
      el('path', { d: 'M' + w * .24 + ' ' + L * .82 + 'C' + w * .22 + ' ' + L * .5 + ' ' + w * .28 + ' ' + L * .3 + ' ' + w * .36 + ' ' + L * .2, stroke: '#fff', 'stroke-width': state.finish === 'chrome' ? 1.4 : 2.7, fill: 'none', 'stroke-linecap': 'round', opacity: highlight }, inner);
      if (state.finish !== 'matte') el('ellipse', { cx: w * .64, cy: L * .22, rx: w * .07, ry: L * .035, fill: '#fff', opacity: '.32', transform: 'rotate(-20 ' + w * .64 + ' ' + L * .22 + ')' }, inner);
      x += w + 46;
    });
    var rail = gradient('rail', [[0, '#c2b6cb'], [.35, '#fefbff'], [.65, '#d3c4dc'], [1, '#a897b4']], { x2: '0%', y2: '100%' });
    el('rect', { x: 14, y: 193, width: 412, height: 9, rx: 4.5, fill: rail }, svg);
    return svg;
  }
  window.NAIL_RENDERER = { render: render, valid: valid, copy: copy, describe: describe };
})();
