(function () {
  'use strict';
  var root = document.getElementById('playable-guitars');
  if (!root) return;
  var scriptURL = document.currentScript.src;
  var OPEN = [40, 45, 50, 55, 59, 64];
  var STRINGS = ['low E', 'A', 'D', 'G', 'B', 'high E'];
  var CHORDS = {
    C: [-1, 3, 2, 0, 1, 0], G: [3, 2, 0, 0, 0, 3], Am: [-1, 0, 2, 2, 1, 0],
    F: [1, 3, 3, 2, 1, 1], Em: [0, 2, 2, 0, 0, 0], D: [-1, -1, 0, 2, 3, 2],
    E: [0, 2, 2, 1, 0, 0], Dm: [-1, -1, 0, 2, 3, 1]
  };
  var KEYS = 'qwertyuiop[]\\';
  var FRETS = Array.from({ length: 13 }, function (_, n) { return 160 + 720 * (1 - Math.pow(2, -n / 12)); });
  var context, master, packs = {}, instruments = [], activeDemo;

  function noteName(midi) {
    return ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'][midi % 12] + (Math.floor(midi / 12) - 1);
  }
  function stringY(string) { return 122 + (5 - string) * 11; }
  function fretCenter(n) { return n ? (FRETS[n - 1] + FRETS[n]) / 2 : 144; }
  function audio() {
    if (!context) {
      var Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('Audio unavailable');
      context = new Audio();
      master = context.createGain();
      master.gain.value = .42;
      var limiter = context.createDynamicsCompressor();
      limiter.threshold.value = -12;
      limiter.knee.value = 12;
      limiter.ratio.value = 5;
      master.connect(limiter);
      limiter.connect(context.destination);
    }
    return context.resume();
  }
  function loadPack(kind) {
    if (packs[kind]) return packs[kind];
    packs[kind] = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = new URL('../audio/guitar/' + kind + '.js', scriptURL).href;
      script.onerror = function () { script.remove(); reject(new Error('Sample load failed')); };
      script.onload = function () {
        script.remove();
        var samples = window.GUITAR_SAMPLES && window.GUITAR_SAMPLES[kind];
        if (!samples) { reject(new Error('Missing notes')); return; }
        Promise.all(samples.map(function (entry) {
          var raw = atob(entry.data);
          var bytes = Uint8Array.from(raw, function (c) { return c.charCodeAt(0); });
          return context.decodeAudioData(bytes.buffer).then(function (buffer) {
            return { midi: entry.midi, string: entry.string, buffer: buffer };
          });
        })).then(function (decoded) {
          delete window.GUITAR_SAMPLES[kind];
          resolve(decoded);
        }, reject);
      };
      document.head.appendChild(script);
    }).catch(function (error) { delete packs[kind]; throw error; });
    return packs[kind];
  }
  function ready(inst, play) {
    var intent = ++inst.intent;
    try {
      var resumed = audio();
      if (!inst.samples) inst.status.textContent = 'One little moment — I’m getting the guitar notes ready…';
      Promise.all([resumed, loadPack(inst.kind)]).then(function (values) {
        inst.samples = values[1];
        if (intent !== inst.intent || document.hidden) return;
        inst.status.textContent = 'Sound on. My ' + inst.kind + ' is ready to play. ♡';
        play();
      }).catch(function () {
        inst.status.textContent = 'I couldn’t load these notes. Tap a string to try again.';
      });
    } catch (_) {
      inst.status.textContent = 'This browser doesn’t have guitar audio. Try a browser with Web Audio.';
    }
  }
  function damp(voice) {
    if (!voice) return;
    var now = context.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(0, now, .012);
    try { voice.source.stop(now + .07); } catch (_) {}
  }
  function sound(inst, string, fret, velocity) {
    if (fret < 0 || !inst.samples) return;
    var midi = OPEN[string] + fret;
    var choices = inst.samples.filter(function (s) { return s.string === undefined || s.string === string; });
    var sample = choices.reduce(function (a, b) { return Math.abs(b.midi - midi) < Math.abs(a.midi - midi) ? b : a; });
    damp(inst.voices[string]);
    var source = context.createBufferSource(), gain = context.createGain();
    source.buffer = sample.buffer;
    source.playbackRate.value = Math.pow(2, (midi - sample.midi) / 12);
    gain.gain.value = velocity || .75;
    source.connect(gain);
    gain.connect(master);
    var voice = { source: source, gain: gain };
    inst.voices[string] = voice;
    source.onended = function () {
      source.disconnect(); gain.disconnect();
      if (inst.voices[string] === voice) inst.voices[string] = null;
    };
    source.start();
    var line = inst.svg.querySelector('[data-string="' + string + '"]');
    clearTimeout(inst.rings[string]);
    line.classList.add('is-ringing');
    inst.rings[string] = setTimeout(function () { line.classList.remove('is-ringing'); }, 220);
  }
  function stopDemo() {
    if (!activeDemo) return;
    activeDemo.timers.forEach(clearTimeout);
    activeDemo.inst.demo.textContent = 'hear a little tune ♪';
    activeDemo.inst.demo.setAttribute('aria-pressed', 'false');
    activeDemo.inst.status.textContent = 'My ' + activeDemo.inst.kind + ' is ready to play. ♡';
    activeDemo.inst.voices.forEach(damp);
    activeDemo = null;
  }
  function update(inst) {
    inst.fingers.innerHTML = inst.frets.map(function (fret, string) {
      var x = fretCenter(fret), y = stringY(string);
      return fret < 0
        ? '<text x="144" y="' + (y + 3) + '" text-anchor="middle" fill="#fff0ef" font-size="11">×</text>'
        : '<circle class="guitar-finger" cx="' + x + '" cy="' + y + '" r="' + (string === inst.selected ? 8 : 6) + '"/><text class="guitar-finger-label" x="' + x + '" y="' + (y + 3) + '" text-anchor="middle">' + fret + '</text>';
    }).join('');
    inst.card.querySelectorAll('[data-chord]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.chord === inst.chord));
    });
    var fret = inst.frets[inst.selected];
    inst.reading.textContent = (inst.chord === 'open' ? 'Open strings · ' : inst.chord ? inst.chord + ' chord · ' : '') + STRINGS[inst.selected] + ' · ' + (fret < 0 ? 'muted' : 'fret ' + fret + ' · ' + noteName(OPEN[inst.selected] + fret));
  }
  function pluck(inst, string, fret) {
    stopDemo();
    inst.selected = string;
    if (fret !== undefined) { inst.frets[string] = fret; inst.chord = ''; }
    update(inst);
    ready(inst, function () { sound(inst, string, inst.frets[string]); });
  }
  function strum(inst, up) {
    stopDemo();
    ready(inst, function () {
      var frets = inst.frets.slice(), order = up ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];
      var intent = inst.intent;
      order.forEach(function (string, i) {
        setTimeout(function () {
          if (intent === inst.intent) sound(inst, string, frets[string], .63 + i * .025);
        }, i * 24);
      });
    });
  }
  function demo(inst) {
    if (activeDemo && activeDemo.inst === inst) { stopDemo(); return; }
    stopDemo();
    ready(inst, function () {
      // An original two-bar melody, followed by a short fingerpicked Am–C–G–Em progression.
      var events = [[0,5,0],[1,5,3],[2,4,1],[3,4,3],[4,5,0],[5,4,3],[6,4,1],[7,3,2]];
      ['Am', 'C', 'G', 'Em'].forEach(function (name, bar) {
        var bass = name === 'G' || name === 'Em' ? 0 : 1;
        [bass, 3, 4, 5, 4, 3, 4, 5].forEach(function (s, beat) {
          events.push([8 + bar * 8 + beat, s, CHORDS[name][s], name, beat === 0]);
        });
      });
      var run = { inst: inst, timers: [] };
      activeDemo = run;
      inst.demo.textContent = 'stop the tune ■';
      inst.demo.setAttribute('aria-pressed', 'true');
      events.forEach(function (event) {
        run.timers.push(setTimeout(function () {
          if (activeDemo !== run) return;
          if (event[4]) { inst.frets = CHORDS[event[3]].slice(); inst.chord = event[3]; }
          else if (!event[3]) { inst.chord = ''; inst.frets[event[1]] = event[2]; }
          inst.selected = event[1];
          update(inst);
          sound(inst, event[1], event[2], .75);
        }, event[0] * 260));
      });
      run.timers.push(setTimeout(stopDemo, 40 * 260 + 1000));
      inst.status.textContent = 'A little original tune, then Am · C · G · Em. I can stop it with Escape.';
    });
  }

  function drawing(kind) {
    var id = 'g-' + kind, electric = kind === 'electric';
    var body = electric
      ? '<path d="M617 125C660 114 619 59 651 40C667 82 712 88 738 63C774 24 860 37 905 73C959 112 981 194 930 240C882 284 796 267 753 238C722 217 698 212 670 231C644 251 613 240 610 217C655 206 667 170 617 175Z" fill="url(#' + id + '-body)" stroke="#563368" stroke-width="4"/><path d="M660 112Q700 105 731 85Q718 140 754 158Q780 175 760 207Q720 198 681 215Q696 175 655 169Z" fill="#f5edf1" stroke="#bcaabd" stroke-width="2"/><rect x="705" y="110" width="23" height="80" rx="5" fill="#403348" stroke="#c9b8c9" stroke-width="3"/><rect x="790" y="110" width="23" height="80" rx="5" fill="#403348" stroke="#c9b8c9" stroke-width="3"/><path d="M855 184L897 220" stroke="#ddd6df" stroke-width="4"/><circle cx="845" cy="225" r="12" fill="url(#' + id + '-metal)" stroke="#775f81"/><circle cx="876" cy="236" r="10" fill="url(#' + id + '-metal)" stroke="#775f81"/><path d="M750 64Q836 34 900 79" fill="none" stroke="#e1bcf1" stroke-width="5" opacity=".5"/>'
      : '<path d="M617 121C657 111 666 55 716 51C758 47 774 84 795 83C816 82 837 38 889 46C951 55 979 116 972 164C967 227 926 264 870 260C823 257 801 219 777 219C755 219 731 248 694 238C644 224 654 184 617 178Z" fill="url(#' + id + '-body)" stroke="#9b6238" stroke-width="4"/><path d="M622 125C662 117 674 61 716 58C759 54 776 92 796 90C820 89 839 45 888 53C942 60 970 117 965 164C961 218 925 255 872 253C822 250 805 211 777 212C751 211 732 240 696 231C650 218 664 179 622 173Z" fill="none" stroke="#efd1a0" stroke-width="3"/><circle cx="733" cy="150" r="48" fill="#bb7c43" stroke="#64402b" stroke-width="3"/><circle cx="733" cy="150" r="42" fill="#ead4ac" stroke="#956033" stroke-width="2"/><circle cx="733" cy="150" r="36" fill="#302320"/><path d="M756 181Q807 177 821 213Q770 226 749 192Z" fill="#673d34" opacity=".9"/><path d="M841 72Q926 85 940 126M670 190Q677 211 704 216" fill="none" stroke="#ffe5b7" stroke-width="4" opacity=".5"/>';
    var frets = FRETS.slice(1).map(function (x, i) {
      return '<path d="M' + x + ' 111V189" stroke="#b7a79a" stroke-width="3"/><path d="M' + (x - .7) + ' 112V188" stroke="#eee2d3" stroke-width=".9"/><text x="' + fretCenter(i + 1) + '" y="102" text-anchor="middle" fill="#705775" font-size="10">' + (i + 1) + '</text>';
    }).join('');
    var dots = [3, 5, 7, 9, 12].map(function (n) {
      return n === 12 ? '<circle cx="' + fretCenter(n) + '" cy="137" r="3.5" fill="#ead9c6"/><circle cx="' + fretCenter(n) + '" cy="162" r="3.5" fill="#ead9c6"/>' : '<circle cx="' + fretCenter(n) + '" cy="150" r="4" fill="#ead9c6"/>';
    }).join('');
    var strings = OPEN.map(function (_, string) {
      var y = stringY(string);
      return '<path class="guitar-string" data-string="' + string + '" d="M' + (string < 3 ? 53 : 99) + ' ' + (string < 3 ? 124 + string * 15 : 130 + (string - 3) * 15) + 'L160 ' + y + 'H876" fill="none" stroke="' + (string < 3 ? '#d4bd8e' : '#e5e5e7') + '" stroke-width="' + (1 + (5 - string) * .18) + '"/><text x="126" y="' + (y + 3) + '" text-anchor="middle" fill="#e8dddf" font-size="9">' + (string === 5 ? 'e' : STRINGS[string].replace('low ', '')) + '</text>';
    }).join('');
    return '<defs><linearGradient id="' + id + '-body" x2=".2" y2="1"><stop stop-color="' + (electric ? '#a071ba' : '#e2b778') + '"/><stop offset=".4" stop-color="' + (electric ? '#754995' : '#d29d5f') + '"/><stop offset="1" stop-color="' + (electric ? '#482c64' : '#b57c47') + '"/></linearGradient><linearGradient id="' + id + '-metal" x2="0" y2="1"><stop stop-color="#8b8590"/><stop offset=".45" stop-color="#f5f0f4"/><stop offset="1" stop-color="#9d95a0"/></linearGradient><pattern id="' + id + '-grain" width="9" height="7" patternUnits="userSpaceOnUse"><path d="M0 3H9" stroke="#f0c997" opacity=".15"/></pattern></defs>' +
      '<ellipse cx="788" cy="264" rx="164" ry="9" fill="#7f5b7e" opacity=".09"/>' + body +
      '<path d="M148 111H620V189H148Z" fill="#45302c" stroke="#9c7861" stroke-width="2"/><path d="M164 113H615V187H164Z" fill="url(#' + id + '-grain)"/>' + frets + dots +
      '<path d="M153 114L109 110L93 96L37 102L29 193L90 201L110 185L153 185Z" fill="' + (electric ? '#684184' : '#b88051') + '" stroke="' + (electric ? '#503163' : '#815532') + '" stroke-width="3"/><path d="M160 111V189" stroke="#f7ead0" stroke-width="6"/>' +
      [0, 1, 2].map(function (i) { return '<rect x="23" y="' + (113 + i * 28) + '" width="15" height="15" rx="5" fill="url(#' + id + '-metal)"/><rect x="100" y="' + (113 + i * 28) + '" width="15" height="15" rx="5" fill="url(#' + id + '-metal)"/>'; }).join('') +
      '<rect x="856" y="112" width="29" height="76" rx="5" fill="' + (electric ? '#b9b1c1' : '#56382c') + '" stroke="#684d50"/><path d="M871 119V181" stroke="#f4e6d1" stroke-width="4"/>' + strings + '<g class="guitar-fingers" pointer-events="none"></g>';
  }

  ['acoustic', 'electric'].forEach(function (kind) {
    var card = document.createElement('article');
    card.className = 'playable-guitar';
    card.dataset.instrument = kind;
    var name = kind === 'acoustic' ? 'A little acoustic afternoon' : 'Something a little louder';
    card.innerHTML = '<h4 id="' + kind + '-play-title">' + name + ' ♡</h4><p class="guitar-caption">' + (kind === 'acoustic' ? 'Warm steel strings, a wooden body, and a softer sort of day.' : 'Amethyst, silver, and a clean electric shimmer. Very me.') + '</p>' +
      '<div class="guitar-window"><svg class="guitar-drawing" viewBox="0 0 1000 290" tabindex="0" role="application" aria-label="Playable ' + kind + ' guitar: twelve frets and six strings" aria-describedby="guitar-playing-help" xmlns="http://www.w3.org/2000/svg">' + drawing(kind) + '</svg></div>' +
      '<div class="guitar-reading"><output aria-label="Selected note"></output><button type="button" class="guitar-paper-link guitar-zoom" aria-expanded="false">a closer look at the frets ↗</button></div>' +
      '<div class="guitar-controls" role="group" aria-label="' + kind + ' chord shapes"><span>My chord scribbles:</span>' + Object.keys(CHORDS).map(function (chord) { return '<button type="button" class="guitar-chord" data-chord="' + chord + '" aria-pressed="false">' + chord + '</button>'; }).join('') + '<button type="button" class="guitar-chord" data-chord="open">open</button></div>' +
      '<div class="guitar-actions"><button type="button" class="guitar-down">strum ↓</button><button type="button" class="guitar-up">strum ↑</button><button type="button" class="guitar-demo" aria-pressed="false">hear a little tune ♪</button><button type="button" class="guitar-hush">hush the strings</button></div><p class="guitar-status" role="status">My sound wakes up when you play the first note.</p>';
    root.appendChild(card);
    var inst = {
      kind: kind, card: card, svg: card.querySelector('svg'), fingers: card.querySelector('.guitar-fingers'),
      reading: card.querySelector('output'), status: card.querySelector('.guitar-status'), demo: card.querySelector('.guitar-demo'),
      frets: [0, 0, 0, 0, 0, 0], chord: 'open', selected: 5, voices: [], rings: [], intent: 0
    };
    instruments.push(inst);
    update(inst);
    card.querySelectorAll('[data-chord]').forEach(function (button) {
      button.addEventListener('click', function () {
        stopDemo(); ++inst.intent;
        inst.voices.forEach(damp);
        inst.frets = button.dataset.chord === 'open' ? [0, 0, 0, 0, 0, 0] : CHORDS[button.dataset.chord].slice();
        inst.chord = button.dataset.chord;
        update(inst);
        strum(inst, false);
      });
    });
    card.querySelector('.guitar-down').addEventListener('click', function () { strum(inst, false); });
    card.querySelector('.guitar-up').addEventListener('click', function () { strum(inst, true); });
    inst.demo.addEventListener('click', function () { demo(inst); });
    card.querySelector('.guitar-hush').addEventListener('click', function () {
      stopDemo(); ++inst.intent;
      inst.voices.forEach(damp);
      inst.status.textContent = 'A little quiet. Ready whenever you are. ♡';
    });
    card.querySelector('.guitar-zoom').addEventListener('click', function (event) {
      var viewport = card.querySelector('.guitar-window');
      var close = viewport.classList.toggle('is-close');
      event.currentTarget.setAttribute('aria-expanded', String(close));
      event.currentTarget.textContent = close ? 'see the whole guitar ↙' : 'a closer look at the frets ↗';
      if (close) viewport.scrollLeft = 100;
    });
    var held = null, previous = '';
    function hit(event) {
      var point = new DOMPoint(event.clientX, event.clientY).matrixTransform(inst.svg.getScreenCTM().inverse());
      if (point.x < 135 || point.x > 900 || point.y < 112 || point.y > 187) return;
      var string = Math.max(0, Math.min(5, 5 - Math.round((point.y - 122) / 11)));
      var fret;
      if (point.x <= FRETS[12]) {
        fret = point.x <= 160 ? 0 : FRETS.findIndex(function (x) { return x >= point.x; });
      }
      var key = string + ':' + fret;
      if (key === previous) return;
      previous = key;
      pluck(inst, string, fret);
    }
    inst.svg.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      held = event.pointerId; previous = '';
      inst.svg.focus({ preventScroll: true });
      inst.svg.setPointerCapture(event.pointerId);
      hit(event);
    });
    inst.svg.addEventListener('pointermove', function (event) { if (event.pointerId === held) hit(event); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (name) {
      inst.svg.addEventListener(name, function () { held = null; previous = ''; });
    });
    inst.svg.addEventListener('keydown', function (event) {
      if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) return;
      var key = event.key.toLowerCase(), index = KEYS.indexOf(key);
      if (/^[1-6]$/.test(key)) pluck(inst, 6 - Number(key));
      else if (key === ' ' || key === 'enter') strum(inst, event.shiftKey);
      else if (key === 'arrowup' || key === 'arrowdown') {
        inst.selected = Math.max(0, Math.min(5, inst.selected + (key === 'arrowup' ? 1 : -1))); update(inst);
      } else if (key === 'arrowleft' || key === 'arrowright') {
        pluck(inst, inst.selected, Math.max(0, Math.min(12, inst.frets[inst.selected] + (key === 'arrowleft' ? -1 : 1))));
      } else if (key === 'escape') { stopDemo(); ++inst.intent; inst.voices.forEach(damp); }
      else if (key.length === 1 && index >= 0) pluck(inst, inst.selected, index);
      else return;
      event.preventDefault();
    });
  });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') quiet(); });
  function quiet() {
    stopDemo();
    instruments.forEach(function (inst) { ++inst.intent; inst.voices.forEach(damp); });
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) quiet(); });
  window.addEventListener('pagehide', quiet);
})();
