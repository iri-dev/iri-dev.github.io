(function () {
  var root = document.querySelector('.hair-diary'), data = window.HAIR_DIARY;
  if (!root || !data || !window.BEAUTY) return;
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function photo(id, label, note) {
    var p = window.BEAUTY.photos.find(function (item) { return item.id === id; });
    var figure = el('figure','hf-photo');
    var button = el('button'); button.type = 'button'; button.dataset.beautyPhoto = id;
    button.setAttribute('aria-label', label + ' — open inspiration and photography credit');
    var image = el('img'); image.src = p.thumb || 'assets/img/beauty/' + id + '-sm.webp';
    image.alt = p.alt; image.width = 460; image.height = 575; image.loading = 'lazy'; image.decoding = 'async';
    button.append(image);
    var caption = el('figcaption'); caption.append(el('span','hf-photo-label',label));
    if (note) caption.append(el('p','hf-photo-note',note));
    var credit = el('a','hf-credit',p.by + ' / ' + (p.source || 'Pexels'));
    credit.href = p.page; credit.target = '_blank'; credit.rel = 'noopener';
    caption.append(credit); figure.append(button,caption); return figure;
  }
  root.querySelector('[data-hair-current-photo]').append(photo('4584409','my texture inspiration',"This model's hair is longer than mine. I'm saving the softness and movement."));
  data.looks.forEach(function (look) { root.querySelector('[data-hair-looks]').append(photo(look.photo,look.name,look.note)); });
  data.colors.forEach(function (color) {
    var card = el('article','hf-color-note');
    card.append(photo(color.photo,color.name));
    var swatch = el('span','hf-swatch'); swatch.style.backgroundColor = color.shade; swatch.setAttribute('aria-hidden','true');
    card.append(swatch,el('p','hf-color-opinion',color.note));
    if (color.reference) card.append(el('p','hf-small',color.reference));
    root.querySelector('[data-hair-color-notes]').append(card);
  });
  data.thoughts.forEach(function (thought,i) { root.querySelector('[data-hair-thoughts]').append(el('p','note '+['pink','sky','lilac','mint','peach'][i],thought)); });
  function openFolder() {
    var target = document.getElementById(location.hash.slice(1));
    if (target && target.closest('.hf-folder')) root.querySelector('.hf-folder').open = true;
  }
  openFolder(); window.addEventListener('hashchange',openFolder);
})();
