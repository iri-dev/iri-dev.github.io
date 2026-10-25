/* Music on My World and the music corner: a deck for the featured tape and the tape rack.
   Links come from spotify-config.js. Spotify's player loads only after a visitor chooses it. */
(function () {
  var cfg = window.SPOTIFY;
  var COLOURS = ['lilac', 'pink', 'mint', 'sky', 'butter', 'peach'];
  var TILT = [-1.5, 1, -.5, 1.5, -1, .5];
  var STICK = [-3, 2, -1, 3, -2, 1, 2];

  function stickers(list, names) {
    list.replaceChildren();
    names.forEach(function (name, i) {
      var li = document.createElement('li');
      li.className = 'sticker ' + COLOURS[i % COLOURS.length];
      li.style.setProperty('--r', STICK[i % STICK.length] + 'deg');
      li.textContent = name;
      list.appendChild(li);
    });
  }
  function rows(list, items, ranked) {
    list.replaceChildren();
    items.forEach(function (it, index) {
      var li = document.createElement('li'), b = document.createElement('b'), span = document.createElement('span');
      if (it.url) {
        var a = document.createElement('a');
        a.href = it.url;
        a.textContent = it.title;
        b.appendChild(a);
      } else {
        b.textContent = it.title;
      }
      if (ranked) {
        b.prepend(document.createTextNode((index + 1) + '. '));
        if (it.honorable) {
          var label = document.createElement('small');
          label.className = 'repeat-honorable-label';
          label.textContent = 'honorable fourth ♡';
          b.appendChild(label);
        }
      }
      span.textContent = it.artist;
      li.append(b, span);
      list.appendChild(li);
    });
  }

  function Deck(root) {
    var parts = {};
    root.querySelectorAll('[data-deck]').forEach(function (el) { parts[el.dataset.deck] = el; });
    var current, loaded = false, tape = parts.tape;
    var button = parts.play;
    parts.stage.id = root.hasAttribute('data-featured') ? 'spotify-featured-stage' : 'spotify-music-stage';
    button.setAttribute('aria-controls', parts.stage.id);
    function showPlayer() {
      if (loaded) {
        var frame = document.createElement('iframe');
        frame.src = 'https://open.spotify.com/embed/playlist/' + current.id;
        frame.title = 'Spotify player: ' + current.name;
        frame.width = '100%';
        frame.height = '352';
        frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        parts.stage.replaceChildren(frame);
      } else {
        parts.stage.replaceChildren(tape);
      }
      button.querySelector('span').textContent = loaded ? 'close Spotify player' : 'load Spotify player';
      button.setAttribute('aria-pressed', String(loaded));
    }
    button.addEventListener('click', function () { loaded = !loaded; showPlayer(); });
    return function load(playlist, meta) {
      current = playlist;
      parts.label.textContent = playlist.name;
      parts.meta.textContent = meta;
      parts.desc.textContent = playlist.desc || '';
      parts.desc.hidden = !playlist.desc;
      parts.open.href = 'https://open.spotify.com/playlist/' + playlist.id;
      tape.style.setProperty('--shell', playlist.shell || '#c58be6');
      if (parts.artists) stickers(parts.artists, playlist.artists || []);
      showPlayer();
    };
  }

  if (cfg) {
    document.querySelectorAll('[data-spotify-profile]').forEach(function (a) { a.href = cfg.profileUrl; });
    document.querySelectorAll('[data-artist-wall]').forEach(function (ul) {
      stickers(ul, cfg.artists.slice(0, +ul.getAttribute('data-artist-wall') || cfg.artists.length));
    });

    var featured = document.querySelector('[data-featured]');
    if (featured) {
      var tapeP = cfg.playlists.filter(function (p) { return p.id === cfg.featured.id; })[0];
      if (tapeP) Deck(featured)(tapeP, 'FEATURED TAPE · ' + tapeP.tag.toUpperCase());
      var picks = document.querySelector('[data-picks]');
      if (picks) rows(picks, cfg.picks.songs.map(function (s) { return { title: s[0], artist: s[1] }; }));
      var rep = document.querySelector('[data-on-repeat]');
      if (rep && cfg.onRepeat.length) rows(rep, cfg.onRepeat, true);
    }

    var rack = document.querySelector('[data-rack]');
    if (rack) {
      var load = Deck(document.querySelector('[data-deck-root]'));
      var mixes = cfg.playlists.map(function (p, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'mix';
        b.style.setProperty('--shell', p.shell);
        b.style.setProperty('--r', TILT[i % TILT.length] + 'deg');
        var name = document.createElement('span'), meta = document.createElement('span');
        name.className = 'mix-label';
        name.textContent = p.name;
        meta.className = 'mix-meta';
        meta.textContent = p.tag;
        b.append(name, meta);
        b.addEventListener('click', function () { show(i); });
        rack.appendChild(b);
        return b;
      });
      var show = function (i) {
        mixes.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
        load(cfg.playlists[i], cfg.playlists[i].tag.toUpperCase());
      };
      show(0);
    }
  }

})();
