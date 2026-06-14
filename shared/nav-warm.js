/* Sync head script: warm fast path only for in-session link navigations (not reload). */
(function () {
  var d = document.documentElement;
  var warm = false;
  var isReload = false;
  try {
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (nav && nav.type === 'reload') isReload = true;
    /* Legacy Navigation Timing — still sync in head when nav entry is missing (mobile WebViews). */
    if (performance.navigation && performance.navigation.type === 1) isReload = true;
    if (isReload) {
      sessionStorage.removeItem('damaros-warm');
    } else if ((!nav || nav.type === 'navigate') && sessionStorage.getItem('damaros-warm') === '1') {
      warm = true;
    }
  } catch (e) { /* private mode */ }
  if (warm) d.classList.add('nav-warm');
  d.classList.add('page-enter');
})();
