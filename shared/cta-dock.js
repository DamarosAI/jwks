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

  var cta = document.querySelector('.j-top .j-cta');
  var endCap = document.querySelector('.cap--end');
  if (!cta || !endCap) return;
  var target = endCap.querySelector('.j-btn') || endCap.querySelector('.j-cta-row');
  if (!target) return;

  var docked = false;

  function dock() {
    if (getComputedStyle(cta).display === 'none') return; // hidden on mobile
    // reset any existing dock transform so we measure the button's true home
    cta.style.transition = 'none';
    cta.style.transform = '';
    var a = cta.getBoundingClientRect();
    var b = target.getBoundingClientRect();
    if (!b.width || !b.height) return;
    var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    var dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    var scale = b.height / a.height;
    endCap.classList.add('cta-docked');
    // force the reset to commit, then animate to the docked transform
    void cta.offsetWidth;
    cta.style.transition = 'transform .72s cubic-bezier(.62,0,.2,1)';
    cta.classList.add('is-docked');
    cta.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')';
    docked = true;
  }

  function undock() {
    if (!docked) return;
    docked = false;
    cta.style.transition = 'transform .55s cubic-bezier(.62,0,.2,1)';
    cta.classList.remove('is-docked');
    cta.style.transform = '';
    endCap.classList.remove('cta-docked');
    var clear = function () { cta.style.transition = ''; cta.removeEventListener('transitionend', clear); };
    cta.addEventListener('transitionend', clear);
  }

  function sync() {
    if (endCap.classList.contains('cap--active')) {
      requestAnimationFrame(function () { requestAnimationFrame(dock); });
    } else {
      undock();
    }
  }

  new MutationObserver(sync).observe(endCap, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', function () { if (docked) dock(); });
  sync();
})();
