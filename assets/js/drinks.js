(function () {
  'use strict';
  var data = window.DRINKS;
  if (!data) return;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var drinks = {};
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }
  function picture(src, alt, width, height) {
    var image = el('img'); image.src = src; image.alt = alt; image.width = width; image.height = height; image.loading = 'lazy';
    return image;
  }
  function glide(node, block) {
    node.scrollIntoView({ block: block || 'start', behavior: motion.matches ? 'auto' : 'smooth' });
  }
  function q(selector) { return document.querySelector(selector); }

  /* The daytime menu cards */
  function drinkCard(drink) {
    var card = el('article', 'd-card' + (drink.featured ? ' d-card-featured' : '')), art = el('div', 'd-card-art'), body = el('div', 'd-card-body');
    card.id = drink.id;
    art.append(picture(drink.image, drink.alt, 440, 330));
    if (drink.sticker) art.append(el('span', 'd-sticker hand', drink.sticker));
    body.append(el('span', 'd-card-label hand', drink.label), el('h3', '', drink.title), el('p', 'd-tags', drink.tags), el('p', 'd-card-text', drink.description), el('p', 'd-card-note hand', drink.note));
    card.append(art, body);
    return card;
  }
  document.querySelectorAll('[data-menu]').forEach(function (shelf) {
    data.menu[shelf.dataset.menu].forEach(function (drink) { drinks[drink.id] = drink; shelf.append(drinkCard(drink)); });
  });
  function showCard(id, scroll) {
    var card = document.getElementById(id);
    card.classList.remove('d-found'); void card.offsetWidth; card.classList.add('d-found');
    if (scroll) glide(card, 'center');
  }

  /* What are we drinking? */
  var moods = q('[data-moods]'), pour = q('[data-pour]');
  var pourLink = pour.querySelector('[data-pour-link]');
  data.moods.forEach(function (mood) {
    var button = el('button', 'd-mood', mood.label);
    button.type = 'button'; button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', function () {
      var drink = drinks[mood.drink];
      moods.querySelectorAll('button').forEach(function (other) { other.setAttribute('aria-pressed', other === button ? 'true' : 'false'); });
      var image = pour.querySelector('[data-pour-image]');
      image.src = drink.image; image.alt = drink.alt; image.width = 440; image.height = 330;
      pour.querySelector('[data-pour-label]').textContent = mood.label.toLowerCase() + '? I’d pour you…';
      pour.querySelector('[data-pour-title]').textContent = drink.title;
      pour.querySelector('[data-pour-tags]').textContent = drink.tags;
      pour.querySelector('[data-pour-line]').textContent = mood.line;
      pourLink.href = '#' + drink.id; pourLink.hidden = false;
      pour.classList.add('d-poured');
      pour.classList.remove('d-pop'); void pour.offsetWidth; pour.classList.add('d-pop');
      q('[data-pour-status]').textContent = mood.label + ': ' + drink.title + '.';
    });
    moods.append(button);
  });
  pourLink.addEventListener('click', function (event) {
    event.preventDefault();
    var id = pourLink.getAttribute('href').slice(1);
    history.replaceState(null, '', '#' + id);
    showCard(id, true);
    document.getElementById(id).querySelector('h3').setAttribute('tabindex', '-1');
    document.getElementById(id).querySelector('h3').focus({ preventScroll: true });
  });

  /* The fridge */
  var canCard = q('[data-can-card]');
  function showCan(can) {
    document.querySelectorAll('.d-can').forEach(function (button) { button.setAttribute('aria-pressed', button.id === 'can-' + can.id ? 'true' : 'false'); });
    canCard.querySelector('[data-can-image]').src = 'assets/art/drinks/can-' + can.id + '.svg';
    canCard.querySelector('[data-can-number]').textContent = can.favorite ? 'my number one ♡' : can.maker;
    canCard.querySelector('[data-can-name]').textContent = can.maker + ' ' + can.name;
    canCard.querySelector('[data-can-flavor]').textContent = can.flavor;
    canCard.querySelector('[data-can-note]').textContent = can.note;
    canCard.querySelector('[data-can-caffeine]').textContent = can.caffeine;
    var link = canCard.querySelector('[data-can-link]');
    link.href = can.link; link.setAttribute('aria-label', 'Official ' + can.maker + ' ' + can.name + ' page (opens in a new tab)');
    canCard.classList.remove('d-pop'); void canCard.offsetWidth; canCard.classList.add('d-pop');
  }
  data.cans.forEach(function (can) {
    var button = el('button', 'd-can' + (can.favorite ? ' d-can-favorite' : ''));
    button.type = 'button'; button.id = 'can-' + can.id; button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', can.maker + ' ' + can.name + (can.favorite ? ', my number one' : ''));
    if (can.favorite) button.append(el('span', 'd-can-crown', 'No.1 ♡'));
    button.append(picture('assets/art/drinks/can-' + can.id + '.svg', '', 160, 260), el('span', 'd-can-tag hand', can.tag || can.name));
    button.addEventListener('click', function () { showCan(can); });
    q('[data-shelf="' + can.shelf + '"]').append(button);
  });
  var water = el('span', 'd-shelf-water');
  water.append(picture('assets/art/drinks/water.svg', '', 200, 220), el('span', 'hand', 'and water, obviously'));
  q('[data-shelf="bottom"]').append(water);
  showCan(data.cans.find(function (can) { return can.favorite; }));

  /* The cabinet, fold-out menu, and personal notebook */
  var cabinet = q('[data-cabinet]'), inside = q('[data-cabinet-inside]'), toggle = q('[data-cabinet-toggle]'), notebook = q('[data-notebook]');
  var menu = q('[data-cocktail-menu]');
  function chooseCocktail(drink, focus) {
    document.querySelectorAll('[data-cocktail]').forEach(function (button) { button.setAttribute('aria-pressed', button.dataset.cocktail === drink.id ? 'true' : 'false'); });
    var image = notebook.querySelector('[data-cocktail-image]');
    image.src = drink.image; image.alt = drink.alt;
    notebook.querySelector('[data-cocktail-label]').textContent = drink.label;
    notebook.querySelector('[data-cocktail-name]').textContent = drink.name;
    notebook.querySelector('[data-cocktail-tags]').textContent = drink.tags;
    notebook.querySelector('[data-cocktail-occasion]').textContent = 'For ' + drink.occasion.charAt(0).toLowerCase() + drink.occasion.slice(1);
    notebook.querySelector('[data-cocktail-note]').textContent = drink.note;
    notebook.querySelector('[data-cocktail-description]').textContent = drink.description;
    var journal = notebook.querySelector('[data-cocktail-journal]');
    journal.replaceChildren();
    drink.journal.forEach(function (entry) { journal.append(el('h4', 'hand', entry[0]), el('p', '', entry[1])); });
    notebook.querySelector('[data-cocktail-margin]').textContent = drink.margin;
    notebook.classList.remove('d-pop'); void notebook.offsetWidth; notebook.classList.add('d-pop');
    if (focus) {
      glide(notebook, 'nearest');
      notebook.querySelector('[data-cocktail-name]').focus({ preventScroll: true });
    }
  }
  [data.cocktails.slice(0, 3), data.cocktails.slice(3)].forEach(function (row) {
    var shelf = el('div', 'd-cabinet-shelf');
    row.forEach(function (drink) {
      var button = el('button', 'd-glass');
      button.type = 'button'; button.dataset.cocktail = drink.id; button.setAttribute('aria-pressed', 'false');
      button.append(picture(drink.image, '', 320, 330), el('span', 'd-glass-name', drink.name));
      button.addEventListener('click', function () { chooseCocktail(drink, true); });
      shelf.append(button);
    });
    inside.append(shelf);
  });
  data.cocktails.forEach(function (drink) {
    var item = el('li'), button = el('button', 'd-foldout-row' + (drink.signature ? ' d-signature' : ''));
    button.type = 'button'; button.dataset.cocktail = drink.id; button.setAttribute('aria-pressed', 'false');
    var name = el('span', 'd-foldout-name', drink.name);
    if (drink.signature) name.append(el('span', 'd-foldout-cherry', ' ♥'));
    button.append(name, el('span', 'd-foldout-tags', drink.tags), el('span', 'd-foldout-occasion hand', drink.occasion));
    button.addEventListener('click', function () { chooseCocktail(drink, true); });
    item.append(button); menu.append(item);
  });
  function setCabinet(open) {
    cabinet.classList.toggle('d-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.textContent = open ? 'close my cabinet' : 'open my cabinet ♡';
    inside.inert = !open;
  }
  toggle.addEventListener('click', function () { setCabinet(toggle.getAttribute('aria-expanded') !== 'true'); });
  setCabinet(false);
  chooseCocktail(data.cocktails[0], false);

  /* Links like drinks.html#cherry-lemonade, #mixxd-punch or #aviation */
  function fromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (drinks[id]) { showCard(id, true); return; }
    var can = data.cans.find(function (entry) { return entry.id === id || 'can-' + entry.id === id; });
    if (can) { showCan(can); glide(q('.d-fridge-layout'), 'center'); return; }
    var drink = data.cocktails.find(function (entry) { return entry.id === id; });
    if (drink) { setCabinet(true); chooseCocktail(drink, false); glide(notebook); }
  }
  // The handwriting font changes the page height when it swaps in, so scroll after it arrives.
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(fromHash);
  window.addEventListener('hashchange', fromHash);
})();
