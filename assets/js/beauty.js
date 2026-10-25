/* Beauty & Style tabs, photo filters, and lightbox. Data: beauty-data.js. */
(function () {
  var data = window.BEAUTY;
  var root = document.getElementById('beauty');
  if (!data || !root) return;
  var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
  var motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function select(tab, focus) {
    tabs.forEach(function (t, i) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
      if (on && motionOk) { panels[i].classList.remove('enter'); void panels[i].offsetWidth; panels[i].classList.add('enter'); }
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      select(tab);
      if (history.replaceState) history.replaceState(null, '', '#' + tab.getAttribute('aria-controls'));
    });
    tab.addEventListener('keydown', function (e) {
      var next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(tabs[(next + tabs.length) % tabs.length], true);
    });
  });
  function fromHash() {
    var id = location.hash.slice(1);
    if (id === 'ns-mood') id = 'ns-collection';
    if (id === 'ns-saved') id = 'ns-designer';
    if (id === 'pv-picker') id = 'pv-shelf';
    var tab = tabs.filter(function (t) { return t.getAttribute('aria-controls') === id; })[0];
    var anchor = document.getElementById(id);
    if (!tab && anchor && anchor.closest('#perfume')) tab = document.getElementById('tab-perfume');
    if (!tab && anchor && anchor.closest('#nails')) tab = document.getElementById('tab-nails');
    if (!tab && anchor && anchor.closest('#hair')) tab = document.getElementById('tab-hair');
    if (!tab && id !== 'beauty') return;
    select(tab || tabs[0]);
    (anchor && anchor.closest('#perfume, #nails, #hair') ? anchor : root).scrollIntoView({ block: 'start', behavior: motionOk ? 'smooth' : 'auto' });
  }

  /* Photo galleries */
  function photoSrc(p, small) {
    if (p.src) return small ? (p.thumb || p.src) : p.src;
    return 'assets/img/beauty/' + p.id + (small ? '-sm.webp' : '.webp');
  }
  Object.keys(data.groups).forEach(function (tab) {
    var grid = root.querySelector('[data-gallery="' + tab + '"]');
    var chips = root.querySelector('[data-filters="' + tab + '"]');
    if (!grid) return;
    var photos = data.photos.filter(function (p) { return p.tab === tab; });
    function render(group) {
      grid.replaceChildren();
      var shown = photos.filter(function (p) { return group === 'all' || p.group === group || (p.groups || []).indexOf(group) !== -1; });
      shown.forEach(function (p) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'shot';
        b.setAttribute('aria-label', p.title + (p.illustration ? ' (open illustration)' : ' (open photo)'));
        var img = document.createElement('img');
        img.src = photoSrc(p, true);
        img.alt = p.alt;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 460;
        img.height = 575;
        var label = document.createElement('span');
        label.className = 'shot-label';
        label.textContent = p.title;
        b.append(img, label);
        b.addEventListener('click', function () { openBox(shown, shown.indexOf(p), b); });
        grid.appendChild(b);
      });
      var wanted = data.wanted[tab + '/' + group];
      if (group === 'all') {
        data.groups[tab].forEach(function (g) {
          if (data.wanted[tab + '/' + g[0]] && !photos.some(function (p) { return p.group === g[0]; })) addWanted(g[1], data.wanted[tab + '/' + g[0]]);
        });
      } else if (wanted && !shown.length) {
        addWanted(data.groups[tab].filter(function (g) { return g[0] === group; })[0][1], wanted);
      }
      function addWanted(name, text) {
        var w = document.createElement('div');
        w.className = 'shot wanted';
        w.innerHTML = '<span class="hand"></span><p></p>';
        w.querySelector('.hand').textContent = name;
        w.querySelector('p').textContent = text;
        grid.appendChild(w);
      }
    }
    if (chips) {
      var all = [['all', 'all']].concat(data.groups[tab]);
      all.forEach(function (g) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'chip';
        c.textContent = g[1];
        c.setAttribute('aria-pressed', g[0] === 'all' ? 'true' : 'false');
        c.addEventListener('click', function () {
          chips.querySelectorAll('.chip').forEach(function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
          render(g[0]);
        });
        chips.appendChild(c);
      });
    }
    render('all');
  });

  /* The lightbox */
  var box = document.getElementById('lightbox');
  var current = [], at = 0, opener = null;
  var big = document.createElement('img');
  big.className = 'lb-img';
  big.width = 880;
  big.height = 1100;
  function show() {
    var p = current[at];
    box.setAttribute('aria-label', p.illustration ? 'Manicure illustration details' : 'Photo details');
    if (!big.parentNode) box.querySelector('.lb-inner').prepend(big);
    big.src = photoSrc(p, false);
    big.alt = p.alt;
    box.querySelector('.lb-title').textContent = p.title;
    box.querySelector('.lb-caption').textContent = p.caption;
    var dl = box.querySelector('.lb-details');
    dl.replaceChildren();
    [['color', p.colour], ['shape', p.shape], ['finish', p.finish]].forEach(function (row) {
      if (!row[1]) return;
      var dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = row[0];
      dd.textContent = row[1];
      dl.append(dt, dd);
    });
    dl.hidden = !dl.children.length;
    var credit = box.querySelector('.lb-credit');
    if (p.illustration) {
      credit.textContent = 'Custom manicure illustration · a design reference, not a personal photograph.';
    } else if (p.mine) {
      credit.textContent = 'my own photo ♡';
    } else {
      credit.innerHTML = 'Inspiration, not me ♡ Photo by <a target="_blank" rel="noopener"></a>';
      credit.querySelector('a').href = p.page;
      credit.querySelector('a').textContent = p.by;
      credit.appendChild(document.createTextNode(' on ' + (p.source || 'Pexels')));
    }
    box.querySelector('.lb-count').textContent = (at + 1) + ' / ' + current.length;
    box.querySelector('.lb-prev').disabled = current.length < 2;
    box.querySelector('.lb-next').disabled = current.length < 2;
  }
  function openBox(list, index, from) {
    current = list;
    at = index;
    opener = from;
    show();
    if (box.showModal) box.showModal(); else box.setAttribute('open', '');
    box.querySelector('.lb-close').focus();
  }
  function step(d) { at = (at + d + current.length) % current.length; show(); }
  box.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
  box.querySelector('.lb-next').addEventListener('click', function () { step(1); });
  box.querySelector('.lb-close').addEventListener('click', function () { box.close(); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
  box.addEventListener('close', function () { if (opener) opener.focus(); });

  root.addEventListener('click', function (event) {
    var button = event.target.closest('[data-beauty-photo]');
    if (!button || !root.contains(button)) return;
    var photo = data.photos.find(function (p) { return p.id === button.dataset.beautyPhoto; });
    if (!photo) return;
    var list = data.photos.filter(function (p) { return p.tab === photo.tab; });
    openBox(list, list.indexOf(photo), button);
  });

  fromHash();
  window.addEventListener('hashchange', fromHash);
})();
