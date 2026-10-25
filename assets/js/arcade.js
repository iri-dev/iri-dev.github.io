/* The arcade: two tiny canvas games sharing one screen, one loop and one set of controls.
   Scores only ever live in this browser. */
(function () {
  var canvas = document.getElementById('game');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 360, H = 480;
  var overlay = document.getElementById('overlay');
  var overlayTitle = document.getElementById('overlay-title');
  var overlayText = document.getElementById('overlay-text');
  var startBtn = document.getElementById('overlay-start');
  var scoreEl = document.getElementById('score');
  var bestEl = document.getElementById('best');
  var live = document.getElementById('game-live');

  function fit() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fit();

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(list) {
    var total = 0, i;
    for (i = 0; i < list.length; i++) total += list[i].weight;
    var r = Math.random() * total;
    for (i = 0; i < list.length; i++) { r -= list[i].weight; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }
  function getBest(key) { try { return +localStorage.getItem('iri-arcade-' + key) || 0; } catch (e) { return 0; } }
  function setBest(key, v) { try { localStorage.setItem('iri-arcade-' + key, String(v)); } catch (e) { /* not remembered */ } }

  function paper() {
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(161, 83, 206, .09)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var x = 12; x < W; x += 24) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
    for (var y = 12; y < H; y += 24) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
    ctx.stroke();
  }
  function heartPath(cx, cy, s) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + s);
    ctx.bezierCurveTo(cx - s * .2, cy + s * .8, cx - s, cy + s * .3, cx - s, cy - s * .2);
    ctx.bezierCurveTo(cx - s, cy - s * .75, cx - s * .2, cy - s * .85, cx, cy - s * .35);
    ctx.bezierCurveTo(cx + s * .2, cy - s * .85, cx + s, cy - s * .75, cx + s, cy - s * .2);
    ctx.bezierCurveTo(cx + s, cy + s * .3, cx + s * .2, cy + s * .8, cx, cy + s);
    ctx.closePath();
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function text(str, x, y, size, colour, align, family) {
    ctx.font = '700 ' + size + 'px ' + (family || 'Nunito, sans-serif');
    ctx.fillStyle = colour;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
  }
  function hand(str, x, y, size, colour, align) { text(str, x, y, size, colour, align, 'Caveat, cursive'); }

  /* Floating words and hearts, shared by both games. */
  var pops = [];
  function pop(str, x, y, colour) { pops.push({ str: str, x: x, y: y, t: 0, colour: colour || '#d13a87' }); }
  function drawPops(dt) {
    for (var i = pops.length - 1; i >= 0; i--) {
      var p = pops[i];
      p.t += dt;
      if (p.t > 1) { pops.splice(i, 1); continue; }
      ctx.globalAlpha = 1 - p.t;
      hand(p.str, p.x, p.y - p.t * 40, 26, p.colour, 'center');
      ctx.globalAlpha = 1;
    }
  }

  /* ------------------------------------------------------------------ Fill up Hydra */
  var DRINKS = [
    { kind: 'water', fill: 12, caff: 0, ml: 250, weight: 40 },
    { kind: 'tea', fill: 8, caff: 0, ml: 200, weight: 18 },
    { kind: 'boba', fill: 6, caff: 0, ml: 300, weight: 14 },
    { kind: 'coffee', fill: 3, caff: 1, ml: 150, weight: 18 },
    { kind: 'energy', fill: 2, caff: 2, ml: 250, weight: 10 }
  ];

  function drawDrink(d) {
    var x = d.x, y = d.y;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(d.wob) * .15);
    if (d.kind === 'water') {
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.bezierCurveTo(14, 0, 14, 16, 0, 16);
      ctx.bezierCurveTo(-14, 16, -14, 0, 0, -18);
      ctx.fillStyle = '#8cc8ff'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.beginPath(); ctx.ellipse(-5, 4, 3, 6, -.4, 0, Math.PI * 2); ctx.fill();
    } else if (d.kind === 'tea') {
      roundRect(-13, -10, 26, 22, 6); ctx.fillStyle = '#9adcbc'; ctx.fill();
      ctx.strokeStyle = '#9adcbc'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(14, 0, 6, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.fillStyle = '#5fb487'; roundRect(-13, -10, 26, 6, 3); ctx.fill();
    } else if (d.kind === 'boba') {
      ctx.strokeStyle = '#d13a87'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(4, -12); ctx.lineTo(9, -24); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(12, -12); ctx.lineTo(9, 16); ctx.lineTo(-9, 16); ctx.closePath();
      ctx.fillStyle = '#e8d4f6'; ctx.fill();
      ctx.fillStyle = '#5a3646';
      [[-5, 11], [0, 12], [5, 11], [-2, 7], [3, 7]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 2.4, 0, Math.PI * 2); ctx.fill(); });
    } else if (d.kind === 'coffee') {
      roundRect(-13, -11, 26, 24, 6); ctx.fillStyle = '#b07a5a'; ctx.fill();
      ctx.strokeStyle = '#b07a5a'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(14, 1, 6, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.fillStyle = '#e9c9a8'; roundRect(-13, -11, 26, 6, 3); ctx.fill();
      ctx.strokeStyle = 'rgba(176,122,90,.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-4, -16); ctx.quadraticCurveTo(-8, -20, -4, -24); ctx.moveTo(4, -16); ctx.quadraticCurveTo(0, -20, 4, -24); ctx.stroke();
    } else {
      roundRect(-10, -16, 20, 32, 4); ctx.fillStyle = '#ffd36a'; ctx.fill();
      ctx.fillStyle = '#e0619c'; ctx.fillRect(-10, -4, 20, 8);
      ctx.fillStyle = '#c9c2b6'; roundRect(-8, -19, 16, 5, 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawHydra(s) {
    var x = s.x, y = H - 72, size = 44;
    ctx.save();
    heartPath(x, y, size);
    ctx.fillStyle = '#eef8ff'; ctx.fill();
    ctx.save();
    ctx.clip();
    var level = y + size - (s.fill / 100) * size * 1.95;
    ctx.fillStyle = s.tint;
    ctx.fillRect(x - size - 4, level, size * 2 + 8, size * 2);
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3;
    ctx.beginPath();
    for (var i = -size; i <= size; i += 4) ctx.lineTo(x + i, level + Math.sin((i + s.time * 90) / 9) * 2);
    ctx.stroke();
    ctx.restore();
    heartPath(x, y, size);
    ctx.strokeStyle = '#9fd0ff'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.ellipse(x - 22, y - 20, 7, 4, -.6, 0, Math.PI * 2); ctx.fill();
    var worried = s.caff >= 3, happy = !worried && s.fill > 60;
    ctx.fillStyle = '#2b5d8f'; ctx.strokeStyle = '#2b5d8f'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x - 12, y - 2, 3.4, 0, Math.PI * 2); ctx.arc(x + 12, y - 2, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    if (worried) {
      ctx.moveTo(x - 7, y + 12); ctx.quadraticCurveTo(x, y + 6, x + 7, y + 12);
      ctx.moveTo(x - 18, y - 10); ctx.lineTo(x - 8, y - 13); ctx.moveTo(x + 18, y - 10); ctx.lineTo(x + 8, y - 13);
    } else if (happy) {
      ctx.moveTo(x - 8, y + 6); ctx.quadraticCurveTo(x, y + 15, x + 8, y + 6);
    } else {
      ctx.moveTo(x - 6, y + 8); ctx.quadraticCurveTo(x, y + 12, x + 6, y + 8);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,198,224,.9)';
    ctx.beginPath(); ctx.arc(x - 22, y + 6, 4.5, 0, Math.PI * 2); ctx.arc(x + 22, y + 6, 4.5, 0, Math.PI * 2); ctx.fill();
    if (s.goals > 0) {
      ctx.fillStyle = '#ffd36a';
      ctx.beginPath();
      ctx.moveTo(x - 16, y - 34); ctx.lineTo(x - 12, y - 48); ctx.lineTo(x - 5, y - 38); ctx.lineTo(x, y - 52);
      ctx.lineTo(x + 5, y - 38); ctx.lineTo(x + 12, y - 48); ctx.lineTo(x + 16, y - 34); ctx.closePath(); ctx.fill();
    }
    if (worried && Math.floor(s.time * 10) % 2) {
      ctx.fillStyle = '#8cc8ff';
      ctx.beginPath(); ctx.ellipse(x + 34, y - 18, 3, 5, .3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  var hydra = {
    key: 'hydra',
    title: 'Fill up Hydra',
    intro: 'Catch drinks to fill Hydra up. Water helps most. Too much coffee or energy drink and she gets jittery!',
    controls: 'Move with ← → or A D, drag on the screen, or hold the arrows below.',
    reset: function () {
      this.s = { x: W / 2, target: null, fill: 0, caff: 0, goals: 0, ml: 0, items: [], spawn: .4, time: 0, tint: '#8cc8ff', cheer: 0 };
    },
    score: function () { return this.s.ml; },
    scoreText: function () { return this.s.ml + ' ml'; },
    update: function (dt, keys) {
      var s = this.s;
      s.time += dt;
      var dir = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
      if (dir) { s.x += dir * 280 * dt; s.target = null; }
      else if (s.target !== null) s.x += (s.target - s.x) * Math.min(1, dt * 12);
      s.x = Math.max(46, Math.min(W - 46, s.x));
      s.caff = Math.max(0, s.caff - dt / 5);
      s.spawn -= dt;
      if (s.spawn <= 0) {
        var d = pick(DRINKS);
        s.items.push({ kind: d.kind, def: d, x: rand(24, W - 24), y: -24, v: 110 + s.goals * 18 + rand(0, 40), wob: rand(0, 6) });
        s.spawn = Math.max(.38, .95 - s.goals * .07) * rand(.75, 1.25);
      }
      for (var i = s.items.length - 1; i >= 0; i--) {
        var it = s.items[i];
        it.y += it.v * dt;
        it.wob += dt * 4;
        if (it.y > H - 112 && it.y < H - 60 && Math.abs(it.x - s.x) < 46) {
          s.items.splice(i, 1);
          s.fill += it.def.fill;
          s.caff += it.def.caff;
          s.ml += it.def.ml;
          s.tint = { water: '#8cc8ff', tea: '#9adcbc', boba: '#d9b8f0', coffee: '#c99a7a', energy: '#ffd36a' }[it.kind];
          pop(it.def.caff ? (s.caff >= 3 ? 'eek, caffeine!' : '+' + it.def.ml + 'ml') : '+' + it.def.ml + 'ml', it.x, H - 130, it.def.caff ? '#b07a5a' : '#8f43bd');
          if (s.fill >= 100) {
            s.fill = 0;
            s.goals += 1;
            s.cheer = 1.6;
            say('Goal reached! Hydra is so proud of you. Goals: ' + s.goals);
          }
          if (s.caff >= 5) return 'Hydra got way too jittery! ' + s.ml + ' ml before the coffee won.';
        } else if (it.y > H + 30) {
          s.items.splice(i, 1);
        }
      }
      s.cheer = Math.max(0, s.cheer - dt);
      return null;
    },
    draw: function () {
      var s = this.s;
      paper();
      s.items.forEach(drawDrink);
      drawHydra(s);
      hand('goals ♡ ' + s.goals, 16, 24, 26, '#8f43bd');
      text('caffeine', W - 112, 24, 12, '#7d6e8f');
      for (var i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.ellipse(W - 52 + i * 10 - 10, 40, 4, 5.5, .5, 0, Math.PI * 2);
        ctx.fillStyle = i < Math.ceil(s.caff - .05) ? '#b07a5a' : 'rgba(176,122,90,.2)'; ctx.fill();
      }
      text(s.ml + ' ml', 16, 52, 14, '#3a2443');
      if (s.cheer > 0) {
        ctx.globalAlpha = Math.min(1, s.cheer);
        hand('goal reached! ♡', W / 2, H / 2 - 40, 44, '#d13a87', 'center');
        ctx.globalAlpha = 1;
      }
    },
    pointer: function (x) { this.s.target = x; }
  };

  /* ------------------------------------------------------------------ Squash the bugs */
  var LINE_COLOURS = ['#c99be8', '#f29bc8', '#9adcbc', '#ffd36a', '#9fc8ff'];

  function drawBug(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle + Math.PI / 2);
    if (b.feature) {
      var s = 15;
      ctx.beginPath();
      for (var i = 0; i < 10; i++) {
        var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * .48 : s;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle = '#ffd36a'; ctx.fill();
      ctx.strokeStyle = '#e8a93a'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#6b3d00';
      ctx.beginPath(); ctx.arc(-4, 0, 1.6, 0, Math.PI * 2); ctx.arc(4, 0, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      return;
    }
    var wig = Math.sin(b.step) * 3;
    ctx.strokeStyle = '#4a2a66'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    for (var k = -1; k <= 1; k++) {
      ctx.moveTo(-6, k * 6); ctx.lineTo(-14, k * 7 + (k ? wig : -wig));
      ctx.moveTo(6, k * 6); ctx.lineTo(14, k * 7 + (k ? -wig : wig));
    }
    ctx.moveTo(-3, -12); ctx.lineTo(-7, -19); ctx.moveTo(3, -12); ctx.lineTo(7, -19);
    ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 3, 9, 12, 0, 0, Math.PI * 2); ctx.fillStyle = b.colour; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 15); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -10, 6, 0, Math.PI * 2); ctx.fillStyle = '#4a2a66'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-2.4, -11, 1.8, 0, Math.PI * 2); ctx.arc(2.4, -11, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  var bugs = {
    key: 'bugs',
    title: 'Squash the bugs',
    intro: 'Bugs are crawling into my code! Tap them before they break it. Three broken lines and the build fails. Careful: the gold ones are features.',
    controls: 'Click or tap a bug to squash it. Every 10 squashes, I fix a broken line.',
    reset: function () {
      var lines = [];
      for (var i = 0; i < 9; i++) {
        var segs = [], x = 34 + (i % 3 === 1 ? 18 : i % 3 === 2 ? 36 : 0);
        var n = 1 + Math.floor(Math.random() * 3);
        for (var j = 0; j < n && x < W - 60; j++) {
          var w = rand(36, 90);
          segs.push({ x: x, w: Math.min(w, W - 34 - x), c: LINE_COLOURS[Math.floor(Math.random() * LINE_COLOURS.length)] });
          x += w + 10;
        }
        lines.push({ y: 92 + i * 40, segs: segs, broken: false });
      }
      this.s = { lines: lines, bugs: [], spawn: 1, squashed: 0, time: 0, splats: [] };
    },
    score: function () { return this.s.squashed; },
    scoreText: function () { return this.s.squashed + ' squashed'; },
    broken: function () { return this.s.lines.filter(function (l) { return l.broken; }).length; },
    spawnBug: function () {
      var s = this.s;
      var ok = s.lines.filter(function (l) { return !l.broken; });
      if (!ok.length) return;
      var line = ok[Math.floor(Math.random() * ok.length)];
      var seg = line.segs[Math.floor(Math.random() * line.segs.length)];
      var side = Math.floor(Math.random() * 3);
      var sx = side === 0 ? -20 : side === 1 ? W + 20 : rand(20, W - 20);
      var sy = side === 2 ? H + 20 : rand(70, H - 40);
      var feature = Math.random() < .12;
      s.bugs.push({
        x: sx, y: sy, tx: seg.x + seg.w / 2, ty: line.y, line: line, angle: 0, step: 0, chew: 0, life: 0,
        v: (feature ? 50 : 45) + Math.min(70, s.squashed * 1.6) + rand(0, 20), feature: feature,
        colour: ['#a153ce', '#d13a87', '#5fb487'][Math.floor(Math.random() * 3)]
      });
    },
    update: function (dt) {
      var s = this.s;
      s.time += dt;
      s.spawn -= dt;
      if (s.spawn <= 0) {
        this.spawnBug();
        s.spawn = Math.max(.45, 1.4 - s.squashed * .03) * rand(.7, 1.2);
      }
      for (var i = s.bugs.length - 1; i >= 0; i--) {
        var b = s.bugs[i];
        b.life += dt;
        var dx = b.tx - b.x, dy = b.ty - b.y, dist = Math.hypot(dx, dy);
        if (b.feature && b.life > 6) { s.bugs.splice(i, 1); continue; }
        if (dist > 3) {
          b.angle = Math.atan2(dy, dx);
          b.x += dx / dist * b.v * dt;
          b.y += dy / dist * b.v * dt;
          b.step += dt * 18;
        } else if (b.feature) {
          b.tx = rand(30, W - 30); b.ty = rand(80, H - 40);
        } else {
          b.chew += dt;
          b.step += dt * 30;
          if (b.chew > 2.6) {
            b.line.broken = true;
            pop('it broke!', b.x, b.y - 10, '#d13a87');
            say('A line of code broke. Broken lines: ' + this.broken() + ' of 3.');
            s.bugs.splice(i, 1);
            if (this.broken() >= 3) return 'Build failed! You squashed ' + s.squashed + ' bugs first.';
          }
        }
      }
      for (var k = s.splats.length - 1; k >= 0; k--) { s.splats[k].t += dt; if (s.splats[k].t > .6) s.splats.splice(k, 1); }
      return null;
    },
    draw: function () {
      var s = this.s;
      paper();
      roundRect(14, 64, W - 28, H - 86, 12);
      ctx.fillStyle = 'rgba(161, 83, 206, .06)'; ctx.fill();
      ctx.strokeStyle = 'rgba(143, 67, 189, .25)'; ctx.lineWidth = 2; ctx.stroke();
      s.lines.forEach(function (l, i) {
        text(String(i + 1), 26, l.y, 11, 'rgba(125,110,143,.7)', 'center');
        l.segs.forEach(function (g) {
          roundRect(g.x, l.y - 5, g.w, 10, 5);
          ctx.fillStyle = l.broken ? '#e05a7a' : g.c;
          ctx.fill();
        });
        if (l.broken) hand('✗', W - 30, l.y, 24, '#e05a7a', 'center');
      });
      s.splats.forEach(function (p) {
        ctx.globalAlpha = 1 - p.t / .6;
        ctx.fillStyle = p.colour;
        for (var a = 0; a < 6; a++) {
          ctx.beginPath();
          ctx.arc(p.x + Math.cos(a) * p.t * 40, p.y + Math.sin(a) * p.t * 40, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      });
      s.bugs.forEach(drawBug);
      hand('squashed ' + s.squashed, 16, 30, 26, '#8f43bd');
      var br = this.broken();
      text('broken', W - 120, 30, 12, '#7d6e8f');
      for (var i = 0; i < 3; i++) {
        heartPath(W - 64 + i * 22, 30, 8);
        ctx.fillStyle = i < 3 - br ? '#d13a87' : 'rgba(209,58,135,.18)';
        ctx.fill();
      }
    },
    tap: function (x, y) {
      var s = this.s, hit = -1, best = 999;
      for (var i = 0; i < s.bugs.length; i++) {
        var d = Math.hypot(s.bugs[i].x - x, s.bugs[i].y - y);
        if (d < 26 && d < best) { best = d; hit = i; }
      }
      if (hit < 0) return null;
      var b = s.bugs.splice(hit, 1)[0];
      if (b.feature) {
        var ok = s.lines.filter(function (l) { return !l.broken; });
        if (ok.length) ok[Math.floor(Math.random() * ok.length)].broken = true;
        pop('that was a feature!', b.x, b.y, '#e8a93a');
        say('Oops, that was a feature. A line broke.');
        if (this.broken() >= 3) return 'Build failed! Squashing features is risky. ' + s.squashed + ' bugs squashed.';
        return null;
      }
      s.squashed += 1;
      s.splats.push({ x: b.x, y: b.y, t: 0, colour: b.colour });
      pop(['fixed!', 'squash!', 'gotcha', 'bye bug'][Math.floor(Math.random() * 4)], b.x, b.y);
      if (s.squashed % 10 === 0) {
        var broken = s.lines.filter(function (l) { return l.broken; });
        if (broken.length) { broken[0].broken = false; pop('line fixed ♡', W / 2, broken[0].y, '#5fb487'); say('Ten squashed. I fixed a broken line!'); }
      }
      return null;
    }
  };

  /* ------------------------------------------------------------------ shared loop */
  var games = { hydra: hydra, bugs: bugs };
  var game = hydra;
  var state = 'menu';
  var keys = { left: false, right: false };
  var last = 0;

  function say(msg) { if (live) live.textContent = msg; }
  function showOverlay(title, body, button) {
    overlayTitle.textContent = title;
    overlayText.textContent = body;
    startBtn.textContent = button;
    overlay.hidden = false;
  }
  function updateScore() {
    scoreEl.textContent = game.scoreText();
    bestEl.textContent = 'best: ' + getBest(game.key);
  }
  function choose(key) {
    game = games[key];
    state = 'menu';
    game.reset();
    pops.length = 0;
    document.querySelectorAll('[data-game]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.game === key ? 'true' : 'false'); });
    document.querySelectorAll('[data-howto]').forEach(function (n) { n.hidden = n.dataset.howto !== key; });
    showOverlay(game.title, game.intro + ' ' + game.controls, 'press start ♡');
    game.draw();
    updateScore();
  }
  function start() {
    game.reset();
    pops.length = 0;
    state = 'play';
    overlay.hidden = true;
    last = performance.now();
    say(game.title + ' started.');
    requestAnimationFrame(frame);
  }
  function pause() {
    if (state !== 'play') return;
    state = 'paused';
    showOverlay('paused', 'Take a sip of water. I\'ll wait.', 'keep playing');
  }
  function resume() {
    state = 'play';
    overlay.hidden = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
  function over(msg) {
    state = 'over';
    var score = game.score(), best = getBest(game.key), extra = '';
    if (score > best) { setBest(game.key, score); extra = ' New best! ♡'; }
    updateScore();
    showOverlay('game over', msg + extra, 'play again');
    say(msg + extra);
  }
  function frame(now) {
    if (state !== 'play') return;
    var dt = Math.min(.05, (now - last) / 1000);
    last = now;
    var end = game.update(dt, keys);
    game.draw();
    drawPops(dt);
    updateScore();
    if (end) { over(end); return; }
    requestAnimationFrame(frame);
  }
  function primary() {
    if (state === 'play') return;
    if (state === 'paused') resume(); else start();
  }

  startBtn.addEventListener('click', primary);
  document.querySelectorAll('[data-game]').forEach(function (b) {
    b.addEventListener('click', function () { choose(b.dataset.game); });
  });
  function toCanvas(e) {
    var r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }
  canvas.addEventListener('pointerdown', function (e) {
    if (state !== 'play') return;
    var p = toCanvas(e);
    if (game.tap) { var end = game.tap(p.x, p.y); if (end) over(end); }
    if (game.pointer) { game.pointer(p.x); canvas.setPointerCapture(e.pointerId); }
  });
  canvas.addEventListener('pointermove', function (e) {
    if (state !== 'play' || !game.pointer) return;
    if (e.pointerType === 'mouse' || e.buttons) game.pointer(toCanvas(e).x);
  });
  function hold(btn, key) {
    var on = function (e) { e.preventDefault(); keys[key] = true; };
    var off = function () { keys[key] = false; };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('pointercancel', off);
  }
  hold(document.getElementById('pad-left'), 'left');
  hold(document.getElementById('pad-right'), 'right');
  document.getElementById('pad-a').addEventListener('click', primary);
  document.getElementById('pad-b').addEventListener('click', function () { if (state === 'play') pause(); else if (state === 'paused') resume(); });
  document.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase();
    var inGame = state === 'play';
    if (k === 'arrowleft' || k === 'a') { keys.left = true; if (inGame) e.preventDefault(); }
    if (k === 'arrowright' || k === 'd') { keys.right = true; if (inGame) e.preventDefault(); }
    if (k === 'p' || (k === 'escape' && inGame)) { if (inGame) pause(); else if (state === 'paused') resume(); }
  });
  document.addEventListener('keyup', function (e) {
    var k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') keys.left = false;
    if (k === 'arrowright' || k === 'd') keys.right = false;
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); });

  var first = 'hydra';
  if (location.hash === '#bugs') first = 'bugs';
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (state === 'menu') game.draw(); });
  choose(first);
})();
