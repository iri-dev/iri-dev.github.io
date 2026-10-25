(function () {
  var roots = document.querySelectorAll('[data-screenshot-gallery]');
  if (!roots.length) return;

  var viewer = document.createElement('dialog');
  viewer.className = 'sg-viewer';
  viewer.setAttribute('aria-labelledby', 'sg-viewer-title');
  viewer.innerHTML = '<header class="sg-viewer-header"><div><p class="sg-count" data-viewer-count></p><h2 id="sg-viewer-title"></h2></div><button class="sg-viewer-close" type="button" aria-label="Close screenshot viewer">Close ×</button></header><div class="sg-viewer-viewport" tabindex="0" role="region" aria-label="Enlarged screenshot"><img alt=""></div><footer class="sg-viewer-footer"><div class="sg-viewer-nav" role="group" aria-label="Browse enlarged screenshots"><button type="button" data-viewer-prev aria-label="Previous screenshot">← Previous</button><button type="button" data-viewer-next aria-label="Next screenshot">Next →</button></div><button type="button" data-viewer-zoom aria-pressed="false">Original size</button><a data-viewer-file target="_blank" rel="noopener">Open image ↗</a><p data-viewer-caption></p></footer>';
  var supportsViewer = typeof viewer.showModal === 'function';
  if (supportsViewer) document.body.appendChild(viewer);
  var viewport = viewer.querySelector('.sg-viewer-viewport');
  var large = viewport.querySelector('img');
  var zoomButton = viewer.querySelector('[data-viewer-zoom]');
  var activeGallery, opener, zoomed = false, previousOverflow;

  function zoom(on) {
    zoomed = on;
    viewer.classList.toggle('is-zoomed', on);
    zoomButton.setAttribute('aria-pressed', String(on));
    zoomButton.textContent = on ? 'Fit to window' : 'Original size';
    viewport.setAttribute('aria-label', on ? 'Original-size screenshot. Scroll to explore the image.' : 'Enlarged screenshot');
    viewport.scrollTop = 0;
    viewport.scrollLeft = 0;
  }
  function showViewer() {
    var item = activeGallery.current();
    zoom(false);
    large.src = item.src;
    large.alt = item.alt;
    large.width = item.width;
    large.height = item.height;
    large.style.setProperty('--sg-original-width', item.width + 'px');
    viewer.querySelector('#sg-viewer-title').textContent = item.title;
    viewer.querySelector('[data-viewer-count]').textContent = activeGallery.count();
    viewer.querySelector('[data-viewer-caption]').textContent = item.caption;
    viewer.querySelector('[data-viewer-file]').href = item.src;
  }
  viewer.querySelector('.sg-viewer-close').addEventListener('click', function () { viewer.close(); });
  viewer.querySelector('[data-viewer-prev]').addEventListener('click', function () { activeGallery.step(-1); });
  viewer.querySelector('[data-viewer-next]').addEventListener('click', function () { activeGallery.step(1); });
  zoomButton.addEventListener('click', function () { zoom(!zoomed); if (zoomed) viewport.focus(); });
  viewer.addEventListener('keydown', function (event) {
    if (zoomed || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); activeGallery.step(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); activeGallery.select(event.key === 'Home' ? 0 : activeGallery.length - 1);
    }
  });
  viewer.addEventListener('click', function (event) { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('close', function () {
    document.body.style.overflow = previousOverflow;
    if (opener && opener.isConnected) opener.focus({preventScroll:true});
  });

  roots.forEach(function (root) {
    var links = Array.from(root.querySelectorAll('[data-screenshot-choice]'));
    var items = links.map(function (link) {
      return {src:link.href, title:link.dataset.title, caption:link.dataset.caption, alt:link.dataset.alt, width:Number(link.dataset.width), height:Number(link.dataset.height)};
    });
    if (!items.length) return;
    var index = 0, buttons = [];
    var image = root.querySelector('[data-screenshot-image]');
    var openLink = root.querySelector('[data-screenshot-open]');
    var gallery = {
      length: items.length,
      current: function () { return items[index]; },
      count: function () { return 'Screenshot ' + (index + 1) + ' of ' + items.length; },
      select: function (next) {
        index = (next + items.length) % items.length;
        var item = items[index];
        image.src = item.src; image.alt = item.alt; image.width = item.width; image.height = item.height;
        openLink.href = item.src;
        openLink.setAttribute('aria-label', 'View ' + item.title + ' at full size');
        root.querySelector('[data-screenshot-title]').textContent = item.title;
        root.querySelector('[data-screenshot-caption]').textContent = item.caption;
        root.querySelector('[data-screenshot-count]').textContent = gallery.count();
        buttons.forEach(function (button,i) { button.setAttribute('aria-pressed', String(i === index)); });
        if (viewer.open && activeGallery === gallery) showViewer();
      },
      step: function (direction) { gallery.select(index + direction); }
    };
    links.forEach(function (link,i) {
      var button = document.createElement('button');
      button.type = 'button'; button.className = link.className;
      button.setAttribute('aria-pressed', String(i === index));
      button.setAttribute('aria-controls', root.querySelector('figure').id);
      button.setAttribute('aria-label', 'Show ' + items[i].title);
      button.append.apply(button, Array.from(link.childNodes));
      button.addEventListener('click', function () { gallery.select(i); });
      button.addEventListener('keydown', function (event) {
        var next = {ArrowRight:i+1, ArrowLeft:i-1, Home:0, End:items.length-1}[event.key];
        if (next === undefined || event.altKey || event.ctrlKey || event.metaKey) return;
        event.preventDefault(); gallery.select(next); buttons[index].focus();
      });
      link.replaceWith(button); buttons.push(button);
    });
    openLink.addEventListener('click', function (event) {
      if (!supportsViewer || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); activeGallery = gallery; opener = openLink;
      showViewer(); previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
      viewer.showModal(); viewer.querySelector('.sg-viewer-close').focus();
    });
    gallery.select(0);
  });
})();
