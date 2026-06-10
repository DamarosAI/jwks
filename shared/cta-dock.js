/* ============================================================
 * Damaros — CTA dock.
 * On the closing station, the top-right "Get in Touch" button flies cleanly
 * from the header into the center of the screen, taking the place of the
 * closing section's own CTA (which steps aside). FLIP-style: we measure the
 * delta to the target slot and animate a single transform — no layout thrash.
 * Reverses when you leave the final station.
 * ============================================================ */
(function () {
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (RM) return;

  var cta = document.querySelector('.j-top .dmx-nav-cta');
  var endCap = document.querySelector('.cap--end');
  if (!cta || !endCap) return;
  var slot = endCap.querySelector('.j-cta-dock-slot');
  if (!slot) return;
  var slotRow = slot.closest('.cap-line');

  var docked = false;
  var DOCK_MS = 575;
  var UNDOCK_MS = 310;
  var dockRetry = null;
  var syncQueued = false;

  function slotReady() {
    return endCap.classList.contains('cap--active')
      && slotRow
      && slotRow.classList.contains('on');
  }

  function shouldDock() {
    return document.body.dataset.station === '9'
      && !document.body.classList.contains('end-hold')
      && slotReady();
  }

  function dock(attempts) {
    if (dockRetry) { clearTimeout(dockRetry); dockRetry = null; }
    if (getComputedStyle(cta).display === 'none') return;
    if (!shouldDock()) return;
    cta.style.transition = 'none';
    cta.style.transform = '';
    var a = cta.getBoundingClientRect();
    var b = slot.getBoundingClientRect();
    if ((!b.width || !b.height) && attempts > 0) {
      dockRetry = setTimeout(function () { dock(attempts - 1); }, 48);
      return;
    }
    if (!b.width || !b.height) return;
    var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    var dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    var scale = b.height / a.height;
    endCap.classList.add('cta-docked');
    document.body.classList.add('cta-docked');
    void cta.offsetWidth;
    cta.style.transition = 'transform ' + DOCK_MS + 'ms cubic-bezier(.62,0,.2,1)';
    cta.classList.add('is-docked');
    cta.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')';
    docked = true;
  }

  function undock() {
    if (dockRetry) { clearTimeout(dockRetry); dockRetry = null; }
    if (!docked) return;
    docked = false;
    cta.style.transition = 'transform ' + UNDOCK_MS + 'ms cubic-bezier(.62,0,.2,1)';
    cta.classList.remove('is-docked');
    cta.style.transform = '';
    endCap.classList.remove('cta-docked');
    document.body.classList.remove('cta-docked');
    var clear = function () { cta.style.transition = ''; cta.removeEventListener('transitionend', clear); };
    cta.addEventListener('transitionend', clear);
  }

  function sync() {
    if (shouldDock()) {
      requestAnimationFrame(function () { requestAnimationFrame(function () { dock(12); }); });
    } else if (docked) {
      undock();
    }
  }

  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(function () {
      syncQueued = false;
      sync();
    });
  }

  new MutationObserver(queueSync).observe(document.body, { attributes: true, attributeFilter: ['data-station', 'class'] });
  new MutationObserver(queueSync).observe(endCap, { attributes: true, attributeFilter: ['class'] });
  if (slotRow) {
    new MutationObserver(queueSync).observe(slotRow, { attributes: true, attributeFilter: ['class'] });
  }
  window.addEventListener('resize', function () { if (docked) dock(4); });
  queueSync();
})();
