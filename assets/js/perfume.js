(function () {
  'use strict';
  var root = document.querySelector('#perfume .pv');
  var data = window.PERFUME_VANITY;
  if (!root || !data) return;
  var dialog = document.getElementById('perfume-card');
  var opener = null;
  var perfumes = new Map(data.perfumes.map(function (p) { return [p.id, p]; }));
  var statuses = { shelf: 'From my main shelf', cherry: 'From my cherry corner', wishlist: 'On my wishlist · a little dream', drawer: 'In my curiosity drawer · yet to try' };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var closing = null;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function illustration(p, lazy) {
    var img = el('img', 'pv-photo');
    img.src = p.art.src;
    img.alt = p.art.alt;
    img.width = 440;
    img.height = 600;
    img.loading = lazy ? 'lazy' : 'eager';
    img.decoding = 'async';
    return img;
  }
  function bottle(p, style) {
    var button = el('button', 'pv-bottle pv-bottle-' + p.id + (style ? ' ' + style : ''));
    button.type = 'button';
    button.dataset.perfume = p.id;
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', dialog.id);
    button.setAttribute('aria-label', p.house + ' ' + p.name + ', ' + p.concentration + '. ' + p.label + '. Open my notes.');
    var imageWrap = el('span', 'pv-bottle-image');
    imageWrap.append(illustration(p, true));
    button.append(imageWrap, el('span', 'pv-bottle-label', p.label), el('span', 'pv-bottle-house', p.house), el('span', 'pv-bottle-name', p.name));
    return button;
  }
  [['top', ['poison', 'goddess', 'blooming']], ['bottom', ['cloud', 'libre', 'daisy']]].forEach(function (tier) {
    var shelf = root.querySelector('[data-perfume-tier="' + tier[0] + '"]');
    tier[1].forEach(function (id) { shelf.append(bottle(perfumes.get(id))); });
  });
  ['cherry', 'wishlist', 'drawer'].forEach(function (collection) {
    var list = root.querySelector('[data-perfume-collection="' + collection + '"]');
    data.perfumes.filter(function (p) { return p.collection === collection; }).forEach(function (p, i) {
      var item = el('div', 'pv-item');
      item.style.setProperty('--tilt', (i % 2 ? 1.5 : -1.5) + 'deg');
      item.append(bottle(p));
      if (collection === 'wishlist') item.append(el('p', 'pv-wish-note', p.description));
      list.append(item);
    });
  });

  function notes(p) {
    var list = el('ul', 'pv-notes');
    p.notes.forEach(function (note) { list.append(el('li', '', note)); });
    return list;
  }
  function openCard(p, from) {
    if (!p) return;
    clearTimeout(closing);
    dialog.classList.remove('pv-closing');
    opener = from;
    var image = dialog.querySelector('[data-perfume-card-image]');
    image.src = p.art.src;
    image.alt = p.art.alt;
    dialog.querySelector('[data-perfume-card-label]').textContent = p.label;
    dialog.querySelector('[data-perfume-card-status]').textContent = statuses[p.collection];
    dialog.querySelector('[data-perfume-card-house]').textContent = p.house;
    dialog.querySelector('#pv-card-title').textContent = p.name;
    dialog.querySelector('[data-perfume-card-concentration]').textContent = p.concentration;
    dialog.querySelector('[data-perfume-card-notes]').replaceChildren(...notes(p).children);
    dialog.querySelector('#pv-card-description').textContent = p.description;
    var details = dialog.querySelector('.pv-card-details');
    details.replaceChildren();
    [['The mood', p.occasion], [p.collection === 'drawer' || p.collection === 'wishlist' ? 'What caught my eye' : 'My favorite detail', p.detail]].forEach(function (row) { details.append(el('dt', '', row[0]), el('dd', '', row[1])); });
    dialog.querySelector('[data-perfume-card-verdict]').textContent = p.verdict;
    dialog.querySelector('[data-perfume-card-source]').href = p.source;
    document.documentElement.classList.add('pv-modal-open');
    dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector('[data-perfume-close]').focus({ preventScroll: true });
  }
  function closeCard() {
    if (dialog.classList.contains('pv-closing')) return;
    if (reducedMotion.matches) { dialog.close(); return; }
    dialog.classList.add('pv-closing');
    closing = setTimeout(function () { dialog.close(); }, 180);
  }
  root.addEventListener('click', function (event) {
    var button = event.target.closest('[data-perfume]');
    if (button && root.contains(button)) openCard(perfumes.get(button.dataset.perfume), button);
  });
  dialog.querySelector('[data-perfume-close]').addEventListener('click', closeCard);
  dialog.addEventListener('cancel', function (event) { event.preventDefault(); closeCard(); });
  dialog.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    var controls = dialog.querySelectorAll('button:not([disabled]), a[href]');
    var first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  dialog.addEventListener('click', function (event) {
    var bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeCard();
  });
  dialog.addEventListener('close', function () {
    clearTimeout(closing);
    dialog.classList.remove('pv-closing');
    document.documentElement.classList.remove('pv-modal-open');
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  });

  var handle = root.querySelector('[data-perfume-drawer]');
  var drawer = root.querySelector('#pv-drawer');
  handle.addEventListener('click', function () {
    var open = handle.getAttribute('aria-expanded') !== 'true';
    handle.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    handle.querySelector('[data-drawer-label]').textContent = open ? 'tuck away' : 'pull to explore';
  });

  var diary = root.querySelector('[data-perfume-confessions]');
  data.confessions.forEach(function (entry, i) {
    var note = el('article', 'pv-diary-note');
    note.style.setProperty('--tilt', (i % 2 ? 1.2 : -1.2) + 'deg');
    note.append(el('span', 'pv-note-number', '0' + (i + 1)), el('h5', '', entry[0]), el('p', '', entry[1]));
    diary.append(note);
  });
  var credits = root.querySelector('[data-perfume-credits]');
  data.perfumes.forEach(function (p) {
    var li = el('li');
    var a = el('a', '', p.house + ' — ' + p.name + ' (' + p.concentration + ')');
    a.href = p.source;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    li.append(a);
    credits.append(li);
  });
})();
