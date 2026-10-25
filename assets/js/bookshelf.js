(function () {
  'use strict';
  var data = window.IRIS_BOOKSHELF;
  var root = document.querySelector('.bs-cabinet');
  if (!root || !data) return;
  var NS = 'http://www.w3.org/2000/svg';
  var panel = document.getElementById('book-note');
  var title = document.getElementById('bs-note-title');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var selected = null;
  var buttons = [];
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function motif(name) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    function add(tag, attrs) { var n = document.createElementNS(NS, tag); Object.keys(attrs).forEach(function (key) { n.setAttribute(key, attrs[key]); }); svg.append(n); }
    switch (name) {
      case 'mountain': add('path', { d: 'M6 49L26 13 42 38 49 26 59 49ZM19 26L26 31 32 23M4 54H60M44 11H50M47 8V14' }); break;
      case 'wave': add('path', { d: 'M7 27Q19 11 31 27T57 27M7 38Q19 22 31 38T57 38M7 49Q19 33 31 49T57 49M31 5V13M27 9H35' }); break;
      case 'moon': add('path', { d: 'M43 10A24 24 0 1 0 51 46A22 22 0 0 1 43 10ZM14 16L18 12M9 26L14 25' }); break;
      case 'leaf': add('path', { d: 'M17 54Q34 35 39 13M26 42C4 40 10 23 10 23Q26 23 26 42ZM33 30C31 9 52 9 52 9Q54 27 33 30ZM18 53H48' }); break;
      case 'flower': add('path', { d: 'M32 33V55M32 46Q19 32 15 39Q17 48 32 49M32 41Q45 30 48 36Q44 45 32 45' });
        [[32, 13], [22, 22], [27, 32], [40, 29], [43, 17]].forEach(function (p) { add('ellipse', { cx: p[0], cy: p[1], rx: 7, ry: 8 }); }); add('circle', { cx: 33, cy: 23, r: 4 }); break;
      case 'clock': add('circle', { cx: 32, cy: 33, r: 23 }); add('circle', { cx: 32, cy: 33, r: 19 }); add('path', { d: 'M32 20V34L43 40M29 5H35M32 5V10M32 13V16M32 50V53M12 33H15M49 33H52' }); break;
      case 'letter': add('path', { d: 'M9 20H55V49H9ZM9 20L32 38 55 20M9 49L24 33M55 49L40 33M20 12H44' }); break;
      case 'orbit': add('circle', { cx: 32, cy: 32, r: 11 }); add('ellipse', { cx: 32, cy: 32, rx: 27, ry: 9, transform: 'rotate(-30 32 32)' }); add('path', { d: 'M12 7V15M8 11H16M49 47V55M45 51H53M48 12H49' }); break;
      case 'diamond': add('path', { d: 'M32 7L55 32 32 57 9 32ZM32 17L45 32 32 47 19 32ZM9 32H19M45 32H55M32 7V17M32 47V57' }); break;
      case 'ripple': add('path', { d: 'M8 40Q20 30 32 40T56 40M8 48Q20 38 32 48T56 48M15 16L49 24 32 34 15 16ZM15 16L32 27 49 24M32 27V34' }); break;
      default: add('path', { d: 'M32 6Q34 30 57 32Q34 34 32 58Q30 34 7 32Q30 30 32 6ZM13 9V17M9 13H17M50 45V53M46 49H54' });
    }
    return svg;
  }
  [1, 2].forEach(function (row) {
    var shelf = root.querySelector('[data-shelf-row="' + row + '"]');
    var books = data.filter(function (p) { return p.row === row; });
    books.forEach(function (p) {
      var index = data.indexOf(p);
      var b = el('button','case bs-book'); b.type = 'button'; b.id = 'spine-' + p.id; b.dataset.book = p.id;
      b.setAttribute('aria-controls',panel.id); b.setAttribute('aria-expanded','false');
      b.setAttribute('aria-label',p.title + '. Open my little note.');
      b.style.setProperty('--case',p.colour); b.style.setProperty('--case-ink',p.id === 'frieren' ? '#091b10' : p.ink);
      b.style.setProperty('--r',p.lean + 'deg');
      var illustration = motif(p.motif); illustration.setAttribute('class','icon');
      var label = el('span','t');
      var parts = p.id === 'nier' ? ['NieR:','Automata'] : p.id === 'steinsgate' ? ['Steins;','Gate'] : [p.id === 'frieren' ? 'Frieren' : p.title];
      parts.forEach(function (part,i) { if (i) label.append(document.createElement('wbr')); label.append(document.createTextNode(part)); });
      b.append(illustration,label);
      if (p.favorite) b.append(el('span','sticker butter','a favorite ♡'));
      b.addEventListener('click',function () { if (selected === index) close(); else open(index,true,true); });
      b.addEventListener('keydown',function (event) {
        var step = window.matchMedia('(max-width: 900px)').matches ? (window.matchMedia('(max-width: 360px)').matches ? 2 : 3) : 6;
        var next = {ArrowRight:index+1,ArrowLeft:index-1,ArrowDown:index+step,ArrowUp:index-step,Home:0,End:data.length-1}[event.key];
        if (next === undefined) return;
        event.preventDefault(); buttons[(next+data.length)%data.length].focus();
      });
      buttons.push(b); shelf.append(b);
    });
  });
  function open(index, focus, updateUrl) {
    var p = data[index]; selected = index;
    buttons.forEach(function (b, i) { b.setAttribute('aria-expanded', String(i === index)); });
    var image = panel.querySelector('[data-book-cover]');
    image.loading = 'lazy';
    image.src = p.art.src; image.alt = p.art.alt;
    panel.querySelector('[data-book-subtitle]').textContent = p.subtitle;
    panel.querySelector('[data-book-credit]').textContent = p.art.caption;
    panel.querySelector('[data-book-type]').textContent = p.type === 'Game' ? 'a little game note' : 'a little story note';
    var favorite = panel.querySelector('[data-book-favorite]'); favorite.textContent = p.favorite || ''; favorite.hidden = !p.favorite;
    panel.querySelector('.bs-cover-details').open = false;
    title.textContent = p.title; panel.querySelector('[data-book-note]').textContent = p.note;
    var tags = panel.querySelector('[data-book-tags]'); tags.replaceChildren();
    p.tags.forEach(function (tag) { tags.append(el('li', '', tag)); });
    panel.querySelector('[data-book-detail]').textContent = p.detail;
    panel.querySelector('[data-book-official]').href = p.official;
    panel.querySelector('[data-book-count]').textContent = (index + 1) + ' / ' + data.length;
    panel.hidden = false;
    if (!motion.matches) panel.animate([{ opacity: .35, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'ease-out' });
    if (updateUrl) history.replaceState(null, '', '#' + p.id);
    if (focus) { panel.scrollIntoView({ block: 'start', behavior: motion.matches ? 'auto' : 'smooth' }); title.focus({ preventScroll: true }); }
  }
  function close() {
    if (selected === null) return;
    var previous = selected;
    selected = null; panel.hidden = true;
    buttons.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (data.some(function (p) { return '#' + p.id === location.hash; })) history.replaceState(null, '', location.pathname + location.search);
    buttons[previous].focus({ preventScroll: true }); buttons[previous].scrollIntoView({ block: 'nearest', behavior: motion.matches ? 'auto' : 'smooth' });
  }
  panel.querySelector('[data-book-close]').addEventListener('click', close);
  panel.querySelector('[data-book-previous]').addEventListener('click', function () { open((selected - 1 + data.length) % data.length, true, true); });
  panel.querySelector('[data-book-next]').addEventListener('click', function () { open((selected + 1) % data.length, true, true); });
  panel.addEventListener('keydown', function (event) { if (event.key === 'Escape') { event.preventDefault(); close(); } });
  var credits = document.querySelector('[data-book-credits]');
  data.forEach(function (p) {
    var li = el('li'); var link = el('a', '', p.title + ' — ' + p.credit);
    link.href = p.official; link.target = '_blank'; link.rel = 'noopener noreferrer'; li.append(link); credits.append(li);
  });
  function fromHash() {
    var index = data.findIndex(function (p) { return '#' + p.id === location.hash; });
    if (index >= 0) open(index, true, false);
  }
  fromHash();
  window.addEventListener('hashchange', function () { fromHash(); });
})();
