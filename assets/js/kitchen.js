(function () {
  'use strict';
  var data = window.KITCHEN;
  var book = document.getElementById('recipe-book');
  if (!data || !book) return;
  var index = book.querySelector('[data-recipe-index]');
  var title = book.querySelector('#recipe-title');
  var selected = 0;
  var pages = data.pages;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }
  function journal(container, entries) {
    container.replaceChildren();
    entries.forEach(function (entry) { container.append(el('h4', 'hand', entry[0]), el('p', '', entry[1])); });
  }
  function drawPage() {
    var recipe = pages[selected];
    title.textContent = recipe.title;
    book.querySelector('[data-recipe-label]').textContent = recipe.label;
    book.querySelector('[data-recipe-description]').textContent = recipe.description;
    book.querySelector('[data-recipe-note]').textContent = recipe.note;
    var image = book.querySelector('[data-recipe-image]');
    image.src = 'assets/art/kitchen/' + recipe.image + '.svg'; image.alt = recipe.alt;
    book.querySelector('[data-recipe-favorite]').hidden = !recipe.favorite;
    book.querySelector('[data-page-number]').textContent = 'page ' + (selected + 1) + ' of ' + pages.length;
    journal(book.querySelector('[data-food-journal]'), recipe.journal);
    book.querySelector('[data-food-margin]').textContent = recipe.margin;
    index.querySelectorAll('button').forEach(function (button, i) { button.setAttribute('aria-current', i === selected ? 'page' : 'false'); });
    book.querySelector('[data-recipe-announcement]').textContent = recipe.title + '. Page ' + (selected + 1) + ' of ' + pages.length + '.';
  }
  function choose(i, focus, updateHash) {
    selected = (i + pages.length) % pages.length;
    drawPage();
    if (updateHash) history.replaceState(null, '', '#' + pages[selected].id);
    if (focus) {
      title.focus({ preventScroll: true });
      book.querySelector('.k-spread').scrollIntoView({ block: 'start', behavior: motion.matches ? 'auto' : 'smooth' });
    }
  }
  pages.forEach(function (recipe, i) {
    var li = el('li'), button = el('button');
    button.type = 'button'; button.dataset.recipe = recipe.id;
    button.append(el('span', 'k-index-number', String(i + 1).padStart(2, '0')), el('span', '', recipe.title));
    button.addEventListener('click', function () { choose(i, true, true); });
    li.append(button); index.append(li);
  });
  book.querySelector('[data-previous-recipe]').addEventListener('click', function () { choose(selected - 1, true, true); });
  book.querySelector('[data-next-recipe]').addEventListener('click', function () { choose(selected + 1, true, true); });
  book.querySelector('[data-open-favorite]').addEventListener('click', function () { choose(0, true, true); });
  data.drinks.forEach(function (drink) {
    var card = el('article', 'k-drink'); card.id = drink.id;
    var picture = el('img'); picture.src = 'assets/art/kitchen/' + drink.image + '.svg'; picture.alt = drink.alt;
    picture.width = 440; picture.height = 330; picture.loading = 'lazy';
    card.append(el('span', 'k-drink-label hand', drink.label), el('h3', '', drink.title), picture, el('p', '', drink.description));
    card.append(el('p', 'k-drink-note hand', drink.note));
    document.querySelector('[data-drink-menu]').append(card);
  });
  data.confessions.forEach(function (entry) {
    var note = el('article', 'k-confession'); note.append(el('h3', 'hand', entry[0]), el('p', '', entry[1]));
    document.querySelector('[data-kitchen-confessions]').append(note);
  });
  data.opinions.forEach(function (entry) {
    var item = el('li'); item.append(el('strong', 'hand', entry[0]), el('span', '', entry[1]));
    document.querySelector('[data-food-opinions]').append(item);
  });
  function fromHash() {
    var id = location.hash.slice(1);
    var i = pages.findIndex(function (recipe) { return recipe.id === id; });
    if (i >= 0) choose(i, false, false);
    var drink = data.drinks.find(function (entry) { return entry.id === id; });
    if (drink) document.getElementById(drink.id).scrollIntoView({ block: 'center', behavior: motion.matches ? 'auto' : 'smooth' });
  }
  choose(0, false, false); fromHash();
  window.addEventListener('hashchange', fromHash);
})();
