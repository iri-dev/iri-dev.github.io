(function () {
  var root = document.documentElement;
  var KEY = 'iri-theme';
  var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motionOk = !motionPreference.matches;
  motionPreference.addEventListener('change', function (event) { motionOk = !event.matches; });

  function toast(text) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.textContent = text;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('on'); });
    setTimeout(function () { t.classList.remove('on'); setTimeout(function () { t.remove(); }, 400); }, 2200);
  }

  function setTheme(t, announce) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (e) { /* storage can be blocked; the switch still works */ }
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      var label = b.querySelector('.label');
      if (label) label.textContent = t === 'dark' ? 'lights on' : 'lights off';
      b.setAttribute('aria-label', t === 'dark' ? 'Turn the lights on (light mode)' : 'Turn the lights off (dark mode)');
    });
    if (announce) toast(t === 'dark' ? 'lights off… cosy mode ☾' : 'lights on! ☀');
  }
  function flipTheme(announce) { setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', announce); }
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-theme-toggle]')) flipTheme(false);
  });

  function hearts(x, y, n) {
    if (!motionOk) return;
    for (var i = 0; i < (n || 7); i++) {
      var h = document.createElement('span');
      h.className = 'pop-heart';
      h.textContent = i % 3 ? '♡' : '♥';
      h.style.left = x + 'px';
      h.style.top = y + 'px';
      h.style.setProperty('--dx', (Math.random() * 90 - 45).toFixed(0) + 'px');
      h.style.animationDelay = (i * 45) + 'ms';
      h.style.fontSize = (14 + Math.random() * 12).toFixed(0) + 'px';
      h.addEventListener('animationend', function () { this.remove(); });
      document.body.appendChild(h);
    }
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-hearts]');
    if (!el) return;
    var r = el.getBoundingClientRect();
    hearts(r.left + r.width / 2, r.top + r.height / 2);
  });

  /* The room */
  var room = document.getElementById('room');
  if (room) {
    var bubble = document.getElementById('rm-bubble');
    var says = document.getElementById('rm-says');
    var catButton = room.querySelector('[data-action="cat"]');
    var catHead = room.querySelector('.cat-head');
    var catFeedback = document.getElementById('cat-feedback');
    var catLines = [
      ['mrrp… hi ♡', 'I was resting my eyes', 'a little closer, please', 'my ears needed that ♡'],
      ['oh. that’s the spot ♡', 'prrrr… keep going', 'I approve of this', 'one more, please ♡'],
      ['you can stay ♡', 'I’m keeping you', 'my pillow, your problem', 'I could get used to this']
    ];
    var catIndex = 0, catPats = 0, lastPat = 0, lastHearts = 0;
    var bubbleTimer, catTimer;
    function placeCatBubble() {
      var viewport = room.closest('.room-scroll').getBoundingClientRect();
      var left = Math.max(8, viewport.left + 8);
      var right = Math.min(window.innerWidth - 8, viewport.right - 8);
      var head = catHead.getBoundingClientRect();
      bubble.style.visibility = head.right < left || head.left > right ? 'hidden' : '';
      bubble.removeAttribute('transform');
      var bounds = bubble.getBoundingClientRect();
      var shift = bounds.right > right ? right - bounds.right : bounds.left < left ? left - bounds.left : 0;
      var dx = shift / bubble.getScreenCTM().a;
      bubble.setAttribute('transform', 'translate(' + dx + ' 0)');
      var anchor = Math.max(880, Math.min(1130, 968 - dx));
      bubble.querySelector('.cat-bubble-tail').setAttribute('d', 'M' + (anchor - 12) + ' 440L' + (968 - dx) + ' 462L' + (anchor + 12) + ' 441Z');
      var join = bubble.querySelector('.cat-bubble-join');
      join.setAttribute('x', anchor - 14);
      join.setAttribute('width', 28);
    }
    function restCat() {
      clearTimeout(bubbleTimer);
      clearTimeout(catTimer);
      bubble.classList.remove('on');
      room.classList.remove('cat-is-purring', 'cat-is-cozy', 'cat-pat');
      catButton.setAttribute('aria-label', 'Pet the sleeping cat');
      if (catFeedback && catPats && !document.hidden) catFeedback.textContent = 'The cat curls up for another nap. You can pet her again whenever you like.';
      catPats = 0;
      lastPat = 0;
    }
    var actions = {
      lamp: function () { flipTheme(true); },
      cat: function () {
        var now = Date.now();
        if (now - lastPat < 120) return;
        lastPat = now;
        catPats++;
        var mood = catPats < 3 ? 0 : catPats < 6 ? 1 : 2;
        var line = catLines[mood][catIndex++ % catLines[mood].length];
        says.textContent = line;
        room.classList.add('cat-is-purring');
        room.classList.toggle('cat-is-cozy', mood === 2);
        room.classList.remove('cat-pat');
        if (motionOk) {
          void catHead.getBoundingClientRect();
          room.classList.add('cat-pat');
        }
        catButton.setAttribute('aria-label', 'Pet the happy cat again');
        if (catFeedback) catFeedback.textContent = (mood === 0 ? 'The cat wakes and leans into your hand. ' : mood === 1 ? 'The cat is purring. ' : 'The cat stretches her paws and settles beside you. ') + line;
        placeCatBubble();
        bubble.classList.add('on');
        clearTimeout(bubbleTimer);
        clearTimeout(catTimer);
        bubbleTimer = setTimeout(function () { bubble.classList.remove('on'); }, 3000);
        catTimer = setTimeout(restCat, 5200);
        if (now - lastHearts > 600) {
          var r = catHead.getBoundingClientRect();
          hearts(r.left + r.width / 2, r.top, 2);
          lastHearts = now;
        }
      },
      wish: function () {
        if (root.getAttribute('data-theme') !== 'dark') { toast('wishes work better at night ☾ try the lamp'); return; }
        var s = room.querySelector('.star-shoot');
        s.classList.remove('go');
        void s.getBoundingClientRect();
        s.classList.add('go');
        toast('✦ wish made. I hope it comes true ✦');
      }
    };
    room.querySelectorAll('[data-action]').forEach(function (el) {
      var run = function () { actions[el.getAttribute('data-action')](el); };
      el.addEventListener('click', run);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!e.repeat) run(); }
      });
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) restCat(); });
    window.addEventListener('pagehide', restCat);

    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    var tick = function () {
      var d = new Date();
      var m = d.getMinutes();
      var h = d.getHours() % 12 + m / 60;
      document.getElementById('rm-hour').setAttribute('transform', 'rotate(' + (h * 30) + ' 72 226)');
      document.getElementById('rm-min').setAttribute('transform', 'rotate(' + (m * 6) + ' 72 226)');
      document.getElementById('rm-cal-month').textContent = months[d.getMonth()];
      document.getElementById('rm-cal-day').textContent = d.getDate();
    };
    tick();
    setInterval(tick, 30000);

    var tagButton = document.querySelector('[data-tags]');
    if (tagButton) {
      if (window.matchMedia('(hover: none)').matches) room.classList.add('show-tags');
      var syncTags = function () { tagButton.textContent = room.classList.contains('show-tags') ? 'hide the labels' : 'show all the labels'; };
      syncTags();
      tagButton.addEventListener('click', function () { room.classList.toggle('show-tags'); syncTags(); });
    }
    var scroller = room.closest('.room-scroll');
    var keepCatBubbleInView = function () { if (bubble.classList.contains('on')) placeCatBubble(); };
    if (scroller) scroller.addEventListener('scroll', keepCatBubbleInView, { passive: true });
    window.addEventListener('resize', keepCatBubbleInView);
    if (scroller && scroller.scrollWidth > scroller.clientWidth) {
      scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) * 0.5;
    }
  }

  var doing = document.getElementById('doing');
  if (doing) {
    var lines = [
      'debugging something',
      'making a matcha latte',
      'renaming a variable for the fifth time',
      'picking an even better shade of purple',
      'adding a protection to WardenOne',
      'arguing with a semicolon',
      'doing my skincare',
      'playing Wuthering Waves (the bug can wait)',
      'falling down a research rabbit hole',
      'making Hydra a little bit cuter',
      'adding one more sparkle to this room',
      'staring at a bug until it gives up',
      'turning up my rock playlist',
      'listening to Haunt Me again',
      'trying a riff on my electric guitar',
      'playing something soft on my acoustic guitar',
      'deciding between almond and coffin nails',
      'saving another purple manicure for later',
      'admiring the shimmer on my amethyst nails',
      'convincing myself one more purple polish won’t hurt',
      'dreaming about lavender chrome',
      'trying to choose just one cherry perfume',
      'admiring a bottle my purse has opinions about',
      'telling my hair we’re on the same team',
      'putting my hair up so I can concentrate',
      'getting distracted by something silver and shiny',
      'wandering around Genshin with no particular plan',
      'getting attached to fictional characters',
      'thinking about the ending of a story',
      'finding room for another favorite on my shelf',
      'looking at wisteria and wanting it everywhere',
      'switching this room to its cozy night setting',
      'taking a very necessary snack break',
      'testing one tiny change in three different browsers',
      'writing a little note in my diary',
      'having one more idea when I should be asleep'
    ];
    var pick = Math.floor(Math.random() * lines.length);
    var show = function () { doing.innerHTML = 'right now, I\'m probably <b></b>.'; doing.querySelector('b').textContent = lines[pick]; };
    show();
    var reroll = document.querySelector('[data-reroll]');
    if (reroll) reroll.addEventListener('click', function () { pick = (pick + 1 + Math.floor(Math.random() * (lines.length - 1))) % lines.length; show(); });
  }

  /* My World flip cards */
  document.querySelectorAll('button.flip').forEach(function (card) {
    card.addEventListener('click', function () {
      card.setAttribute('aria-pressed', card.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });

  /* The ideas drawer on About slides open. */
  document.querySelectorAll('[data-drawer]').forEach(function (drawer) {
    var front = drawer.querySelector('.drawer-front');
    var inside = drawer.querySelector('.drawer-inside');
    front.addEventListener('click', function () {
      var open = front.getAttribute('aria-expanded') !== 'true';
      front.setAttribute('aria-expanded', open ? 'true' : 'false');
      inside.hidden = !open;
      drawer.classList.toggle('open', open);
    });
  });
  function openDrawerFromHash() {
    var d = document.querySelector('[data-drawer] .drawer-front');
    if (location.hash === '#drawer' && d && d.getAttribute('aria-expanded') !== 'true') d.click();
  }
  openDrawerFromHash();
  window.addEventListener('hashchange', openDrawerFromHash);

  /* My shelf: picking up a case highlights its note. */
  document.querySelectorAll('.case[data-for]').forEach(function (c) {
    c.setAttribute('aria-pressed', 'false');
    c.addEventListener('click', function () {
      document.querySelectorAll('.case[data-for]').forEach(function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
      document.querySelectorAll('.shelf-notes .note').forEach(function (n) { n.classList.toggle('lit', n.id === c.dataset.for); });
      var note = document.getElementById(c.dataset.for);
      if (note) note.scrollIntoView({ behavior: motionOk ? 'smooth' : 'auto', block: 'nearest' });
    });
  });

  /* "This or that?" on the About page: your pick, then mine. */
  var tot = document.querySelector('[data-tot]');
  if (tot) {
    var rows = tot.querySelectorAll('.tot-row');
    var score = tot.querySelector('.tot-score');
    var answered = 0;
    var matched = 0;
    rows.forEach(function (row) {
      row.querySelectorAll('.tot-opt').forEach(function (btn) {
        btn.setAttribute('aria-pressed', 'false');
        btn.addEventListener('click', function () {
          if (row.dataset.done) return;
          row.dataset.done = '1';
          var iri = row.dataset.iri;
          btn.classList.add('mine');
          btn.setAttribute('aria-pressed', 'true');
          row.querySelectorAll('.tot-opt').forEach(function (b) {
            if (iri === 'both' || b.dataset.pick === iri) b.classList.add('iri');
            if (b !== btn) b.disabled = true;
          });
          var same = iri === 'both' || btn.dataset.pick === iri;
          answered += 1;
          if (same) matched += 1;
          row.querySelector('.tot-say').textContent = (same ? 'same! ' : 'ooh, we differ. ') + row.dataset.say;
          if (same) {
            var r = btn.getBoundingClientRect();
            hearts(r.left + r.width / 2, r.top + r.height / 2, 5);
          }
          if (answered === rows.length) {
            var lines = ['we\'re basically opposites. that\'s what makes it fun ♡', 'a little alike, a lot different ♡',
              'we\'d get along, I think ♡', 'okay, are you secretly me? ♡'];
            score.textContent = 'we matched ' + matched + ' out of ' + rows.length + '! ' +
              lines[Math.min(lines.length - 1, Math.floor(matched / rows.length * lines.length))];
          }
        });
      });
    });
  }

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var text = btn.getAttribute('data-copy');
      var done = function () { toast('copied ' + text + ' ♡'); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var t = document.createElement('textarea');
        t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); done(); } catch (err) { /* nothing to copy with */ }
        t.remove();
      }
    });
  });

  /* A little secret for anyone who knows the code. */
  var code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var at = 0;
  document.addEventListener('keydown', function (e) {
    at = (e.key === code[at] || e.key.toLowerCase() === code[at]) ? at + 1 : (e.key === code[0] ? 1 : 0);
    if (at < code.length) return;
    at = 0;
    toast('✿ you found a secret! have some petals ✿');
    if (!motionOk) return;
    for (var i = 0; i < 46; i++) {
      var p = document.createElement('span');
      p.className = 'petal-rain';
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.setProperty('--d', (4 + Math.random() * 4).toFixed(1) + 's');
      p.style.setProperty('--dx', (Math.random() * 160 - 80).toFixed(0) + 'px');
      p.style.animationDelay = (Math.random() * 2.5).toFixed(2) + 's';
      p.addEventListener('animationend', function () { this.remove(); });
      document.body.appendChild(p);
    }
  });

  if (window.console) {
    console.log('%chi there, fellow developer ♡', 'font: 700 16px Nunito, sans-serif; color: #d9579b');
    console.log('everything here is hand-written and yours to read. no trackers, promise. — iri');
  }
})();
