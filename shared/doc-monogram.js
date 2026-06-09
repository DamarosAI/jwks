(function () {
  var grid = document.querySelector('.mono-grid[data-mono-src]');
  if (!grid || grid.children.length) return;
  var src = grid.getAttribute('data-mono-src');
  var full = grid.closest('.mono-bg--full');
  var count = full
    ? Math.max(220, Math.ceil((window.innerWidth * window.innerHeight * 1.45) / 12000))
    : 90;
  for (var i = 0; i < count; i++) {
    var im = document.createElement('img');
    im.src = src;
    im.alt = '';
    im.loading = 'lazy';
    im.decoding = 'async';
    grid.appendChild(im);
  }
})();
