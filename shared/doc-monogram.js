(function () {
  var grid = document.querySelector('.mono-grid[data-mono-src]');
  if (!grid) return;
  var full = grid.closest('.mono-bg--full');
  if (!full) return;
  var src = grid.getAttribute('data-mono-src');
  function syncClip() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var fullTop = full.getBoundingClientRect().top;
        var gridRect = grid.getBoundingClientRect();
        var clipH = Math.ceil(gridRect.bottom - fullTop + 2);
        if (clipH > 0) full.style.setProperty('--mono-field-h', clipH + 'px');
      });
    });
  }

  function layout() {
    var mob = window.matchMedia('(max-width: 900px)').matches;
    var CELL = 84;
    var GAP = mob ? 22 : 26;
    var ROW = CELL + GAP;
    var TARGET = window.innerHeight * 0.5;
    var rows = Math.max(1, Math.floor((TARGET + GAP) / ROW));
    var fieldW = full.clientWidth || window.innerWidth;
    var cols = Math.ceil((fieldW * 1.08) / ROW) + 1;

    full.style.setProperty('--mono-gap', GAP + 'px');
    full.style.setProperty('--mono-rows', String(rows));
    grid.style.setProperty('--mono-cols', String(cols));
    grid.style.setProperty('--mono-rows', String(rows));
    grid.style.gridTemplateColumns = 'repeat(' + cols + ', ' + CELL + 'px)';
    grid.style.gridTemplateRows = 'repeat(' + rows + ', ' + CELL + 'px)';

    var need = rows * cols;
    while (grid.children.length > need) grid.lastChild.remove();
    while (grid.children.length < need) {
      var im = document.createElement('img');
      im.src = src;
      im.alt = '';
      im.decoding = 'async';
      grid.appendChild(im);
    }

    syncClip();
  }

  layout();
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(layout, 150);
  });
})();
